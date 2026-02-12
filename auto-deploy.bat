@echo off
echo 🚀 Starting Automatic Deployment of Movie App...
echo.

:: Step 1: Update package.json for production
echo 📱 Configuring frontend for production...

:: Step 2: Build APK using Expo EAS
echo 🔨 Building APK for Android...
cd frontend

:: Try to build APK without interactive prompts
npx eas build --platform android --profile preview --non-interactive --clear-cache

if %ERRORLEVEL% neq 0 (
    echo ❌ APK Build Failed!
    echo 📋 Check logs above for errors
    echo 📋 Make sure Expo CLI is properly configured
    pause
    exit /b 1
)

echo ✅ APK Build Initiated!
echo 📱 APK will be available for download from your Expo dashboard
echo 🔗 Open https://expo.dev/accounts to access builds

echo.
echo 🌐 Production Backend Deployment Instructions:
echo 1. Go to https://render.com
echo 2. Click "New Web Service"
echo 3. Connect your GitHub repository: movie-discovery-app
echo 4. Set Root Directory: backend
echo 5. Build Command: npm install
echo 6. Start Command: npm start
echo 7. Add Environment Variables:
echo    - NODE_ENV=production
echo    - DATABASE_URL=your_supabase_url
echo    - TMDB_API_KEY=your_tmdb_api_key
echo    - JWT_SECRET=your_jwt_secret
echo.
echo 📋 Web Version Deployment (Optional):
echo 1. Go to https://vercel.com
echo 2. Import GitHub repository
echo 3. Root Directory: frontend
echo 4. Build Command: npx expo build:web
echo 5. Output Directory: dist
echo.
echo 🎉 Deployment script completed!
echo 📱 Check Expo dashboard for APK download
echo 🖥️ Set up Render deployment manually
echo 🌐 Set up Vercel deployment manually
pause