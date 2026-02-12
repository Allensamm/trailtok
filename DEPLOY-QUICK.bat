@echo off
title Movie App Auto-Deployment

echo.
echo  🚀 Movie App Auto-Deployment
echo  =============================
echo.

echo 🖥️ BACKEND DEPLOYMENT (Manual)
echo 1. Open browser to: https://render.com
echo 2. Click "New Web Service" 
echo 3. Connect GitHub: movie-discovery-app
echo 4. Root Directory: backend
echo 5. Build Command: npm install
echo 6. Start Command: npm start
echo 7. Add Environment Variables:
echo    NODE_ENV=production
echo    DATABASE_URL=your_supabase_url  
echo    TMDB_API_KEY=your_tmdb_api_key
echo    JWT_SECRET=your_jwt_secret
echo.

echo 📱 APK BUILD (20-30 minutes)
if "%1"=="--build-apk" (
    echo 🔨 Starting APK build...
    cd frontend
    
    :: Check if Expo is installed
    where npx >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo ❌ Expo CLI not found. Installing...
        npm install -g @expo/cli eas-cli
    )
    
    :: Try building APK
    npx eas build --platform android --profile preview --non-interactive
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ APK Build Complete!
        echo 📱 Download from: https://expo.dev/accounts
    ) else (
        echo ❌ APK Build Failed!
        echo 📋 Check error messages above
    )
    
    pause
    exit /b
)

echo 🌐 FRONTEND WEB DEPLOYMENT (Optional)
echo 1. Open browser to: https://vercel.com
echo 2. Import GitHub: movie-discovery-app  
echo 3. Root Directory: frontend
echo 4. Build Command: npx expo build:web
echo 5. Output Directory: dist

echo.
echo 📋 QUICK COMMANDS:
echo   Build APK:     %0 --build-apk
echo   Deploy Backend:  Open render.com manually
echo   Deploy Web:     Open vercel.com manually

echo.
echo 🎯 FINAL URLs:
echo    Backend API:  https://movie-app-backend.onrender.com/api/health  
echo    Web App:      https://movie-app-frontend.vercel.app
echo    APK Download:  https://expo.dev/accounts
echo.

if "%1"=="" (
    echo 🚀 Ready for deployment!
    echo 💡 Run: %0 --build-apk to build APK
    pause
)