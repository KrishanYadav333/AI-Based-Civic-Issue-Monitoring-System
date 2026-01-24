# 🚀 Quick Start Guide

Get the entire system running in **5 minutes**!

## Prerequisites

✅ **Node.js** 16+ - [Download](https://nodejs.org/)
✅ **Python** 3.8+ - [Download](https://www.python.org/)
✅ **PostgreSQL** 14+ - [Download](https://www.postgresql.org/)
✅ **Redis** 6+ - [Download](https://redis.io/)

### Quick Check
```bash
node --version    # Should be 16+
python --version  # Should be 3.8+
psql --version    # Should be 14+
redis-cli --version
```

## 🔧 Automated Setup

### Windows
```powershell
.\scripts\setup.ps1
```

### Linux/Mac
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script automatically:
- Creates database with PostGIS
- Installs all dependencies
- Configures environment variables
- Seeds initial data
- Starts all services

## 🛠️ Manual Setup

### 1. Database Setup (2 min)
```bash
createdb civic_issues
psql -d civic_issues -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -d civic_issues -f database/schema.sql
psql -d civic_issues -f database/seed_data.sql
```

### 2. Backend Setup (1 min)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: Set DB_PASSWORD and JWT_SECRET
npm start
```

### 3. AI Service Setup (2 min)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app_ml.py  # Use app.py for feature-based classifier
```

### 4. Frontend Setup (1 min)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## ✅ Verify Installation

```bash
# Check services
curl http://localhost:3000/health  # Backend
curl http://localhost:5000/health  # AI Service
# Open http://localhost:3001 in browser
```

## 🎯 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vmc.gov.in | Admin@123 |
| Engineer | engineer1@vmc.gov.in | Engineer@123 |
| Surveyor | surveyor1@vmc.gov.in | Surveyor@123 |

⚠️ **Change passwords in production!**

## 🔄 Start Services (After Setup)

### Individual Services

**Backend**
```bash
cd backend
npm start  # Production
npm run dev  # Development with nodemon
```

**AI Service**
```bash
cd ai-service
source venv/bin/activate  # Linux/Mac
# Windows: .\venv\Scripts\activate
python app_ml.py  # CNN model (100% accuracy)
# OR
python app.py  # Feature-based classifier (faster)
```

**Frontend**
```bash
cd frontend
npm run dev  # Development
npm run build && npm run preview  # Production
```

**Mobile App**
```bash
cd mobile-app
npx expo start
```

## Using Docker

### Start all services
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop all services
```bash
docker-compose down
```

### Rebuild and start
```bash
docker-compose up -d --build
```

## 🆘 Troubleshooting

### Port Conflicts
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL running
pg_isready
# Verify credentials in backend/.env
psql -d civic_issues -c "SELECT 1;"
```

### AI Model Not Found
```bash
cd ai-service
# Train model (takes 5-10 minutes)
python train_model_improved.py
# OR use feature-based classifier
python app.py
```

### Missing Dependencies
```bash
# Backend
cd backend && npm install

# AI Service  
cd ai-service && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

## Database Commands

### Initialize database
```bash
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed_data.sql
```

### Backup database
```bash
pg_dump -U postgres civic_issues > backup.sql
```

### Restore database
```bash
psql -U postgres civic_issues < backup.sql
```

## Useful Commands

### Check service status
```bash
# Backend
curl http://localhost:3000/health

# AI Service
curl http://localhost:5000/health
```

### View logs
```bash
# Backend logs
tail -f backend/logs/combined.log

# AI Service (if running manually)
# Check terminal output
```

### Clear uploads
```bash
rm -rf backend/uploads/*
```

### Reset database
```bash
psql -U postgres civic_issues -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -f database/schema.sql
psql -U postgres -f database/seed_data.sql
```

## 📚 Next Steps

- **API Docs**: http://localhost:3000/api-docs
- **Architecture**: [plans/architecture.md](./plans/architecture.md)
- **Testing**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Production**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Full README**: [README.md](./README.md)

## 💡 Tips

- Use `app.py` for quick setup (no ML training needed)
- Use `app_ml.py` for 100% accuracy (requires trained model)
- Check logs: `backend/logs/` and service outputs
- API documentation available at `/api-docs` endpoint
- Model file (`best_model.keras`) is 10MB and excluded from Git
- Train locally using `train_model_improved.py` (5-10 minutes)

---

**Need Help?** Check [GitHub Issues](https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System/issues)
