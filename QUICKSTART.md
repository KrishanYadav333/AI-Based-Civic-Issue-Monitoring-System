# Quick Start Scripts

## Start All Services (Development)

### Windows
```powershell
.\start-dev.bat
```

### Linux/Mac
```bash
./start-dev.sh
```

## Start Individual Services

### Backend
```bash
cd backend
npm run dev
```

### AI Service
```bash
cd ai-service
# Activate virtual environment
source D:/venvs/civic-issue-monitor/Scripts/activate  # Git Bash
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1      # PowerShell
D:\venvs\civic-issue-monitor\Scripts\activate.bat      # Command Prompt
python app.py
```

### Frontend
```bash
cd frontend
npm run dev
```

### Mobile App
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
