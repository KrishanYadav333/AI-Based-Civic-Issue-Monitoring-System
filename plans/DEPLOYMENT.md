# Deployment Guide - Render Free Tier (100% Free Stack)

## 100% FREE STACK DEPLOYMENT

This guide covers deployment entirely using **Render Free Tier** - NO AWS, NO Kubernetes, NO paid infrastructure.

---

## Architecture Overview (Render Free Tier)

```
Internet (Users)
    ↓
Render Web Service (Backend API)
    ├── Node.js/Express Server
    ├── AI Background Worker (Python/FastAPI)
    └── Local Disk Storage
    ↓
Render PostgreSQL Database (Free Tier)
    ├── PostgreSQL 14+
    └── PostGIS (geo-spatial queries)
    ↓
Render Redis (Free Tier)
    └── Caching & Sessions
    ↓
Firebase FCM (Free Tier)
    └── Push Notifications
    ↓
OpenStreetMap / Nominatim (Free)
    └── Maps & Reverse Geocoding
```

---

## Prerequisites

### Accounts Required (All FREE)
- Render.com account (free tier)
- GitHub account (free)
- Firebase account (free tier)
- Docker Hub account (free)

### Tools Required (All Open-Source/Free)
- Git
- Docker (free)
- Node.js 18+
- Python 3.9+
- PostgreSQL client tools

### Domain (Optional)
- Use Render's free subdomain: `app-name.onrender.com`
- OR connect custom domain (free DNS)

---

## Step 1: Prepare GitHub Repository

### Repository Structure
```
AI-Based-Civic-Issue-Monitoring-System/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── render.yaml
├── ai-service/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
├── web/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── render.yaml
└── README.md
```

### Create Dockerfile for Backend

**File: `backend/Dockerfile`**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src
COPY config ./config

# Create temp directory for image storage
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/app.js"]
```

### Create Dockerfile for AI Service

**File: `ai-service/Dockerfile`**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download YOLOv8 model (done during build)
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# Copy app code
COPY app.py .

# Expose port
EXPOSE 5000

# Start application
CMD ["python", "app.py"]
```

### Create render.yaml

**File: `render.yaml`** (in root directory)
```yaml
services:
  # Backend API
  - type: web
    name: civic-issues-api
    env: node
    plan: free
    buildCommand: cd backend && npm ci
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: civic-issues-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: civic-issues-redis
          type: pserv
          property: connectionString
      - key: JWT_SECRET
        sync: false

  # PostgreSQL Database (Free)
  - type: pserv
    name: civic-issues-db
    plan: free
    ipAllowList: []
    postgreSQLVersion: "14"

  # Redis Cache (Free)
  - type: pserv
    name: civic-issues-redis
    plan: free
    ipAllowList: []
    redisVersion: "7"

  # AI Service (Background Worker)
  - type: background_worker
    name: civic-issues-ai
    env: docker
    plan: free
    dockerfilePath: ai-service/Dockerfile
    envVars:
      - key: REDIS_URL
        fromService:
          name: civic-issues-redis
          type: pserv
          property: connectionString

  # Web Dashboard (Static Site)
  - type: static_site
    name: civic-issues-dashboard
    plan: free
    buildCommand: cd web && npm run build
    staticPublishPath: web/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://civic-issues-api.onrender.com
```

---

## Step 2: Environment Configuration

### Backend Environment Variables

**File: `backend/.env`**
```bash
# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://civic-issues-api.onrender.com

# Database (Provided by Render)
DATABASE_URL=postgresql://user:password@dpg-xxx.postgresql.render.com:5432/civic_issues
DB_POOL_SIZE=5
DB_POOL_IDLE_TIMEOUT=30000

# Redis (Provided by Render)
REDIS_URL=redis://:password@redis-xxxx.render.com:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=24h

# AI Service
AI_SERVICE_URL=http://civic-issues-ai.onrender.com:5000

# Storage (Local Disk)
STORAGE_PATH=/app/uploads
MAX_FILE_SIZE=5242880

# Firebase FCM
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_email

# Logging
LOG_LEVEL=info
```

### AI Service Environment Variables

**File: `ai-service/.env`**
```bash
REDIS_URL=redis://:password@redis-xxxx.render.com:6379
MODEL_PATH=/app/models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.5
PORT=5000
```

---

## Step 3: Database Setup

### Initialize PostgreSQL with PostGIS

Create initialization script: **`database/init.sql`**

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ward_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    geometry GEOMETRY(POLYGON, 4326),
    population INTEGER
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    ward_id INTEGER REFERENCES wards(id),
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50),
    confidence_score FLOAT,
    image_url VARCHAR(500),
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create spatial indexes
CREATE INDEX idx_issues_location ON issues USING GIST(location);
CREATE INDEX idx_wards_geometry ON wards USING GIST(geometry);

-- Create indexes for performance
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_ward_id ON issues(ward_id);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
```

### Run Migrations on Render

After creating the database service on Render:

1. Get PostgreSQL connection string from Render dashboard
2. Connect to database:
```bash
psql "postgresql://user:password@dpg-xxx.postgresql.render.com:5432/civic_issues" < database/init.sql
```

---

## Step 4: Deploy on Render

### Method 1: Using render.yaml (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

2. **Connect to Render Dashboard**
- Go to https://render.com/dashboard
- Click "New +" → "Web Service"
- Select GitHub repository
- Paste this command in "Build Command":
  ```
  npm install -g render-cli && render deploy
  ```

3. **Configure Services**
- Backend Web Service
- PostgreSQL Database
- Redis Cache
- AI Service (Background Worker)
- Web Dashboard (Static Site)

### Method 2: Deploy via Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login to Render
render login

# Deploy
render deploy
```

