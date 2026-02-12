# Movie Discovery Backend API

Complete backend API for a movie discovery application built with Node.js, Express, PostgreSQL, and TMDb API integration.

## Features

- User authentication with JWT
- Personalized movie recommendations based on user preferences
- Like/unlike movies
- Comment on movies
- Track watched movies
- User preference management (genres, languages, year range)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **External API**: TMDb (The Movie Database)

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- TMDb API key (get it from https://www.themoviedb.org/settings/api)

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movie_discovery_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# TMDb API Configuration
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE movie_discovery_db;
```

The tables will be created automatically when you start the server.

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "profile_picture_url": "https://example.com/avatar.jpg" (optional)
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Movies (All require authentication)

#### Get Personalized Feed
```
GET /api/movies/feed?page=1
Authorization: Bearer <token>
```

#### Get Movie Details
```
GET /api/movies/:tmdbId
Authorization: Bearer <token>
```

#### Like Movie
```
POST /api/movies/:tmdbId/like
Authorization: Bearer <token>
```

#### Unlike Movie
```
DELETE /api/movies/:tmdbId/like
Authorization: Bearer <token>
```

#### Add Comment
```
POST /api/movies/:tmdbId/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment_text": "Great movie!"
}
```

#### Mark as Watched
```
POST /api/movies/:tmdbId/watched
Authorization: Bearer <token>
```

### User Preferences (Requires authentication)

#### Update Preferences
```
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferred_genres": [28, 12, 878],
  "preferred_languages": ["en", "es"],
  "min_year": 2000,
  "max_year": 2024
}
```

## Database Schema

### Users
- id (PK)
- username (unique)
- email (unique)
- password_hash
- profile_picture_url
- createdAt
- updatedAt

### UserPreferences
- id (PK)
- user_id (FK → users.id)
- preferred_genres (array)
- preferred_languages (array)
- min_year
- max_year
- createdAt
- updatedAt

### Likes
- id (PK)
- user_id (FK → users.id)
- tmdb_movie_id
- created_at

### Comments
- id (PK)
- user_id (FK → users.id)
- tmdb_movie_id
- comment_text
- created_at

### WatchedMovies
- id (PK)
- user_id (FK → users.id)
- tmdb_movie_id
- watched_at

## Project Structure

```
backend/
├── config/
│   └── database.js          # Sequelize configuration
├── models/
│   ├── index.js             # Model associations
│   ├── User.js
│   ├── UserPreference.js
│   ├── Like.js
│   ├── Comment.js
│   └── WatchedMovie.js
├── controllers/
│   ├── authController.js    # Register, login
│   ├── moviesController.js  # Movie operations
│   └── usersController.js   # User preferences
├── routes/
│   ├── auth.js
│   ├── movies.js
│   └── users.js
├── services/
│   └── tmdbService.js       # TMDb API integration
├── middleware/
│   └── auth.js              # JWT authentication
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Main application file
```

## License

ISC
