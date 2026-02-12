const jwt = require('jsonwebtoken');
const { User, UserPreference } = require('../models');
const { Op } = require('sequelize');

/**
 * Register a new user
 */
async function register(req, res) {
    try {
        const { username, email, password, profile_picture_url } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email or username already exists' });
        }

        // Create new user (password will be hashed by the model hook)
        const user = await User.create({
            username,
            email,
            password_hash: password,
            profile_picture_url
        });

        // Create default user preferences
        await UserPreference.create({
            user_id: user.id,
            preferred_genres: [],
            preferred_languages: [],
            min_year: null,
            max_year: null
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_picture_url: user.profile_picture_url,
                preferences: { // Return empty preferences for new user
                    preferred_genres: [],
                    preferred_languages: [],
                    min_year: null,
                    max_year: null
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}

/**
 * Login user
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Fetch user preferences
        const preferences = await UserPreference.findOne({ where: { user_id: user.id } });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_picture_url: user.profile_picture_url,
                preferences: preferences ? {
                    preferred_genres: preferences.preferred_genres,
                    preferred_languages: preferences.preferred_languages,
                    min_year: preferences.min_year,
                    max_year: preferences.max_year
                } : null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        // Find user
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch user preferences
        const preferences = await UserPreference.findOne({ where: { user_id: userId } });

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile_picture_url: user.profile_picture_url,
                preferences: preferences ? {
                    preferred_genres: preferences.preferred_genres,
                    preferred_languages: preferences.preferred_languages,
                    min_year: preferences.min_year,
                    max_year: preferences.max_year
                } : null
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

module.exports = {
    register,
    login,
    getProfile
};
