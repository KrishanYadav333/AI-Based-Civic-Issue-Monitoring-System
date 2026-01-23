# 🚀 Quick Deployment Guide

## One-Command Deployment

### Windows (PowerShell)
```powershell
cd scripts
.\deploy.ps1
```

### Linux/Mac (Bash)
```bash
cd scripts
chmod +x deploy.sh setup-database.sh
./deploy.sh
```

## What Gets Deployed

✅ PostgreSQL database with all tables  
✅ Backend Node.js API  
✅ AI Python service  
✅ React frontend  
✅ Sample data for testing  

## Prerequisites

Install these first:
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/downloads/)

## Manual Setup (If Scripts Fail)

### 1. Database
```powershell
# Windows
cd backend
$env:PGPASSWORD='root'
psql -h localhost -U postgres -c "CREATE DATABASE civic_issues;"
psql -h localhost -U postgres -d civic_issues -f database/schema.sql
psql -h localhost -U postgres -d civic_issues -f database/schema-simple.sql
psql -h localhost -U postgres -d civic_issues -f database/seed.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

### 3. AI Service
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access URLs

After deployment:
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000
- 🤖 **AI Service**: http://localhost:5000
- 📚 **API Docs**: http://localhost:3000/api-docs

## Default Credentials

**Admin User:**
- Username: `admin`
- Password: `Admin@123`

**Database:**
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `root` (change this!)
- Database: `civic_issues`

## Verify Deployment

```bash
# Check backend health
curl http://localhost:3000/health

# Check AI service
curl http://localhost:5000/health

# Check database
psql -h localhost -U postgres -d civic_issues -c "SELECT COUNT(*) FROM issue_types;"
```

Expected output: 6 issue types

## Common Issues

### Port Already In Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux/Mac

# Kill process
taskkill /PID <PID> /F  # Windows
kill <PID>  # Linux/Mac
```

### Database Connection Error
1. Check PostgreSQL is running
2. Verify password in .env matches your PostgreSQL password
3. Run: `psql -h localhost -U postgres -l` to test connection

### Module Not Found
```bash
# Backend
cd backend && npm install

# AI Service
cd ai-service && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

## Testing

```bash
# Run all tests
cd backend && npm test

# Just verify services are up
curl http://localhost:3000/health
curl http://localhost:5000/health
```

## Docker Deployment (Alternative)

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Production Deployment

For production, update:
1. Change all default passwords
2. Use environment-specific .env files
3. Enable HTTPS
4. Set up reverse proxy (Nginx)
5. Configure firewall rules
6. Set up automated backups
7. Enable monitoring (Grafana)

See [DEPLOYMENT_SETUP_SUMMARY.md](./DEPLOYMENT_SETUP_SUMMARY.md) for complete guide.

## Need Help?

1. Check logs: `backend/logs/combined.log`
2. View API docs: http://localhost:3000/api-docs
3. Review health status: http://localhost:3000/health

## What's Next?

After deployment:
1. ✅ Test API endpoints via Postman or API docs
2. ✅ Create test users (surveyors, engineers)
3. ✅ Submit test issues via mobile app or frontend
4. ✅ Monitor system logs
5. ✅ Configure email notifications (optional)

---

**Quick Reference:**
- Deployment Scripts: `scripts/`
- Database Schema: `backend/database/`
- API Documentation: http://localhost:3000/api-docs
- Full Guide: [DEPLOYMENT_SETUP_SUMMARY.md](./DEPLOYMENT_SETUP_SUMMARY.md)
