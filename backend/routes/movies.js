const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');
const { authenticateToken } = require('../middleware/auth');

// All movie routes require authentication
router.use(authenticateToken);

// GET /api/movies/feed - Get personalized movie feed
router.get('/feed', moviesController.getFeed);

// GET /api/movies/:tmdbId - Get movie details
router.get('/:tmdbId', moviesController.getMovieDetails);

// POST /api/movies/:tmdbId/like - Like a movie
router.post('/:tmdbId/like', moviesController.likeMovie);

// DELETE /api/movies/:tmdbId/like - Unlike a movie
router.delete('/:tmdbId/like', moviesController.unlikeMovie);

// POST /api/movies/:tmdbId/comment - Add comment to movie
router.post('/:tmdbId/comment', moviesController.addComment);

// POST /api/movies/:tmdbId/watched - Mark movie as watched
router.post('/:tmdbId/watched', moviesController.markAsWatched);

// GET /api/movies/:tmdbId/stream - Get native video stream
router.get('/:tmdbId/stream', moviesController.getStream);

module.exports = router;
