@echo off
title 🚀 Auto-Deploy Movie App - APK Edition

echo.
echo 🎉 Movie App Successfully Pushed to GitHub!
echo    Repository: https://github.com/Allensamm/trailtok.git
echo.

echo 📱 Building APK for Android (15-20 minutes)...
echo.

cd frontend

:: Check if Expo CLI is installed
where npx >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 📦 Installing Expo CLI...
    npm install -g @expo/cli eas-cli
)

echo 🔧 Configuring EAS...
rem npx eas build:configure
echo Skipping configure - using existing eas.json

echo 🔨 Building APK (this will take 15-20 minutes)...
npx eas build --platform android --profile preview --non-interactive

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ APK BUILD SUCCESSFUL!
    echo.
    echo 📱 Download your APK from: https://expo.dev/accounts
    echo.
    echo 🔗 Builds will appear in your Expo dashboard
    echo.
    echo 📋 Steps to install APK:
    echo    1. Open the APK file from your downloads
    echo    2. Transfer to Android phone
    echo    3. Enable "Install from unknown sources"  
    echo    4. Install the APK
    echo.
    echo 🎯 Your Movie App is ready for distribution!
) else (
    echo.
    echo ❌ APK BUILD FAILED!
    echo.
    echo 📋 Check the error messages above
    echo.
    echo 📋 Common solutions:
    echo    • Run: npm install --force
    echo    • Clear cache: npx expo start -c
    echo    • Check internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo 🌐 BACKEND DEPLOYMENT INSTRUCTIONS:
echo    1. Go to: https://render.com
echo    2. Click: "New Web Service"  
echo    3. Repository: https://github.com/Allensamm/trailtok.git
echo    4. Root Directory: backend
echo    5. Build: npm install
echo    6. Start: npm start
echo    7. Environment Variables:
echo       • NODE_ENV=production
echo       • DATABASE_URL=your_supabase_url
echo       • TMDB_API_KEY=your_tmdb_api_key  
echo       • JWT_SECRET=your_jwt_secret
echo.
echo    🖥️ Your backend will be live at: https://movie-app-backend.onrender.com

pause