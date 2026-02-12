#!/bin/bash

echo "🚀 Starting Automatic Deployment of Movie App..."

# Step 1: Update API URL for production
echo "📡 Updating API configuration..."
sed -i "s|http://localhost:5000/api|https://movie-app-backend.onrender.com/api|g" frontend/services/api.js

# Step 2: Build APK using Expo EAS
echo "📱 Building APK for Android..."
cd frontend

# Configure EAS if not already configured
if [ ! -f "eas.json" ]; then
    echo "🔧 Configuring EAS..."
    npx eas build:configure
fi

# Build APK
echo "🔨 Building APK..."
npx eas build --platform android --profile preview --non-interactive

echo "✅ APK Build Complete!"
echo "📱 APK will be available for download from your Expo dashboard"

# Step 3: Deploy to Render (Backend)
echo "🖥️ Deploying Backend to Render..."
cd ../backend

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
TMDB_API_KEY=YOUR_TMDB_API_KEY
JWT_SECRET=your_jwt_secret_here
EOF

echo "⏳ Backend deployment ready for Render"
echo "📋 Manual steps needed:"
echo "   1. Go to https://render.com"
echo "   2. Connect your GitHub repository"
echo "   3. Create Web Service with backend/ as root"
echo "   4. Add environment variables from .env.production"

echo "🎉 Deployment script completed!"
echo "📱 Check Expo dashboard for APK download"
echo "🖥️ Check Render dashboard for backend URL"