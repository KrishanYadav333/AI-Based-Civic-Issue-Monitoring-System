# Quick Start Guide - Krishan's Implementation

Get the complete backend + AI service running in 5 minutes!

## Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 14+ with PostGIS
- Redis (optional)

## 1. Clone and Setup

```bash
# Navigate to project
cd "AI-Based Civic Issue Monitoring System"

# Checkout dev-krishan branch
git checkout dev-krishan
```

## 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# At minimum, update: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
```

## 3. Database Setup

```bash
# Create database
createdb civic_monitoring

# Enable PostGIS
psql -d civic_monitoring -c "CREATE EXTENSION postgis;"

# Run schema
psql -d civic_monitoring -f database/schema.sql

# Run seed data (optional)
psql -d civic_monitoring -f database/seed.sql
```

## 4. Start Backend

```bash
# From backend/ directory
npm run dev

# Server starts on http://localhost:3000
# Check health: http://localhost:3000/health
```

## 5. AI Service Setup

```bash
# Open new terminal
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# No changes needed for local dev
```

## 6. Start AI Service

```bash
# From ai-service/ directory (venv activated)
python src/main.py

# Service starts on http://localhost:8000
# Check health: http://localhost:8000/health
# API docs: http://localhost:8000/docs
```

## 7. Test the System

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_surveyor",
    "email": "surveyor@example.com",
    "password": "test1234",
    "role": "surveyor"
  }'
```

Copy the `token` from response.

### Submit Issue
```bash
# Replace YOUR_TOKEN with token from above
# Replace IMAGE_PATH with actual image path

curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 22.3072,
    "longitude": 73.1812,
    "image_url": "/path/to/image.jpg",
    "description": "Test issue"
  }'
```

### Get Issues
```bash
curl http://localhost:3000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 8. Verify Everything Works

✅ Backend running on port 3000  
✅ AI service running on port 8000  
✅ Database connected  
✅ Can register users  
✅ Can submit issues  
✅ Can view issues  

## Troubleshooting

**Database connection error**:
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -d civic_monitoring -c "SELECT NOW();"
```

**PostGIS not found**:
```bash
psql -d civic_monitoring -c "CREATE EXTENSION postgis;"
```

**AI service model download slow**:
The YOLOv8n model (~6MB) downloads automatically on first run. Wait for download to complete.

**Port already in use**:
```bash
# Change PORT in .env files
# Backend: PORT=3001
# AI service: PORT=8001
```

## What's Running

- **Backend API**: http://localhost:3000
  - Swagger docs: Not implemented (use curl/Postman)
  - Health: http://localhost:3000/health
  
- **AI Service**: http://localhost:8000
  - Swagger docs: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc
  - Health: http://localhost:8000/health

## Sample Credentials (from seed.sql)

```
Admin:
Username: admin
Password: admin123

Surveyor:
Username: surveyor1
Password: surveyor123

Engineer:
Username: engineer1
Password: engineer123
```

## Next Steps

1. Read [backend/README.md](backend/README.md) for full API documentation
2. Read [ai-service/README.md](ai-service/README.md) for AI service details
3. Check [KRISHAN_IMPLEMENTATION_COMPLETE.md](KRISHAN_IMPLEMENTATION_COMPLETE.md) for complete implementation details
4. Integrate with frontend (Adil's part)
5. Test mobile integration (Abhishek's part)
6. Deploy to production (Shivangi's part)

## Support

For issues or questions:
1. Check the READMEs in backend/ and ai-service/
2. Review the implementation documentation
3. Check database/README.md for PostGIS queries
4. Review code comments in src/ files

**Happy coding! 🚀**
