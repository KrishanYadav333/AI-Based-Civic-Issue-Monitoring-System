# 🚀 Deployment Guide - AI Civic Issue Monitor

**Project**: Vadodara Municipal Corporation - Civic Issue Monitoring System  
**Version**: 1.0.0  
**Last Updated**: January 22, 2026

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [AI Service Deployment](#ai-service-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Mobile App Deployment](#mobile-app-deployment)
8. [Testing Credentials](#testing-credentials)
9. [Health Checks](#health-checks)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Run this before any deployment:

```bash
# Run automated checks
npm run pre-deploy

# Or manually run:
node scripts/pre-deploy-check.js
```

### Manual Checklist

- [ ] All environment variables configured
- [ ] Database credentials valid
- [ ] PostgreSQL 15+ installed with PostGIS
- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Redis server running (optional but recommended)
- [ ] SMTP credentials configured (for emails)
- [ ] SSL certificates ready (production)
- [ ] Domain names configured
- [ ] Firewall rules set
- [ ] Backup strategy in place

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Mobile App
cd ../mobile-app
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example files
cp .env.production.example backend/.env
cp .env.example ai-service/.env
cp .env.example frontend/.env
cp .env.example mobile-app/.env

# Edit each .env file with actual values
```

**Required Environment Variables**:

#### Backend (.env)
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=civic_admin
DB_PASSWORD=<SECURE_PASSWORD>

# JWT Secret (MUST be 32+ characters)
JWT_SECRET=<GENERATE_SECURE_32_CHAR_SECRET>

# AI Service
AI_SERVICE_URL=http://localhost:5000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<YOUR_EMAIL>
SMTP_PASS=<YOUR_APP_PASSWORD>

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

#### AI Service (.env)
```env
FLASK_ENV=production
PORT=5000
MODEL_PATH=./models
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=10485760
```

---

## 🗄️ Database Setup

### 1. Install PostgreSQL with PostGIS

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

**Windows**:
```bash
# Download from https://www.postgresql.org/download/windows/
# During installation, select PostGIS extension
```

### 2. Create Database

```bash
# Connect as postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE civic_issues;
CREATE USER civic_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE civic_issues TO civic_admin;

# Enable PostGIS
\c civic_issues
CREATE EXTENSION postgis;
\q
```

### 3. Run Migrations

```bash
cd database

# Apply schema
psql -U civic_admin -d civic_issues -f schema.sql

# Load seed data (optional for testing)
psql -U civic_admin -d civic_issues -f seed_data.sql

# Load Vadodara ward boundaries
psql -U civic_admin -d civic_issues -f vadodara_wards.sql
```

### 4. Verify Database

```bash
psql -U civic_admin -d civic_issues -c "SELECT PostGIS_version();"
psql -U civic_admin -d civic_issues -c "SELECT COUNT(*) FROM wards;"
```

---

## 🖥️ Backend Deployment

### Development Mode

```bash
cd backend
npm run dev
```

### Production Mode

#### Option 1: Direct Node.js

```bash
cd backend
npm start
```

#### Option 2: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option 3: Docker

```bash
# Build and run with Docker Compose
docker-compose up -d backend
```

### Verify Backend

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","services":{"database":"ok","ai":"ok"}}
```

---

## 🤖 AI Service Deployment

### Development Mode

```bash
cd ai-service
python app.py
```

### Production Mode

#### Option 1: Gunicorn (Recommended)

```bash
cd ai-service
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Option 2: Systemd Service

Create `/etc/systemd/system/civic-ai-service.service`:

```ini
[Unit]
Description=Civic Issue AI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/civic-monitor/ai-service
Environment="PATH=/opt/civic-monitor/ai-service/venv/bin"
ExecStart=/opt/civic-monitor/ai-service/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable civic-ai-service
sudo systemctl start civic-ai-service
```

#### Option 3: Docker

```bash
docker-compose up -d ai-service
```

### Verify AI Service

```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","service":"AI Issue Detection"}
```

---

## 🌐 Frontend Deployment

### Build for Production

```bash
cd frontend
npm run build
```

### Option 1: Nginx (Recommended)

```nginx
# /etc/nginx/sites-available/civic-monitor
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/civic-monitor/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/civic-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker

```bash
docker-compose up -d frontend
```

---

## 📱 Mobile App Deployment

### Android

```bash
cd mobile-app

# Build APK
npx expo build:android

# Or create production bundle
npm run build:android
```

### iOS

```bash
cd mobile-app

# Build for iOS
npx expo build:ios

# Or create production bundle
npm run build:ios
```

### Expo Go (Development)

```bash
cd mobile-app
npx expo start
```

---

## 🔑 Testing Credentials

### Pre-Created Test Accounts

#### Admin Account
```
Email: admin@vmc.gov.in
Password: Admin@123456
Role: admin
Access: Full system access, all wards
```

#### Engineer Account (Ward 1)
```
Email: engineer1@vmc.gov.in
Password: Engineer@123456
Role: engineer
Ward: Ward 1 - Sayajigunj
Access: View and resolve issues in Ward 1
```

#### Engineer Account (Ward 2)
```
Email: engineer2@vmc.gov.in
Password: Engineer@123456
Role: engineer
Ward: Ward 2 - Alkapuri
Access: View and resolve issues in Ward 2
```

#### Surveyor Account
```
Email: surveyor@vmc.gov.in
Password: Surveyor@123456
Role: surveyor
Access: Create and submit issues
```

### Creating Test Users

Run the seed script:
```bash
cd backend
npm run seed:users
```

Or manually via API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "role": "surveyor"
  }'
```

---

## 🏥 Health Checks

### Automated Health Check

```bash
# Run all health checks
npm run health-check

# Or manually:
node scripts/health-check.js
```

### Manual Health Checks

#### Backend
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T...",
  "uptime": 123.45,
  "services": {
    "database": "ok",
    "ai": "ok"
  }
}
```

#### AI Service
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "AI Issue Detection"
}
```

#### Database
```bash
psql -U civic_admin -d civic_issues -c "SELECT 1;"
```

#### Redis
```bash
redis-cli ping
# Should return: PONG
```

---

## 🧪 Testing Guide

### 1. API Testing with curl

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmc.gov.in","password":"Admin@123456"}'
```

Save the token from response.

**Create Issue** (with image):
```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "latitude=22.305" \
  -F "longitude=73.185" \
  -F "image=@/path/to/image.jpg"
```

**List Issues**:
```bash
curl http://localhost:3000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Run Unit Tests

```bash
cd backend
npm test
```

### 3. Run Integration Tests

```bash
cd backend
npm run test:integration
```

### 4. Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/health
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U civic_admin -d civic_issues -h localhost -p 5432

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### PostGIS Not Found

```bash
# Install PostGIS
sudo apt install postgis postgresql-15-postgis-3

# Enable in database
psql -U postgres -d civic_issues -c "CREATE EXTENSION postgis;"
```

### AI Service 500 Error

```bash
# Check Python dependencies
pip list | grep -E "Flask|Pillow|numpy"

# Check logs
tail -f ai-service/logs/error.log

# Test AI service directly
curl -X POST http://localhost:5000/api/detect \
  -F "image=@test.jpg"
```

### Redis Connection Failed

```bash
# Install Redis
sudo apt install redis-server

# Start Redis
sudo systemctl start redis

# Test connection
redis-cli ping
```

---

## 📊 Monitoring

### Prometheus + Grafana (Optional)

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana: http://localhost:3002
# Default credentials: admin/admin
```

### Basic Monitoring

```bash
# Watch logs
pm2 logs

# Monitor processes
pm2 monit

# Check resource usage
htop
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Enable audit logging
- [ ] Use secure JWT secret (32+ chars)

---

## 📞 Support

**Issues**: https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System/issues  
**Documentation**: See `/docs` folder  
**Team Lead**: Anuj (Backend Team)

---

**Deployment Complete!** 🎉

For production deployment, consider:
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- Database replication
- CDN for static assets
- Monitoring & alerting
- Automated backups
