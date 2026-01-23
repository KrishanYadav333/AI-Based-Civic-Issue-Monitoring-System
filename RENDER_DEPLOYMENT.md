# 🚀 Render Deployment Guide

## Overview
This guide covers deploying all services to Render (frontend, backend, AI service) with MongoDB Atlas as the database.

## Prerequisites
- GitHub repository with code pushed
- Render account (free tier): https://render.com
- MongoDB Atlas account (free tier): https://www.mongodb.com/cloud/atlas

---

## 🗄️ Step 1: Setup MongoDB Atlas (5 minutes)

### Create Free Cluster
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new **M0 Free Cluster** (512MB storage)
4. Choose cloud provider and region (closest to your Render region)
5. Name your cluster: `civic-issues-cluster`

### Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create username/password (save these!)
3. Grant **Read and Write** access

### Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Save

### Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)
4. Replace `<password>` with your actual password
5. Add database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/civic_issues`

---

## 🖥️ Step 2: Deploy Backend to Render (10 minutes)

### Create Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `civic-issue-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### Environment Variables
Click **Advanced** → **Add Environment Variable**:

```env
NODE_ENV=production
PORT=3000

# MongoDB Atlas Connection
DB_HOST=<your-mongodb-atlas-connection-string>
DB_PORT=27017
DB_NAME=civic_issues
DB_USER=<your-db-username>
DB_PASSWORD=<your-db-password>

# JWT Secret (generate a random 32-char string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI Service URL (will update after deploying AI service)
AI_SERVICE_URL=https://civic-issue-ai.onrender.com

# Redis (optional, for rate limiting - can skip for free tier)
REDIS_HOST=localhost
REDIS_PORT=6379

# SMTP (optional, for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
```

### Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://civic-issue-backend.onrender.com`

---

## 🤖 Step 3: Deploy AI Service to Render (10 minutes)

### Prepare AI Model Files
Before deploying, ensure trained models are in the correct location:
```
ai-service/
├── models/
│   ├── best_model.keras          # Your trained Keras model
│   ├── class_indices.json        # Class mappings
│   └── yolov8_best.pt            # YOLOv8 model (optional)
```

### Create Dockerfile (if not exists)
Create `ai-service/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create necessary directories
RUN mkdir -p uploads models

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]
```

### Create Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `civic-issue-ai`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `ai-service`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `ai-service/Dockerfile`
   - **Plan**: **Free**

### Environment Variables
```env
FLASK_ENV=production
PORT=5000
MODEL_PATH=models/best_model.keras
CLASS_INDICES_PATH=models/class_indices.json
```

### Deploy
1. Click **Create Web Service**
2. Wait for deployment (10-15 minutes - Docker build takes longer)
3. Copy your AI service URL: `https://civic-issue-ai.onrender.com`
4. **Go back to backend environment variables** and update `AI_SERVICE_URL` with this URL

---

## 🎨 Step 4: Deploy Frontend to Render (5 minutes)

### Create Static Site
1. Go to Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `civic-issue-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Environment Variables (Build-time)
```env
VITE_API_URL=https://civic-issue-backend.onrender.com
VITE_AI_SERVICE_URL=https://civic-issue-ai.onrender.com
```

### Deploy
1. Click **Create Static Site**
2. Wait for build (5 minutes)
3. Your app is live at: `https://civic-issue-frontend.onrender.com`

---

## 🔧 Step 5: Post-Deployment Configuration

### Update Backend CORS
Ensure backend allows frontend domain:
```javascript
// backend/src/index.js
app.use(cors({
  origin: [
    'https://civic-issue-frontend.onrender.com',
    'http://localhost:3001'  // For local dev
  ],
  credentials: true
}));
```

### Verify All Services
1. **Backend Health**: Visit `https://civic-issue-backend.onrender.com/health`
2. **AI Service Health**: Visit `https://civic-issue-ai.onrender.com/health`
3. **Frontend**: Visit `https://civic-issue-frontend.onrender.com`

### Seed Database
Use MongoDB Compass or Atlas UI to import seed data:
1. Connect to your MongoDB Atlas cluster
2. Create `civic_issues` database
3. Import collections from `database/seed.json` (if available)

Or run seed script via backend endpoint or one-time script.

---

## 📝 Important Notes

### Free Tier Limitations
- **Render Free Tier**:
  - Services sleep after 15 minutes of inactivity
  - 750 hours/month free (enough for 1 service 24/7 or 3 services with downtime)
  - 512MB RAM per service
  - First request after sleep takes 30-60 seconds
  - Static sites have no sleep

- **MongoDB Atlas Free Tier**:
  - 512MB storage
  - 100 max connections
  - No backups
  - Shared cluster (lower performance)

### Keep Services Awake (Optional)
Use a cron job or uptime monitor (like UptimeRobot) to ping services every 10 minutes:
- `https://civic-issue-backend.onrender.com/health`
- `https://civic-issue-ai.onrender.com/health`

### Model File Size
- If your trained model is >100MB, consider:
  1. Using Git LFS (Large File Storage)
  2. Uploading to cloud storage (AWS S3 free tier, Cloudinary)
  3. Downloading model on first startup from external URL

---

## 🚨 Troubleshooting

### Backend Not Starting
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure all required env vars are set

### AI Service Build Fails
- Check Dockerfile syntax
- Ensure requirements.txt has correct dependencies
- Verify model files exist in `ai-service/models/`

### Frontend Can't Connect to Backend
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend env vars
- Check browser console for errors

### MongoDB Connection Failed
- Verify connection string format
- Check IP whitelist (0.0.0.0/0)
- Ensure database user has correct permissions

---

## 🎉 Success!

Your app is now live on:
- **Frontend**: https://civic-issue-frontend.onrender.com
- **Backend API**: https://civic-issue-backend.onrender.com
- **AI Service**: https://civic-issue-ai.onrender.com

### Next Steps
1. Set up custom domain (Render supports free SSL)
2. Configure monitoring and alerts
3. Set up CI/CD for automatic deployments
4. Test all features in production
5. Share with users!

---

## 📚 Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Troubleshooting Guide](https://render.com/docs/troubleshooting)
