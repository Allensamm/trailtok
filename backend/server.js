require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

let dbConnected = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint - THIS MUST WORK EVEN IF DB IS DOWN
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        database: dbConnected ? 'connected' : 'connecting...'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server immediately
const server = app.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
});

// Connect to database in background (don't block server startup)
async function connectDatabase() {
    let retries = 20;
    while (retries > 0) {
        try {
            console.log(`Connecting to database... (Attempt ${21 - retries}/20)`);
            await sequelize.authenticate();
            console.log('✓ Database connection established successfully');
            dbConnected = true;
            
            // Sync models with database
            await sequelize.sync({ alter: true });
            console.log('✓ Database models synchronized');
            break;
        } catch (error) {
            console.error(`✗ Database connection failed: ${error.message}`);
            retries--;
            if (retries === 0) {
                console.error('✗ Failed to connect to database after 20 attempts.');
                console.error('✗ Server will continue running but database features will not work.');
                // Don't exit - let the server keep running
                break;
            }
            console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Start database connection in background
connectDatabase();

module.exports = app;
