# Movie Discovery App - Quick Start Guide

## Prerequisites
- Node.js installed
- PostgreSQL database (using Supabase)
- TMDb API key
- Expo Go app on your phone (iOS/Android)

## Setup Steps

### 1. Get TMDb API Key
1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Navigate to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### 2. Configure Backend
1. Open `backend/.env`
2. Replace `TMDB_API_KEY=your_tmdb_api_key_here` with your actual API key
3. Verify `DATABASE_URL` is set to your Supabase connection string

### 3. Start Backend Server
```bash
cd backend
npm start
```
The server should start on `http://localhost:5000`

### 4. Update Frontend API URL (if needed)
If your computer's IP address has changed:
1. Find your local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` (look for inet)
2. Update `frontend/services/api.js`:
   ```javascript
   baseURL: 'http://YOUR_IP_ADDRESS:5000/api'
   ```

### 5. Start Frontend
```bash
cd frontend
npx expo start
```

### 6. Run on Your Device
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in your terminal
3. The app will load on your device

## Testing the App

### First Time User Flow:
1. **Register**: Create a new account
2. **Genre Selection**: Select at least 3 genres
3. **Feed**: Browse personalized movie recommendations
4. **Interactions**:
   - ❤️ Like a movie
   - 💬 Comment on a movie
   - ✅ Mark as watched
   - 🔗 Share with friends
5. **Profile**: View your watched and liked movies

### Existing User Flow:
1. **Login**: Use your credentials
2. **Feed**: Start browsing immediately (preferences already set)

## Troubleshooting

### Backend won't start
- **Port in use**: Kill the process using port 5000
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /F /PID <PID>
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill
  ```
- **Database connection error**: Verify Supabase credentials in `.env`

### Frontend won't connect to backend
- Ensure backend is running
- Check that your phone and computer are on the same WiFi network
- Verify the IP address in `frontend/services/api.js` matches your computer's IP

### No movies showing in feed
- Verify TMDb API key is correct in `backend/.env`
- Check backend console for errors
- Ensure you've selected genres in onboarding

### Expo errors
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Current Limitations

1. **No TMDb API Key**: Movies won't load until you add your API key
2. **Video Playback**: Not yet implemented (coming soon)
3. **Local Network Only**: App only works on same WiFi as your computer

## Next Steps

Once you've tested the basic functionality:
1. Add video trailer playback
2. Implement search functionality
3. Add more preference options (language, era)
4. Deploy backend to production (Render, Railway, etc.)
5. Build standalone app with Expo EAS

## Support

If you encounter issues:
1. Check the console logs (both backend and frontend)
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Try restarting both servers
