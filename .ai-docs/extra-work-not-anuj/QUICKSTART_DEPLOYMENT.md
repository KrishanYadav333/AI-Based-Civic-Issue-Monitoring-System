# 🚀 Quick Start Guide - AI Civic Issue Monitor

**Get the system running in 5 minutes!**

---

## Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 15+
- Git

---

## Step 1: Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System

# Install backend
cd backend
npm install

# Install AI service
cd ../ai-service
pip install -r requirements.txt
```

---

## Step 2: Setup Database (1 minute)

```bash
# Create database
createdb civic_issues

# Apply schema
psql -d civic_issues -f database/schema_test.sql

# Seed test data
psql -d civic_issues -f database/seed_test_data.sql
```

---

## Step 3: Configure Environment (1 minute)

```bash
# Backend .env
cd backend
cat > .env << EOL
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-min-32-characters-long
AI_SERVICE_URL=http://localhost:5000
EOL

# AI Service .env
cd ../ai-service
cat > .env << EOL
FLASK_ENV=development
PORT=5000
EOL
```

---

## Step 4: Start Services (1 minute)

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: AI Service
cd ai-service
python app.py
```

---

## Step 5: Create Test Users & Test (1 minute)

```bash
# Seed test users
cd backend
npm run seed:users

# Health check
npm run health-check

# Run tests
npm test
```

---

## ✅ System Ready!

**API**: http://localhost:3000  
**Swagger Docs**: http://localhost:3000/api-docs  
**AI Service**: http://localhost:5000

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmc.gov.in","password":"Admin@123456"}'
```

---

## 📖 Next Steps

- Read [TESTING_CREDENTIALS.md](TESTING_CREDENTIALS.md) for all test accounts
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production setup
- Review [API Documentation](http://localhost:3000/api-docs)

---

## 🆘 Quick Troubleshooting

**Port 3000 in use?**
```bash
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Database connection failed?**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -d civic_issues -c "SELECT 1"
```

**Module not found?**
```bash
cd backend && npm install
cd ai-service && pip install -r requirements.txt
```

---

**Happy Testing! 🎉**
