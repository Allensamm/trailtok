const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

/**
 * Get personalized movies based on user preferences
 * @param {Object} userPreferences - User's movie preferences
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} - Movie results from TMDb
 */
async function getPersonalizedMovies(userPreferences, page = 1) {
    try {
        const params = {
            api_key: TMDB_API_KEY,
            page,
            sort_by: 'popularity.desc',
            include_adult: false,
            include_video: false
        };

        // Add genre filter if preferences exist
        if (userPreferences && userPreferences.preferred_genres && userPreferences.preferred_genres.length > 0) {
            params.with_genres = userPreferences.preferred_genres.join(',');
        }

        // Add language filter if preferences exist
        if (userPreferences && userPreferences.preferred_languages && userPreferences.preferred_languages.length > 0) {
            params.with_original_language = userPreferences.preferred_languages.join('|');
        }

        // Add year range filters
        if (userPreferences && userPreferences.min_year) {
            params['primary_release_date.gte'] = `${userPreferences.min_year}-01-01`;
        }
        if (userPreferences && userPreferences.max_year) {
            params['primary_release_date.lte'] = `${userPreferences.max_year}-12-31`;
        }

        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching personalized movies:', error.message);
        throw new Error('Failed to fetch movies from TMDb');
    }
}

/**
 * Get detailed information about a specific movie
 * @param {number} tmdbMovieId - TMDb movie ID
 * @returns {Promise<Object>} - Movie details
 */
async function getMovieDetails(tmdbMovieId) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbMovieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'credits,videos'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        throw new Error('Failed to fetch movie details from TMDb');
    }
}

/**
 * Get trailers and videos for a specific movie
 * @param {number} tmdbMovieId - TMDb movie ID
 * @returns {Promise<Object>} - Movie videos/trailers
 */
async function getMovieTrailers(tmdbMovieId) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbMovieId}/videos`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching movie trailers:', error.message);
        throw new Error('Failed to fetch movie trailers from TMDb');
    }
}

/**
 * Get list of all movie genres
 * @returns {Promise<Object>} - Genre list
 */
async function getGenreList() {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching genre list:', error.message);
        throw new Error('Failed to fetch genre list from TMDb');
    }
}

module.exports = {
    getPersonalizedMovies,
    getMovieDetails,
    getMovieTrailers,
    getGenreList
};
