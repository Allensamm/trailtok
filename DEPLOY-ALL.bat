@echo off
chcp 65001 >nul
title 🚀 Movie App - Complete Deployment Script
cls

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🎬 MOVIE DISCOVERY APP - AUTO-DEPLOYMENT SYSTEM      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: frontend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo 📋 Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo ✅ Node.js: %NODE_VERSION%

REM Check Git
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✅ Git: installed

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)
echo ✅ npm: installed

echo.
echo ═══════════════════════════════════════════════════════
echo  STEP 1: PRE-DEPLOYMENT CHECKLIST
echo ═══════════════════════════════════════════════════════
echo.
echo Before proceeding, ensure you have:
echo.
echo  ✓ GitHub repository created and connected
echo  ✓ Render.com account (https://render.com)
echo  ✓ Expo.dev account (https://expo.dev) for APK builds
echo  ✓ TMDb API key (https://www.themoviedb.org/settings/api)
echo  ✓ Supabase database configured
echo.

choice /C YN /N /M "Have you completed all prerequisites? (Y/N): "
if %ERRORLEVEL% neq 1 (
    echo.
    echo ⚠️ Please complete the prerequisites first.
    echo Visit: https://github.com/Allensamm/trailtok/blob/master/COMPLETE-DEPLOYMENT-GUIDE.md
    pause
    exit /b 0
)

echo.
echo ═══════════════════════════════════════════════════════
echo  STEP 2: GITHUB SYNC
echo ═══════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo 📤 Checking for local changes...
git status --short

set /p COMMIT_MSG="Enter commit message (or press Enter for 'Auto-deployment update'): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Auto-deployment update

echo.
echo 📝 Committing changes with message: "%COMMIT_MSG%"
git add -A
git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 Pushing to GitHub...
git push origin master

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Failed to push to GitHub!
    echo Check your internet connection and git configuration.
    pause
    exit /b 1
)

echo ✅ Code pushed to GitHub successfully!
echo.

echo ═══════════════════════════════════════════════════════
echo  STEP 3: RENDER DEPLOYMENT
echo ═══════════════════════════════════════════════════════
echo.
echo 🌐 Your backend will be deployed to Render.com
echo.
echo To complete deployment:
echo.
echo 1. Go to: https://dashboard.render.com
echo 2. Sign in with GitHub
echo 3. Click: "New +" → "Web Service"
echo 4. Connect repository: Allensamm/trailtok
echo 5. Configure:
echo    • Name: movie-app-backend
echo    • Root Directory: backend
echo    • Build Command: npm install
echo    • Start Command: npm start
echo    • Plan: Free
echo 6. Add Environment Variables (see .env file)
echo 7. Click: "Create Web Service"
echo.
echo 📱 Your backend URL will be:
echo    https://movie-app-backend.onrender.com
echo.

choice /C YN /N /M "Open Render dashboard now? (Y/N): "
if %ERRORLEVEL% equ 1 (
    start https://dashboard.render.com
)

echo.
echo ⚠️  IMPORTANT: Wait for Render deployment to complete!
echo     This usually takes 5-10 minutes.
echo.
echo Press any key once Render shows "Build successful"...
pause >nul

echo.
echo ═══════════════════════════════════════════════════════
echo  STEP 4: APK BUILD (Expo EAS)
echo ═══════════════════════════════════════════════════════
echo.

cd frontend

echo 📦 Checking Expo CLI installation...
where npx >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 📥 Installing Expo CLI globally...
    npm install -g @expo/cli eas-cli
)

echo.
echo 🔑 Checking Expo login status...
npx eas whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ⚠️  You need to login to Expo first!
    echo.
    echo Running: npx eas login
    echo.
    npx eas login
    if %ERRORLEVEL% neq 0 (
        echo ❌ Login failed. Please try again.
        pause
        exit /b 1
    )
)

echo ✅ Logged in to Expo

echo.
echo 🔧 Configuring EAS build...
npx eas build:configure --platform android --non-interactive

echo.
echo 🏗️  Starting APK build...
echo    This will take 15-20 minutes...
echo    You'll receive an email when it's ready.
echo.

choice /C YN /N /M "Start APK build now? (Y/N): "
if %ERRORLEVEL% equ 1 (
    npx eas build --platform android --profile preview --non-interactive
    
    if %ERRORLEVEL% equ 0 (
        echo.
        echo ╔════════════════════════════════════════════════════════╗
        echo ║  ✅ APK BUILD STARTED SUCCESSFULLY!                   ║
        echo ╚════════════════════════════════════════════════════════╝
        echo.
        echo 📱 Your APK will be available at:
        echo    https://expo.dev/accounts/[YOUR_USERNAME]/projects
        echo.
        echo 📧 You'll receive an email when the build completes.
        echo.
        echo ⏱️  Estimated time: 15-20 minutes
        echo.
    ) else (
        echo.
        echo ❌ APK build failed!
        echo Check the error messages above.
        echo.
    )
) else (
    echo.
    echo ⏭️  Skipping APK build.
    echo You can run it later with:
    echo    cd frontend ^&^& npx eas build --platform android --profile preview
    echo.
)

cd ..

echo.
echo ═══════════════════════════════════════════════════════
echo  DEPLOYMENT SUMMARY
echo ═══════════════════════════════════════════════════════
echo.
echo 📊 Status:
echo    ✅ Code pushed to GitHub
echo    ⏳ Backend deploying to Render (check dashboard)
echo    ⏳ APK building on Expo (check email/dashboard)
echo.
echo 🔗 Important URLs:
echo    GitHub:   https://github.com/Allensamm/trailtok
echo    Render:   https://dashboard.render.com
echo    Expo:     https://expo.dev/accounts
    echo.
echo 📖 Full guide:
echo    COMPLETE-DEPLOYMENT-GUIDE.md
echo.
echo 🎉 Deployment process initiated!
echo.
pause