---

## Step 5: Configure Services on Render

### Backend API Setup

1. **Create Web Service**
   - Name: `civic-issues-api`
   - Environment: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Plan: Free

2. **Connect Database & Redis**
   - Add environment variables from Render services

3. **Configure Health Check**
   - URL: `/health`
   - Expected status: 200

### AI Service Setup

1. **Create Background Worker**
   - Name: `civic-issues-ai`
   - Environment: Docker
   - Dockerfile Path: `ai-service/Dockerfile`
   - Plan: Free

2. **Connect Redis**
   - Add `REDIS_URL` environment variable

### Web Dashboard Setup

1. **Create Static Site**
   - Name: `civic-issues-dashboard`
   - Build Command: `npm run build`
   - Publish Directory: `build`
   - Plan: Free

2. **Set API Endpoint**
   - Environment variable: `REACT_APP_API_URL=https://civic-issues-api.onrender.com`

### PostgreSQL Database Setup

1. **Create PostgreSQL Service**
   - Plan: Free (512MB)
   - PostgreSQL Version: 14
   - Copy connection string to `DATABASE_URL`

2. **Run Initialization Script**
```bash
# After database is created
psql "postgresql://..." < database/init.sql
```

### Redis Cache Setup

1. **Create Redis Service**
   - Plan: Free (256MB)
   - Copy connection string to `REDIS_URL`

---

## Step 6: Local Image Storage Setup

Since we're NOT using AWS S3, we use local disk storage on Render.

### Backend Upload Handler

**File: `backend/src/routes/upload.js`**
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.STORAGE_PATH || '/app/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ 
    success: true, 
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
```

### Cleanup Old Files

Create a scheduled job to cleanup old images:

**File: `backend/src/jobs/cleanup.js`**
```javascript
const fs = require('fs');
const path = require('path');

async function cleanupOldFiles() {
  const uploadDir = process.env.STORAGE_PATH || '/app/uploads';
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  fs.readdirSync(uploadDir).forEach(file => {
    const filepath = path.join(uploadDir, file);
    const stat = fs.statSync(filepath);
    
    if (Date.now() - stat.mtimeMs > maxAge) {
      fs.unlinkSync(filepath);
      console.log(`Deleted old file: ${file}`);
    }
  });
}

// Run daily
setInterval(cleanupOldFiles, 24 * 60 * 60 * 1000);

module.exports = { cleanupOldFiles };
```

---

## Step 7: GitHub Actions CI/CD

Create automated deployment pipeline.

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: |
          cd backend
          npm ci
          npm test
      
      - name: Notify Render Deploy
        run: |
          curl https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}
```

---

## Step 8: Security Configuration

### CORS Setup
```javascript
// backend/src/middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://civic-issues-dashboard.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
};

module.exports = cors(corsOptions);
```

### Rate Limiting
```javascript
// backend/src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

module.exports = limiter;
```

### JWT Validation
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

function validateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = validateJWT;
```

---

## Step 9: Monitoring & Logging

### Application Logging

**File: `backend/src/config/logger.js`**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/app/logs/app.log' })
  ]
});

module.exports = logger;
```

### Health Check Endpoint

```javascript
// backend/src/routes/health.js
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});
```

### Database Connection Check

```javascript
router.get('/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    res.status(503).json({ status: 'ERROR', database: 'Disconnected' });
  }
});
```

---

## Step 10: Post-Deployment

### Verify Deployment
```bash
# Check API endpoint
curl https://civic-issues-api.onrender.com/health

# Check database
curl https://civic-issues-api.onrender.com/health/db

# Test AI service
curl -X POST https://civic-issues-ai.onrender.com/predict -F "image=@test.jpg"
```

### Backup Database

Create monthly backups on Render:

```bash
# Manual backup
pg_dump "postgresql://user:pass@host/db" > backup-$(date +%Y%m%d).sql

# Store in GitHub (encrypted)
git-crypt add-gpg-user your-email@example.com
git add backups/
git commit -m "Add database backup"
git push
```

---

## Cost Breakdown (100% FREE)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Render Web Service | 2 vCPU, 512MB RAM, auto-suspend | FREE |
| PostgreSQL (Render) | 512MB storage, 1 concurrent connection | FREE |
| Redis (Render) | 256MB storage | FREE |
| Background Worker (Render) | 512MB RAM | FREE |
| Static Site (Render) | Unlimited bandwidth | FREE |
| GitHub Actions | 2000 minutes/month | FREE |
| Firebase FCM | Free tier | FREE |
| OpenStreetMap | Unlimited queries | FREE |
| **TOTAL** | | **$0/month** |

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
render logs civic-issues-api

# Check environment variables
render env civic-issues-api
```

### Database Connection Issues
```bash
# Verify connection string
psql "postgresql://..."

# Check database size
SELECT pg_size_pretty(pg_database_size('civic_issues'));
```

### AI Service Not Running
```bash
# Check worker logs
render logs civic-issues-ai

# Test locally
docker build -t civic-ai ai-service/
docker run -e REDIS_URL=... civic-ai
```

---

## Summary

- **100% Free Deployment** using Render Free Tier  
- **Zero AWS/GCP/Azure** costs  
- **Open-source only** tools  
- **Simple to scale** when needed  
- **Easy to migrate** to paid tiers if needed

All services are free and open-source. No hidden charges. No vendor lock-in!
