# 🚀 Movie App Deployment Guide
## Making Your App Publicly Downloadable

### 📋 Overview
This guide covers deploying your Movie App to production and making it available on App Store, Google Play, and web.

---

## 🏗️ Phase 1: Backend API Deployment

### 1. Choose Production Hosting
**Recommended Options:**
- **Render** (Easy, $7-20/month)
- **Railway** (Simple, $5-20/month)  
- **Heroku** (Popular, $7-25/month)
- **AWS EC2** (Advanced, $10-50/month)
- **DigitalOcean** (Good value, $5-20/month)

### 2. Prepare Backend for Production
```bash
# 1. Update dependencies
cd backend
npm update

# 2. Add production dependencies
npm install helmet compression morgan

# 3. Create production start script
npm pkg set scripts:start="NODE_ENV=production node server.js"
```

### 3. Configure Production Environment
Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_production_supabase_url
TMDB_API_KEY=your_tmdb_api_key
JWT_SECRET=your_strong_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com
```

### 4. Deploy to Render (Recommended)
1. **Sign up**: https://render.com
2. **Connect GitHub**: Push code to GitHub
3. **Create Web Service**:
   - Connect to your GitHub repo
   - Select `backend` folder as root directory
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables from `.env.production`

---

## 📱 Phase 2: Mobile App Build & Deployment

### 1. Install Expo EAS
```bash
cd frontend
npm install -g @expo/eas-cli
eas build:configure
```

### 2. Configure EAS Build
Create `frontend/eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Update App Configuration
Update `frontend/app.json`:
```json
{
  "expo": {
    "name": "Movie Discovery",
    "slug": "movie-discovery-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.yourcompany.moviediscovery",
      "supportsTablet": true,
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.yourcompany.moviediscovery",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "owner": "your-username"
  }
}
```

### 4. Update API Configuration
Update `frontend/services/api.js`:
```javascript
const baseURL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-backend-url.onrender.com/api';
```

---

## 🏪 Phase 3: App Store Submission

### 1. Apple App Store Setup
**Requirements:**
- Apple Developer Program ($99/year)
- Mac computer with Xcode
- App Store Connect account

**Steps:**
1. **Enroll**: https://developer.apple.com/programs/
2. **Create App ID**: In Apple Developer Portal
3. **Create Certificates**: Development & Distribution
4. **Set up App Store Connect**: Create app listing
5. **Build with EAS**:
   ```bash
   eas build --platform ios --profile production
   ```
6. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

### 2. Google Play Store Setup
**Requirements:**
- Google Play Developer Account ($25 one-time)
- Android app bundle (.aab)

**Steps:**
1. **Create Account**: https://play.google.com/console/signup
2. **Create App**: Fill store listing information
3. **Build with EAS**:
   ```bash
   eas build --platform android --profile production
   ```
4. **Submit to Play Store**:
   ```bash
   eas submit --platform android
   ```

---

## 🌐 Phase 4: Web Version Deployment

### 1. Build Web Version
```bash
cd frontend
npx expo build:web
```

### 2. Deploy Web App
**Options:**
- **Vercel** (Recommended, free tier)
- **Netlify** (Great, free tier)
- **GitHub Pages** (Free, basic)

### 3. Vercel Deployment (Recommended)
1. **Sign up**: https://vercel.com
2. **Import Project**: Connect GitHub repo
3. **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npx expo build:web`
   - Output Directory: `dist`

---

## 🔧 Phase 5: Production Configuration

### 1. Environment Variables
Set up production environment variables:
```bash
# Backend
DATABASE_URL=production_supabase_url
TMDB_API_KEY=production_api_key
JWT_SECRET=strong_secret_here

# Frontend
API_BASE_URL=https://your-api-domain.com/api
```

### 2. Security Measures
```javascript
// Add to backend/server.js
const helmet = require('helmet');
const compression = require('compression');

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com'
}));
```

### 3. Rate Limiting
```bash
cd backend
npm install express-rate-limit
```

Add to backend:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Phase 6: Monitoring & Analytics

### 1. Error Tracking
**Sentry** (Recommended):
```bash
cd frontend
npx expo install @sentry/react-native

cd backend
npm install @sentry/node
```

### 2. Analytics
**Firebase Analytics** (Free):
```bash
cd frontend
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

### 3. Performance Monitoring
**Vercel Analytics** (for web) or **New Relic** (for backend)

---

## 💰 Phase 7: Cost Estimates

### Monthly Costs:
- **Backend Hosting**: $7-20 (Render/Railway)
- **Database**: Free tier (Supabase) or $25+ (production)
- **App Store**: $99/year Apple + $25 one-time Google
- **Domain**: $12/year
- **Monitoring**: Free tier + optional paid plans

**Total First Year**: ~$200-400
**Subsequent Years**: ~$150-300

---

## ⏰ Timeline Estimate

| Phase | Time Required |
|-------|---------------|
| Backend Deployment | 2-4 hours |
| Mobile App Build | 4-8 hours |
| App Store Setup | 2-4 days (review time) |
| Web Deployment | 1-2 hours |
| Total Development | 8-14 hours |
| App Store Review | 1-7 days |

---

## 🚨 Important Considerations

### Legal Requirements:
1. **Privacy Policy**: Required by both stores
2. **Terms of Service**: Required for data collection
3. **Data Handling**: GDPR compliance if EU users
4. **TMDb Attribution**: Include in app credits

### App Store Guidelines:
1. **No Bugs**: Test thoroughly
2. **Proper Metadata**: Screenshots, descriptions
3. **Age Ratings**: Appropriate content rating
4. **In-App Purchases**: If any, proper implementation

---

## 📋 Quick Start Checklist

### Pre-Deployment:
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] Proper error handling
- [ ] Security audit completed
- [ ] Performance optimized

### Deployment Ready:
- [ ] Backend deployed to production
- [ ] Database migrated to production
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Custom domain configured

### App Store Ready:
- [ ] App name and description written
- [ ] Screenshots captured (3-10 per platform)
- [ ] App icons designed (multiple sizes)
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Developer accounts set up

---

## 🛠️ Tools & Services Recommended

### Essential:
- **Render** (Backend hosting)
- **Expo EAS** (Mobile builds)
- **Supabase** (Database)
- **Vercel** (Web hosting)

### Optional:
- **Sentry** (Error tracking)
- **Firebase Analytics** (User analytics)
- **GitHub Actions** (CI/CD)
- **Cloudflare** (CDN/Security)

---

## 🆘 Support Resources

- **Expo Documentation**: https://docs.expo.dev
- **Render Docs**: https://render.com/docs
- **App Store Guidelines**: https://developer.apple.com/app-store/
- **Google Play Console**: https://support.google.com/googleplay/android-developer

---

## 🎯 Success Metrics

### After Launch:
- **Target Downloads**: 1000+ in first month
- **User Retention**: 40%+ after 7 days
- **App Store Rating**: 4.0+ stars
- **Crash Rate**: <1% of sessions

### Performance Targets:
- **API Response**: <500ms average
- **App Load Time**: <3 seconds
- **Uptime**: 99.9% availability

---

*This guide provides a complete roadmap for making your Movie App publicly available. Adjust timeline and costs based on your specific needs and resources.*