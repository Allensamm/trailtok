const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WatchedMovie = sequelize.define('WatchedMovie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    tmdb_movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    watched_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'watched_movies',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'tmdb_movie_id']
        }
    ]
});

module.exports = WatchedMovie;
