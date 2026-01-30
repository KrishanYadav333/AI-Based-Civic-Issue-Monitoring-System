# 🚀 Production Deployment Configuration

## Deployed Services

### ✅ All Services are LIVE

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://ai-based-civic-issue-monitoring-system.onrender.com | ✅ Running |
| **Backend** | https://civic-issue-backend-ndmh.onrender.com | ✅ Running |
| **AI Service** | https://ai-civic-ms-dockerimg.onrender.com | ⚠️ Running (OLD Code) |

---

## ⚠️ CRITICAL: AI Service Needs Redeployment

**Current Issue:** AI Service is running OLD Flask code instead of new FastAPI code.

**Evidence:**
```json
// Current (OLD):
{"service":"AI Issue Detection","status":"ok"}

// Expected (NEW):
{
  "service": "Civic Issue Classification API",
  "version": "1.0.0",
  "status": "running"
}
```

### 🔥 How to Fix (5 minutes):

#### Step 1: Redeploy AI Service on Render
1. Go to: https://dashboard.render.com
2. Find service: `ai-civic-ms-dockerimg`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait ~10 minutes for build

#### Step 2: Verify New Deployment
```bash
curl https://ai-civic-ms-dockerimg.onrender.com/
```

Should return:
```json
{
  "service": "Civic Issue Classification API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

#### Step 3: Update Backend Environment Variable

**In Render Backend Settings:**
```env
AI_SERVICE_URL=https://ai-civic-ms-dockerimg.onrender.com
```

Then restart backend service.

---

## 📝 Environment Variables Setup

### Backend (https://civic-issue-backend-ndmh.onrender.com)

Required environment variables:
```env
NODE_ENV=production
PORT=3000

# MongoDB Connection
MONGODB_URI=your-mongodb-atlas-connection-string
DB_NAME=civic_issues

# JWT
JWT_SECRET=your-secure-32-char-secret
JWT_EXPIRES_IN=24h

# AI Service
AI_SERVICE_URL=https://ai-civic-ms-dockerimg.onrender.com

# CORS
ALLOWED_ORIGINS=https://ai-based-civic-issue-monitoring-system.onrender.com
```

### AI Service (https://ai-civic-ms-dockerimg.onrender.com)

Required environment variables:
```env
PORT=5000
ENVIRONMENT=production
MODEL_PATH=./models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.25
MODEL_DEVICE=cpu
```

### Frontend (https://ai-based-civic-issue-monitoring-system.onrender.com)

Required environment variables:
```env
VITE_API_URL=https://civic-issue-backend-ndmh.onrender.com/api
VITE_USE_MOCK=false
VITE_APP_NAME=VMC Civic Issue Monitoring System
```

---

## 🧪 Testing Endpoints

### 1. Test Backend Health
```bash
curl https://civic-issue-backend-ndmh.onrender.com/health
```

Expected: `{"status":"healthy","database":"connected"}`

### 2. Test Backend Login
```bash
curl -X POST https://civic-issue-backend-ndmh.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test@123"}'
```

Expected: 401 Unauthorized (correct - no valid credentials)

### 3. Test AI Service (After Redeployment)
```bash
curl https://ai-civic-ms-dockerimg.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "model": {"loaded": true, "device": "cpu"}
}
```

### 4. Test Frontend
Visit: https://ai-based-civic-issue-monitoring-system.onrender.com

Should load the login page and connect to backend.

---

## 🔍 Current Status Summary

### ✅ Working
- ✅ Backend is live and responding
- ✅ Backend API routes work (login returns 401 correctly)
- ✅ Backend database is connected
- ✅ Frontend is deployed and accessible

### ⚠️ Needs Action
- ⚠️ **AI Service needs redeployment** (using old Flask code)
- ⚠️ **Backend AI_SERVICE_URL** needs update (after AI redeploy)
- ⚠️ **Frontend env vars** should be set in Render dashboard

---

## 📊 Verification Checklist

After fixing AI service:

- [ ] AI service returns FastAPI response at `/` endpoint
- [ ] AI service `/health` shows model loaded
- [ ] Backend can reach AI service (check backend `/health`)
- [ ] Frontend can login to backend
- [ ] Issue creation works with AI classification

---

## 🆘 Troubleshooting

### If Frontend Can't Connect to Backend:
1. Check browser console for CORS errors
2. Verify `VITE_API_URL` is set correctly in Render
3. Check `ALLOWED_ORIGINS` in backend includes frontend URL

### If Backend Can't Reach AI Service:
1. Verify `AI_SERVICE_URL` in backend env vars
2. Test AI service URL directly with curl
3. Restart backend after updating AI_SERVICE_URL

### If AI Service Fails to Start:
1. Check Render build logs for errors
2. Verify Dockerfile syntax
3. Check PORT is bound correctly in logs

---

**Last Updated:** 2026-01-28  
**Status:** 🟡 Deployment Active - AI Service Update Required
