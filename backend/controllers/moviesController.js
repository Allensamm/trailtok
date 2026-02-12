const { UserPreference, Like, Comment, WatchedMovie, User } = require('../models');
const tmdbService = require('../services/tmdbService');
const ytdl = require('@distube/ytdl-core');

/**
 * Get personalized movie feed
 */
async function getFeed(req, res) {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;

        // Get user preferences
        const preferences = await UserPreference.findOne({ where: { user_id: userId } });

        // Fetch movies from TMDb
        const moviesData = await tmdbService.getPersonalizedMovies(preferences, page);

        res.status(200).json({
            page: moviesData.page,
            total_pages: moviesData.total_pages,
            total_results: moviesData.total_results,
            results: moviesData.results
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Failed to fetch movie feed' });
    }
}

/**
 * Get movie details with user-specific data
 */
async function getMovieDetails(req, res) {
    try {
        const userId = req.user.id;
        const tmdbId = parseInt(req.params.tmdbId);

        // Fetch movie details from TMDb
        const movieDetails = await tmdbService.getMovieDetails(tmdbId);

        // Check if user has liked this movie
        const like = await Like.findOne({
            where: { user_id: userId, tmdb_movie_id: tmdbId }
        });

        // Check if user has watched this movie
        const watched = await WatchedMovie.findOne({
            where: { user_id: userId, tmdb_movie_id: tmdbId }
        });

        // Get all comments for this movie
        const comments = await Comment.findAll({
            where: { tmdb_movie_id: tmdbId },
            include: [{
                model: User,
                attributes: ['id', 'username', 'profile_picture_url']
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            ...movieDetails,
            user_data: {
                liked: !!like,
                watched: !!watched,
                comments: comments.map(c => ({
                    id: c.id,
                    comment_text: c.comment_text,
                    created_at: c.created_at,
                    user: {
                        id: c.User.id,
                        username: c.User.username,
                        profile_picture_url: c.User.profile_picture_url
                    }
                }))
            }
        });
    } catch (error) {
        console.error('Get movie details error:', error);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
}

/**
 * Like a movie
 */
async function likeMovie(req, res) {
    try {
        const userId = req.user.id;
        const tmdbId = parseInt(req.params.tmdbId);

        // Check if already liked
        const existingLike = await Like.findOne({
            where: { user_id: userId, tmdb_movie_id: tmdbId }
        });

        if (existingLike) {
            return res.status(409).json({ error: 'Movie already liked' });
        }

        // Create like
        await Like.create({
            user_id: userId,
            tmdb_movie_id: tmdbId
        });

        res.status(201).json({ message: 'Movie liked successfully' });
    } catch (error) {
        console.error('Like movie error:', error);
        res.status(500).json({ error: 'Failed to like movie' });
    }
}

/**
 * Unlike a movie
 */
async function unlikeMovie(req, res) {
    try {
        const userId = req.user.id;
        const tmdbId = parseInt(req.params.tmdbId);

        // Find and delete like
        const deleted = await Like.destroy({
            where: { user_id: userId, tmdb_movie_id: tmdbId }
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Like not found' });
        }

        res.status(200).json({ message: 'Movie unliked successfully' });
    } catch (error) {
        console.error('Unlike movie error:', error);
        res.status(500).json({ error: 'Failed to unlike movie' });
    }
}

/**
 * Add comment to a movie
 */
async function addComment(req, res) {
    try {
        const userId = req.user.id;
        const tmdbId = parseInt(req.params.tmdbId);
        const { comment_text } = req.body;

        if (!comment_text || comment_text.trim().length === 0) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        // Create comment
        const comment = await Comment.create({
            user_id: userId,
            tmdb_movie_id: tmdbId,
            comment_text: comment_text.trim()
        });

        // Get user info for response
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'profile_picture_url']
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                id: comment.id,
                comment_text: comment.comment_text,
                created_at: comment.created_at,
                user: {
                    id: user.id,
                    username: user.username,
                    profile_picture_url: user.profile_picture_url
                }
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
}

/**
 * Mark movie as watched
 */
async function markAsWatched(req, res) {
    try {
        const userId = req.user.id;
        const tmdbId = parseInt(req.params.tmdbId);

        // Check if already watched
        const existingWatch = await WatchedMovie.findOne({
            where: { user_id: userId, tmdb_movie_id: tmdbId }
        });

        if (existingWatch) {
            return res.status(409).json({ error: 'Movie already marked as watched' });
        }

        // Create watched record
        await WatchedMovie.create({
            user_id: userId,
            tmdb_movie_id: tmdbId
        });

        res.status(201).json({ message: 'Movie marked as watched successfully' });
    } catch (error) {
        console.error('Mark as watched error:', error);
        res.status(500).json({ error: 'Failed to mark movie as watched' });
    }
}

// Simple in-memory cache for stream URLs (expires after 4 hours)
const streamCache = new Map();
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Get direct video stream URL - OPTIMIZED with better format selection
 */
async function getStream(req, res) {
    try {
        const tmdbId = req.params.tmdbId;

        // Check cache first
        const cached = streamCache.get(tmdbId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`✓ Cache hit for movie ${tmdbId}`);
            return res.status(200).json(cached.data);
        }

        // Get movie details to find YouTube ID
        const movieDetails = await tmdbService.getMovieDetails(tmdbId);
        const videos = movieDetails.videos?.results || [];
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos[0];

        if (!trailer || trailer.site !== 'YouTube') {
            return res.status(404).json({ error: 'No YouTube trailer found' });
        }

        const videoUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

        // Get video info with optimized settings
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }
        });

        // OPTIMIZED: Find best format with audio+video (prioritize medium quality for reliability)
        let format = null;

        // Try 480p first (most reliable)
        format = info.formats.find(f =>
            f.hasVideo && f.hasAudio && f.height === 480 && f.container === 'mp4'
        );

        // Try 360p (very reliable)
        if (!format) {
            format = info.formats.find(f =>
                f.hasVideo && f.hasAudio && f.height === 360
            );
        }

        // Try 720p if available
        if (!format) {
            format = info.formats.find(f =>
                f.hasVideo && f.hasAudio && f.height === 720 && f.container === 'mp4'
            );
        }

        // Any format with both audio and video
        if (!format) {
            format = info.formats.find(f => f.hasVideo && f.hasAudio);
        }

        // Fallback: use ytdl's chooser
        if (!format) {
            format = ytdl.chooseFormat(info.formats, {
                quality: 'highest',
                filter: 'audioandvideo'
            });
        }

        if (format && format.url) {
            const quality = format.qualityLabel || `${format.height}p`;
            const bitrate = format.bitrate ? Math.round(format.bitrate / 1000) + 'K' : 'unknown';
            console.log(`✓ Selected format for ${tmdbId}: ${quality} @ ${bitrate}`);

            const result = {
                streamUrl: format.url,
                quality: quality,
                bitrate: format.bitrate,
                type: 'direct'
            };

            // Cache the result
            streamCache.set(tmdbId, {
                data: result,
                timestamp: Date.now()
            });

            // Clean old cache entries (keep max 100)
            if (streamCache.size > 100) {
                const firstKey = streamCache.keys().next().value;
                streamCache.delete(firstKey);
            }

            return res.status(200).json(result);
        } else {
            return res.status(404).json({ error: 'No suitable stream found' });
        }
    } catch (error) {
        console.error(`✗ Stream extraction error for ${req.params.tmdbId}:`, error.message);
        res.status(500).json({ error: 'Failed to extract stream' });
    }
}

module.exports = {
    getFeed,
    getMovieDetails,
    likeMovie,
    unlikeMovie,
    addComment,
    markAsWatched,
    getStream
};
