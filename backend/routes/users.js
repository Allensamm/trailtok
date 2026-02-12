const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', usersController.updatePreferences);

// GET /api/users/:userId/watched - Get user's watched movies
router.get('/:userId/watched', usersController.getWatchedMovies);

// GET /api/users/:userId/liked - Get user's liked movies
router.get('/:userId/liked', usersController.getLikedMovies);

module.exports = router;
