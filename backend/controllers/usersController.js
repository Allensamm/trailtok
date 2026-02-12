const { UserPreference } = require('../models');

/**
 * Update user preferences
 */
async function updatePreferences(req, res) {
    try {
        const userId = req.user.id;
        const { preferred_genres, preferred_languages, min_year, max_year } = req.body;

        // Find or create user preferences
        let preferences = await UserPreference.findOne({ where: { user_id: userId } });

        if (preferences) {
            // Update existing preferences
            await preferences.update({
                preferred_genres: preferred_genres !== undefined ? preferred_genres : preferences.preferred_genres,
                preferred_languages: preferred_languages !== undefined ? preferred_languages : preferences.preferred_languages,
                min_year: min_year !== undefined ? min_year : preferences.min_year,
                max_year: max_year !== undefined ? max_year : preferences.max_year
            });
        } else {
            // Create new preferences
            preferences = await UserPreference.create({
                user_id: userId,
                preferred_genres: preferred_genres || [],
                preferred_languages: preferred_languages || [],
                min_year: min_year || null,
                max_year: max_year || null
            });
        }

        res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: {
                preferred_genres: preferences.preferred_genres,
                preferred_languages: preferences.preferred_languages,
                min_year: preferences.min_year,
                max_year: preferences.max_year
            }
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
}

/**
 * Get user's watched movies
 */
async function getWatchedMovies(req, res) {
    try {
        const userId = req.params.userId || req.user.id;
        const { WatchedMovie } = require('../models');
        const tmdbService = require('../services/tmdbService');

        const watchedRecords = await WatchedMovie.findAll({
            where: { user_id: userId },
            order: [['watched_at', 'DESC']],
            limit: 50
        });

        // Fetch movie details from TMDb for each watched movie
        const movies = await Promise.all(
            watchedRecords.map(async (record) => {
                try {
                    const movieDetails = await tmdbService.getMovieDetails(record.tmdb_movie_id);
                    return movieDetails;
                } catch (error) {
                    console.error(`Error fetching movie ${record.tmdb_movie_id}:`, error);
                    return null;
                }
            })
        );

        res.status(200).json({
            movies: movies.filter(m => m !== null)
        });
    } catch (error) {
        console.error('Get watched movies error:', error);
        res.status(500).json({ error: 'Failed to fetch watched movies' });
    }
}

/**
 * Get user's liked movies
 */
async function getLikedMovies(req, res) {
    try {
        const userId = req.params.userId || req.user.id;
        const { Like } = require('../models');
        const tmdbService = require('../services/tmdbService');

        const likeRecords = await Like.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 50
        });

        // Fetch movie details from TMDb for each liked movie
        const movies = await Promise.all(
            likeRecords.map(async (record) => {
                try {
                    const movieDetails = await tmdbService.getMovieDetails(record.tmdb_movie_id);
                    return movieDetails;
                } catch (error) {
                    console.error(`Error fetching movie ${record.tmdb_movie_id}:`, error);
                    return null;
                }
            })
        );

        res.status(200).json({
            movies: movies.filter(m => m !== null)
        });
    } catch (error) {
        console.error('Get liked movies error:', error);
        res.status(500).json({ error: 'Failed to fetch liked movies' });
    }
}

module.exports = {
    updatePreferences,
    getWatchedMovies,
    getLikedMovies
};
