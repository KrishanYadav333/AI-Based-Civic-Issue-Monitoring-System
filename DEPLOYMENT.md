# AI-Based Civic Issue Monitoring System - Deployment Guide

## Quick Start with Docker

The fastest way to run the entire system is using Docker Compose.

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- 4GB RAM minimum
- 10GB disk space

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Check service status**
```bash
docker-compose ps
```

5. **View logs**
```bash
docker-compose logs -f
```

### Accessing the Application

- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:3001
- **AI Service**: http://localhost:5000
- **Database**: localhost:5432

### Default Credentials

**Admin:**
- Email: admin@vmc.gov.in
- Password: admin123

**Engineer (Ward 1):**
- Email: engineer1@vmc.gov.in
- Password: engineer123

**Surveyor:**
- Email: surveyora@vmc.gov.in
- Password: surveyor123

⚠️ **Change these passwords in production!**

## Manual Installation

### 1. Database Setup

Install PostgreSQL 12+ with PostGIS extension:

**Windows:**
```bash
# Download from postgresql.org
# Install PostGIS from Application Stack Builder
```

**Linux:**
```bash
sudo apt-get install postgresql-12 postgresql-12-postgis-3
```

Create database:
```bash
psql -U postgres
CREATE DATABASE civic_issues;
\c civic_issues
CREATE EXTENSION postgis;
\q

# Run schema and seed data
psql -U postgres -d civic_issues -f database/schema.sql
psql -U postgres -d civic_issues -f database/seed_data.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
mkdir uploads logs
npm run dev
```

### 3. AI Service Setup

```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Mobile App Setup

```bash
cd mobile-app
npm install

# Update API_URL in src/context/AuthContext.js
# Replace 'http://your-backend-url:3000/api' with your backend URL

npx expo start
```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Update environment variables**
```bash
# Edit .env file
DB_PASSWORD=strong_password_here
JWT_SECRET=random_secret_key_here
NODE_ENV=production
```

2. **Build and start**
```bash
docker-compose up -d --build
```

3. **Setup SSL/TLS (recommended)**
- Use Nginx or Traefik as reverse proxy
- Obtain SSL certificates (Let's Encrypt)
- Configure HTTPS

### Cloud Deployment

#### AWS

1. **Database**: Amazon RDS PostgreSQL with PostGIS
2. **Backend**: ECS or Elastic Beanstalk
3. **Frontend**: S3 + CloudFront
4. **AI Service**: ECS or Lambda
5. **Storage**: S3 for images

#### Azure

1. **Database**: Azure Database for PostgreSQL with PostGIS
2. **Backend**: Azure App Service or Container Instances
3. **Frontend**: Azure Static Web Apps
4. **AI Service**: Azure Container Instances
5. **Storage**: Azure Blob Storage

#### Google Cloud

1. **Database**: Cloud SQL for PostgreSQL with PostGIS
2. **Backend**: Cloud Run or App Engine
3. **Frontend**: Cloud Storage + CDN
4. **AI Service**: Cloud Run
5. **Storage**: Cloud Storage

## Configuration

### Environment Variables

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:5000
PORT=3000
NODE_ENV=production
```

**AI Service (.env):**
```env
PORT=5000
DEBUG=False
MODEL_PATH=./models/civic_issue_model.h5
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Enable logging and monitoring
- [ ] Regular security updates

## Monitoring

### Health Checks

- Backend: `http://localhost:3000/health`
- AI Service: `http://localhost:5000/health`

### Logs

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f ai-service
```

**Manual:**
- Backend logs: `backend/logs/`
- AI Service: stdout/stderr

### Metrics to Monitor

- API response times
- Database connection pool
- Image upload success rate
- AI classification accuracy
- Issue resolution time
- System uptime

## Backup and Recovery

### Database Backup

```bash
# Backup
pg_dump -U postgres civic_issues > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres civic_issues < backup_20260113.sql
```

### File Storage Backup

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

## Troubleshooting

### Backend won't start
- Check database connection
- Verify PostgreSQL is running
- Check port 3000 availability
- Review logs: `backend/logs/error.log`

### AI Service errors
- Verify Python dependencies installed
- Check model file exists (if using custom model)
- Review Python logs

### Database connection issues
- Verify PostgreSQL is running
- Check connection credentials
- Ensure PostGIS extension is installed
- Check firewall rules

### Mobile app can't connect
- Update API_URL in AuthContext.js
- Ensure backend is accessible from device
- Check network connectivity
- Verify CORS settings

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Enable connection pooling
- Regular VACUUM and ANALYZE
- Optimize PostGIS queries

### Backend
- Enable gzip compression
- Implement caching (Redis)
- Use CDN for static files
- Load balancing for multiple instances

### Frontend
- Code splitting
- Image optimization
- Browser caching
- Minification

## Scaling

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Database read replicas
- Separate AI service instances
- CDN for static content

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Tune database parameters
- Increase worker processes

## Support

For issues and questions:
- GitHub Issues: https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System/issues
- Documentation: See README.md and plan files

## License

MIT License - See LICENSE file for details
