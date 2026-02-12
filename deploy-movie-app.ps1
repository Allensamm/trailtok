# Movie App Auto-Deployment Script
# Usage: .\deploy-movie-app.ps1

param(
    [Parameter(Mandatory=$true)][string]$GitHubRepo,
    [Parameter(Mandatory=$false)][string]$ExpoEmail,
    [Parameter(Mandatory=$false)][string]$SupabaseURL,
    [Parameter(Mandatory=$false)][string]$TMDBApiKey
)

Write-Host "🚀 Movie App Automatic Deployment" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Step 1: Backend Deployment Instructions
Write-Host "🖥️ Backend Deployment (Manual Steps)" -ForegroundColor Cyan
Write-Host "1. Go to: https://render.com" -ForegroundColor White
Write-Host "2. Click 'New Web Service'" -ForegroundColor White  
Write-Host "3. Connect GitHub: $GitHubRepo" -ForegroundColor White
Write-Host "4. Root Directory: backend" -ForegroundColor White
Write-Host "5. Build Command: npm install" -ForegroundColor White
Write-Host "6. Start Command: npm start" -ForegroundColor White
Write-Host "7. Environment Variables:" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "   - DATABASE_URL=$SupabaseURL" -ForegroundColor Gray
Write-Host "   - TMDB_API_KEY=your_api_key" -ForegroundColor Gray
Write-Host "   - JWT_SECRET=your_strong_jwt_secret" -ForegroundColor Gray
Write-Host ""

# Step 2: APK Build
Write-Host "📱 Building APK for Android..." -ForegroundColor Cyan

if ($ExpoEmail) {
    Write-Host "🔧 Configuring Expo account..." -ForegroundColor Yellow
    & eas login
    
    Write-Host "🔨 Building APK (this will take 20-30 minutes)..." -ForegroundColor Yellow
    cd frontend
    & eas build --platform android --profile preview --non-interactive
} else {
    Write-Host "❌ Expo email required for APK build" -ForegroundColor Red
    Write-Host "Run: .\deploy-movie-app.ps1 -ExpoEmail your@email.com" -ForegroundColor Yellow
    Write-Host "Then run: eas build --platform android --profile preview" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Frontend Web Deployment (Optional)" -ForegroundColor Cyan
Write-Host "1. Go to: https://vercel.com" -ForegroundColor White
Write-Host "2. Import GitHub: $GitHubRepo" -ForegroundColor White
Write-Host "3. Root Directory: frontend" -ForegroundColor White
Write-Host "4. Build Command: npx expo build:web" -ForegroundColor White
Write-Host "5. Output Directory: dist" -ForegroundColor White

Write-Host ""
Write-Host "✅ Deployment URLs After Completion:" -ForegroundColor Green
Write-Host "Backend API: https://movie-app-backend.onrender.com" -ForegroundColor White
Write-Host "Frontend Web: https://movie-app-frontend.vercel.app" -ForegroundColor White
Write-Host "APK Download: https://expo.dev/accounts" -ForegroundColor White

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete backend deployment on Render" -ForegroundColor White
Write-Host "2. Build APK using Expo EAS" -ForegroundColor White
Write-Host "3. Test APK on Android device" -ForegroundColor White
Write-Host "4. Optionally deploy web version to Vercel" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Ready to launch your Movie App!" -ForegroundColor Green