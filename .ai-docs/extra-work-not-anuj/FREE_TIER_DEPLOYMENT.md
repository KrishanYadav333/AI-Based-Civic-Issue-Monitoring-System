# Free Tier Deployment Guide

Complete guide to deploy the AI Civic Issue Monitoring System using free-tier services.

## 🌐 Architecture Overview

```
Frontend (Vercel) → Backend (Railway/Render) → Database (Supabase)
                          ↓
                   AI Service (Railway/Render)
                          ↓
                   Redis (Upstash) + Storage (Cloudinary)
```

---

## 1. Database - Supabase (PostgreSQL + PostGIS)

**Free Tier**: 500MB database, unlimited API requests, 50,000 monthly active users

### Setup Steps:

1. **Create Account**: https://supabase.com/dashboard
2. **Create Project**:
   - Name: `civic-issue-monitor`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
   
3. **Enable PostGIS**:
   ```sql
   -- Run in SQL Editor
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

4. **Import Schema**:
   - Go to SQL Editor
   - Copy contents from `database/schema.sql`
   - Execute
   - Copy contents from `database/seed_data.sql`
   - Execute

5. **Get Connection String**:
   - Settings → Database → Connection String
   - Copy the URI format: `postgresql://postgres:[password]@[host]:5432/postgres`

**Environment Variables** (for backend):
```env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_SSL=true
```

---

## 2. Redis Cache - Upstash

**Free Tier**: 10,000 commands/day, 256MB storage

### Setup Steps:

1. **Create Account**: https://upstash.com
2. **Create Database**:
   - Name: `civic-cache`
   - Type: Regional (choose closest region)
   - TLS: Enabled
   
3. **Get Credentials**:
   - Copy REST URL and Token

**Environment Variables**:
```env
REDIS_HOST=your-region-xxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_token
REDIS_TLS=true
```

---

## 3. File Storage - Cloudinary

**Free Tier**: 25GB storage, 25GB bandwidth/month

### Setup Steps:

1. **Create Account**: https://cloudinary.com
2. **Get Credentials**:
   - Dashboard → Account Details
   - Copy Cloud Name, API Key, API Secret
   
3. **Update Backend Code**:
   - Replace local file storage with Cloudinary SDK
   - Use `cloudinary.uploader.upload()` instead of multer disk storage

**Environment Variables**:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 4. Backend API - Railway

**Free Tier**: 500 hours/month, $5 credit, sleeps after 30min inactivity

### Setup Steps:

1. **Create Account**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Connect Repository**: `AI-Based-Civic-Issue-Monitoring-System`
4. **Configure Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
5. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   
   # Database (from Supabase)
   DB_HOST=db.xxxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   DB_SSL=true
   
   # Redis (from Upstash)
   REDIS_HOST=your-region-xxxx.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your_upstash_token
   REDIS_TLS=true
   
   # JWT
   JWT_SECRET=generate_32+_character_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # AI Service URL (Railway will provide)
   AI_SERVICE_URL=https://your-ai-service.railway.app
   
   # CORS
   CORS_ORIGIN=https://your-frontend.vercel.app
   
   # Email (optional - use Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_specific_password
   EMAIL_FROM=civic-monitor@yourdomain.com
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

6. **Deploy**: Railway auto-deploys on git push

**Alternative: Render.com**
- Free Tier: 750 hours/month per service, sleeps after 15min inactivity
- Steps similar to Railway
- Create → Web Service → Connect GitHub repo
- Build: `npm install`, Start: `npm start`

---

## 5. AI Service - Railway/Render

### Setup Steps:

1. **Railway**: Create another service in same project
   - Root Directory: `ai-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   
2. **Environment Variables**:
   ```env
   FLASK_ENV=production
   MODEL_PATH=/app/models
   DB_HOST=db.xxxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   ```

3. **Copy Model URL**: Use this in backend's `AI_SERVICE_URL`

---

## 6. Frontend - Vercel

**Free Tier**: Unlimited deployments, 100GB bandwidth/month

### Setup Steps:

1. **Create Account**: https://vercel.com
2. **Import Project**: New Project → Import from GitHub
3. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
4. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   VITE_WS_URL=wss://your-backend.railway.app
   VITE_MAPBOX_TOKEN=your_mapbox_access_token (optional for maps)
   ```

5. **Deploy**: Auto-deploys on git push

**Domain**: Vercel provides `your-project.vercel.app` (or connect custom domain)

---

## 7. Mobile App - Expo EAS

**Free Tier**: Unlimited builds (with some limitations)

### Setup Steps:

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure `mobile-app/app.json`**:
   ```json
   {
     "expo": {
       "name": "Civic Monitor",
       "slug": "civic-issue-monitor",
       "extra": {
         "apiUrl": "https://your-backend.railway.app",
         "wsUrl": "wss://your-backend.railway.app"
       }
     }
   }
   ```

3. **Build**:
   ```bash
   cd mobile-app
   eas build --platform android --profile preview
   eas build --platform ios --profile preview
   ```

4. **Distribute**:
   - Android: Download APK from EAS dashboard
   - iOS: TestFlight or internal distribution

---

## 8. Push Notifications - Firebase Cloud Messaging

**Free Tier**: Unlimited notifications

### Setup Steps:

1. **Firebase Console**: https://console.firebase.google.com
2. **Create Project**: `civic-issue-monitor`
3. **Add Android/iOS Apps**:
   - Download `google-services.json` (Android)
   - Download `GoogleService-Info.plist` (iOS)
   
4. **Get Server Key**:
   - Project Settings → Cloud Messaging → Server Key
   
5. **Backend Environment Variable**:
   ```env
   FIREBASE_SERVER_KEY=your_firebase_server_key
   ```

