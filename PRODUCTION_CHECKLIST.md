# 🚀 Production Deployment Checklist

## Pre-Deployment Requirements

### ✅ Environment Setup
- [ ] PostgreSQL 14+ installed with PostGIS extension
- [ ] Redis 6+ installed and running
- [ ] Node.js 16+ installed
- [ ] Python 3.8+ installed
- [ ] Domain/subdomain configured
- [ ] SSL certificates obtained
- [ ] Environment variables configured

### ✅ Security Hardening
- [ ] Changed all default passwords
- [ ] JWT_SECRET is 32+ characters random string
- [ ] Database user has minimal required privileges
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting configured
- [ ] File upload limits set
- [ ] HTTPS enforced
- [ ] Security headers configured (Helmet.js)

### ✅ Database
- [ ] Production database created
- [ ] PostGIS extension installed
- [ ] Schema applied (`database/schema.sql`)
- [ ] Initial data seeded (`database/seed_data.sql`)
- [ ] Ward boundaries populated (19 wards for Vadodara)
- [ ] Database backups configured (daily recommended)
- [ ] Connection pooling configured (max 20 connections)
- [ ] Spatial indexes created and optimized
- [ ] Connection pooling configured

### ✅ AI Model
- [ ] Model trained (`train_model_improved.py`)
- [ ] Model file exists (`models/best_model.keras`)
- [ ] Class indices file exists (`models/class_indices.json`)
- [ ] Model accuracy validated (>90%)
- [ ] Inference time tested (<500ms)

### ✅ Backend Service
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Logs directory created
- [ ] Uploads directory created
- [ ] Database connection tested
- [ ] AI service connection tested
- [ ] All tests passing (`npm test`)
- [ ] No lint errors (`npm run lint`)

### ✅ AI Service
- [ ] Virtual environment created
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Model loaded successfully
- [ ] Flask app starts without errors
- [ ] Health endpoint responding
- [ ] Detection endpoint tested

### ✅ Frontend
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Build successful (`npm run build`)
- [ ] Static files served correctly
- [ ] API endpoints configured correctly

### ✅ Monitoring & Logging
- [ ] Winston logging configured
- [ ] Log rotation enabled
- [ ] Error tracking setup
- [ ] Prometheus metrics enabled (optional)
- [ ] Grafana dashboards configured (optional)
- [ ] Health check endpoints tested

### ✅ Performance
- [ ] API response time <100ms (average)
- [ ] AI inference time <500ms
- [ ] Database queries optimized
- [ ] Spatial indexes created
- [ ] Redis caching working
- [ ] Compression enabled

### ✅ Backup & Recovery
- [ ] Database backup script tested
- [ ] Backup schedule configured
- [ ] Recovery procedure documented
- [ ] Model files backed up
- [ ] Uploaded images backed up

## Deployment Commands

### Using Docker (Recommended)
```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using PM2 (Traditional)
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start ecosystem.config.js

# Start AI service
cd ../ai-service
pm2 start "gunicorn -w 4 -b 0.0.0.0:5000 app_ml:app" --name ai-service

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Systemd (Linux)
```bash
# Create service files
sudo cp scripts/civic-backend.service /etc/systemd/system/
sudo cp scripts/civic-ai.service /etc/systemd/system/

# Enable and start
sudo systemctl enable civic-backend civic-ai
sudo systemctl start civic-backend civic-ai

# Check status
sudo systemctl status civic-backend civic-ai
```

## Post-Deployment Verification

### Health Checks
```bash
# Backend
curl https://your-domain.com/health

# AI Service
curl https://your-domain.com/api/ai/health

# Database
psql -h localhost -U your_user -d civic_issues -c "SELECT COUNT(*) FROM users;"
```

### Smoke Tests
```bash
# Login test
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmc.gov.in","password":"NewSecurePassword"}'

# Create issue test (requires auth token)
curl -X POST https://your-domain.com/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg" \
  -F "latitude=22.3072" \
  -F "longitude=73.1812"
```

### Performance Tests
```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://your-domain.com/health

# AI inference timing
time curl -X POST https://your-domain.com/api/detect \
  -F "image=@test-image.jpg"
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit              # Real-time monitoring
pm2 logs               # View logs
pm2 restart all        # Restart services
```

### Docker Monitoring
```bash
docker stats           # Container resource usage
docker-compose logs -f # Follow logs
```

### Database Monitoring
```bash
# Connection count
psql -d civic_issues -c "SELECT count(*) FROM pg_stat_activity;"

# Slow queries
psql -d civic_issues -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Troubleshooting

### Backend Issues
```bash
# Check logs
tail -f backend/logs/error.log

# Restart service
pm2 restart backend
# OR
docker-compose restart backend
```

### AI Service Issues
```bash
# Check model file
ls -lh ai-service/models/best_model.keras

# Test model loading
python -c "from tensorflow import keras; model = keras.models.load_model('ai-service/models/best_model.keras'); print('OK')"

# Restart service
pm2 restart ai-service
```

### Database Issues
```bash
# Check connections
psql -d civic_issues -c "SELECT * FROM pg_stat_activity WHERE datname='civic_issues';"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Rollback Procedure

### If deployment fails:
```bash
# Stop services
pm2 stop all
# OR
docker-compose down

# Restore previous version
git checkout main
git pull origin main

# Restore database backup
psql -d civic_issues < backups/civic_issues_backup.sql

# Restart services
pm2 start all
# OR
docker-compose up -d
```

## Maintenance

### Weekly
- [ ] Check disk space
- [ ] Review error logs
- [ ] Verify backups
- [ ] Check service uptime

### Monthly
- [ ] Update dependencies (security patches)
- [ ] Review slow queries
- [ ] Clean up old logs
- [ ] Optimize database
- [ ] Review AI model performance

### Quarterly
- [ ] Retrain AI model with new data
- [ ] Review security configuration
- [ ] Load testing
- [ ] Disaster recovery drill

## Emergency Contacts

- **DevOps Lead**: [Contact Info]
- **Database Admin**: [Contact Info]
- **AI/ML Engineer**: [Contact Info]
- **Backend Lead**: [Contact Info]

## Additional Resources

- [Architecture Documentation](./plans/architecture.md)
- [API Documentation](http://localhost:3000/api-docs)
- [Database Schema](./plans/database_schema.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Last Updated**: January 22, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
