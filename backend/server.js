require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const dns = require('dns');
const { URL } = require('url');

// Import routes
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
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

// Database connection and server start
// Database connection and server start
async function startServer() {
    let retries = 20;
    while (retries > 0) {
        try {
                // Debug: print DATABASE_URL and DNS resolution to help diagnose ENETUNREACH
                console.log('DATABASE_URL:', process.env.DATABASE_URL);
                try {
                    const dbUrl = new URL(process.env.DATABASE_URL);
                    const dbHost = dbUrl.hostname;
                    const dbPort = dbUrl.port || '5432';
                    console.log(`Resolving ${dbHost} (port ${dbPort})...`);
                    dns.lookup(dbHost, { all: true }, (err, addresses) => {
                        if (err) console.error('dns.lookup error:', err);
                        else console.log('dns.lookup addresses:', addresses);
                    });
                    dns.resolve4(dbHost, (err, addrs) => {
                        if (err) console.error('dns.resolve4 error:', err);
                        else console.log('dns.resolve4:', addrs);
                    });
                    dns.resolve6(dbHost, (err, addrs) => {
                        if (err) console.error('dns.resolve6 error:', err);
                        else console.log('dns.resolve6:', addrs);
                    });
                    console.log(`Connecting to database... (Attempt ${21 - retries}/20)`);
                } catch (e) {
                    console.error('Error parsing DATABASE_URL for debug:', e.message);
                }

                await sequelize.authenticate();
            console.log('✓ Database connection established successfully');
            break;
        } catch (error) {
            console.error(`✗ Database connection failed: ${error.message}`);
            retries--;
            if (retries === 0) {
                console.error('✗ Failed to connect to database after 20 attempts. Exiting...');
                process.exit(1);
            }
            console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    try {
        // Sync models with database
        // Use verify: false or simply sync to be safe, alter: true is good for dev
        await sequelize.sync({ alter: true });
        console.log('✓ Database models synchronized');

        // Start server
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('✗ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