---

## 9. Monitoring - Uptime Robot (Optional)

**Free Tier**: 50 monitors, 5min intervals

### Setup Steps:

1. **Create Account**: https://uptimerobot.com
2. **Add Monitors**:
   - Backend: `https://your-backend.railway.app/health`
   - AI Service: `https://your-ai-service.railway.app/health`
   - Frontend: `https://your-frontend.vercel.app`
   
3. **Set Alert Contacts**: Email notifications on downtime

---

## 10. Deployment Checklist

### Pre-Deployment:

- [ ] All secrets generated (JWT_SECRET, DB passwords)
- [ ] Database schema imported
- [ ] Seed data loaded (19 Vadodara wards)
- [ ] Environment variables configured
- [ ] CORS origins whitelisted
- [ ] SSL/TLS enabled everywhere

### Post-Deployment:

- [ ] Test API endpoints: `GET /health`
- [ ] Test authentication: Login/Register
- [ ] Test file uploads: Create issue with image
- [ ] Test geo-fencing: Verify ward assignment
- [ ] Test AI classification: Upload issue images
- [ ] Test WebSocket: Real-time updates
- [ ] Test push notifications
- [ ] Load test with 50+ concurrent users

### Performance Optimizations:

- [ ] Enable Redis caching for dashboards
- [ ] Enable response compression
- [ ] Optimize database queries (indexes)
- [ ] Enable CDN for static assets
- [ ] Lazy load images in frontend
- [ ] Implement pagination (limit 50 records/page)

---

## 11. Cost Breakdown (Monthly)

| Service | Free Tier Limits | Estimated Usage | Cost |
|---------|-----------------|-----------------|------|
| Supabase | 500MB DB | ~200MB | **$0** |
| Upstash Redis | 10K commands/day | ~5K/day | **$0** |
| Railway | 500 hours | ~300 hours | **$0** |
| Vercel | 100GB bandwidth | ~10GB | **$0** |
| Cloudinary | 25GB storage | ~5GB | **$0** |
| Firebase FCM | Unlimited | N/A | **$0** |
| **Total** | | | **$0/month** |

**Upgrade Triggers**:
- Database > 500MB → Supabase Pro ($25/month)
- Backend > 500 hours → Railway Pro ($5/month)
- Redis > 10K commands/day → Upstash Pro ($10/month)

---

## 12. CI/CD with GitHub Actions (Bonus)

### `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 13. Scaling Strategy

### When Free Tier Isn't Enough:

1. **Database**: Migrate to Supabase Pro or AWS RDS
2. **Backend**: Scale Railway replicas or move to AWS ECS
3. **Redis**: Upgrade Upstash or use AWS ElastiCache
4. **CDN**: Add Cloudflare in front of everything
5. **Load Balancer**: Nginx or AWS ALB

### Horizontal Scaling:
- Backend: 3+ instances behind load balancer
- AI Service: Separate instances with queue (Redis)
- Database: Read replicas for dashboards

---

## 14. Security Hardening

- [ ] Rate limiting: 100 req/15min per IP
- [ ] HTTPS everywhere (provided by platforms)
- [ ] JWT secret rotation (monthly)
- [ ] Database connection pooling (max 10 connections)
- [ ] Input sanitization (XSS, SQL injection prevention)
- [ ] Helmet.js security headers
- [ ] CORS whitelist only production domains
- [ ] File upload validation (10MB limit, images only)
- [ ] Authentication on all routes (except public endpoints)

---

## 15. Backup Strategy

### Automated Backups:

1. **Database**: Supabase auto-backups (7 days retention)
2. **Manual Backups**:
   ```bash
   # Weekly database export
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   
   # Upload to cloud storage
   aws s3 cp backup_*.sql s3://civic-backups/
   ```

3. **Code**: GitHub repo (already version controlled)

---

## 16. Testing in Production

### Health Checks:
```bash
# Backend
curl https://your-backend.railway.app/health

# AI Service
curl https://your-ai-service.railway.app/health

# Frontend
curl https://your-frontend.vercel.app
```

### API Testing:
```bash
# Register user
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@1234","role":"surveyor"}'

# Login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

---

## 17. Support & Troubleshooting

### Common Issues:

**"Database connection failed"**
- Check Supabase status
- Verify DB credentials in environment variables
- Ensure PostGIS extension enabled

**"AI service timeout"**
- Railway free tier may sleep - first request takes ~30s
- Consider keeping alive with cron job: `curl https://your-ai-service.railway.app/health` every 5min

**"File upload failed"**
- Implement Cloudinary integration (local storage won't work on Railway)
- Update multer config to use memory storage + Cloudinary upload

**"WebSocket not connecting"**
- Railway provides WSS automatically
- Update frontend to use `wss://` protocol
- Check CORS allows WebSocket upgrade

---

## 🚀 Quick Deploy Commands

```bash
# 1. Push to GitHub
git push origin dev-anuj

# 2. Railway will auto-deploy backend & AI service

# 3. Vercel will auto-deploy frontend

# 4. Build mobile app
cd mobile-app
eas build --platform android --profile production

# 5. Monitor deployment
railway logs
vercel logs
```

---

## 📊 Monitoring Dashboard URLs

- Railway: https://railway.app/dashboard
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard/projects
- Upstash: https://console.upstash.com
- Cloudinary: https://cloudinary.com/console

---

**Next Steps**: 
1. Create accounts on all platforms
2. Configure environment variables
3. Push code to trigger deployments
4. Test thoroughly
5. Share production URLs with team/stakeholders

**Estimated Setup Time**: 2-3 hours for first deployment
