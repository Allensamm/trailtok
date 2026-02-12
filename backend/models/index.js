const sequelize = require('../config/database');
const User = require('./User');
const UserPreference = require('./UserPreference');
const Like = require('./Like');
const Comment = require('./Comment');
const WatchedMovie = require('./WatchedMovie');

// Define associations
User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preferences' });
UserPreference.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WatchedMovie, { foreignKey: 'user_id', as: 'watchedMovies' });
WatchedMovie.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    UserPreference,
    Like,
    Comment,
    WatchedMovie
};
