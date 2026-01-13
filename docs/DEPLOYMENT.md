# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Deployment Options](#deployment-options)
5. [Security](#security)
6. [Monitoring](#monitoring)
7. [Backup and Recovery](#backup-and-recovery)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB minimum (for database, uploads, and logs)
- **OS**: Linux (Ubuntu 20.04+ recommended), Windows Server 2019+, or macOS

### Software Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **PostgreSQL**: 12.x or higher with PostGIS extension
- **Redis**: 7.x or higher (for caching and rate limiting)
- **Docker**: 20.10+ and Docker Compose 2.0+ (optional but recommended)

## Installation

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System
```

2. **Configure environment**:
```bash
cp .env.production.example .env.production
# Edit .env.production with your configuration
nano .env.production
```

3. **Start services**:
```bash
docker-compose up -d
```

4. **Verify deployment**:
```bash
curl http://localhost:3000/health
curl http://localhost:5000/health
```

### Option 2: Manual Deployment

1. **Run setup script**:
```bash
# Linux/macOS
chmod +x scripts/setup.sh
./scripts/setup.sh

# Windows
PowerShell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

2. **Start services**:

**Backend**:
```bash
cd backend
npm start
```

**AI Service**:
```bash
cd ai-service
source venv/bin/activate  # Windows: venv\Scripts\activate
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

**Frontend** (build for production):
```bash
cd frontend
npm run build
# Serve with nginx or similar
```

## Configuration

### Database Setup

1. **Create database**:
```bash
psql -U postgres
CREATE DATABASE civic_issues;
\c civic_issues
CREATE EXTENSION postgis;
```

2. **Run migrations**:
```bash
psql -U postgres -d civic_issues -f database/schema.sql
psql -U postgres -d civic_issues -f database/seed_data.sql
```

### SSL/TLS Configuration

For production, enable HTTPS:

1. **Obtain SSL certificates** (Let's Encrypt recommended):
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

2. **Configure Nginx**:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Deployment Options

### AWS Deployment

1. **EC2 Instance**:
   - Launch Ubuntu 22.04 LTS instance (t3.medium or larger)
   - Open ports: 80, 443, 22
   - Assign Elastic IP

2. **RDS PostgreSQL**:
   - Create PostgreSQL 14+ instance with PostGIS
   - Configure security groups
   - Update backend `.env` with RDS endpoint

3. **S3 for File Storage**:
   - Create S3 bucket for image uploads
   - Configure IAM roles and policies
   - Update backend to use S3 SDK

4. **CloudWatch for Monitoring**:
   - Configure CloudWatch agent
   - Set up log groups
   - Create alarms for critical metrics

### Google Cloud Deployment

1. **Compute Engine**:
   - Create VM instance with Ubuntu
   - Configure firewall rules

2. **Cloud SQL**:
   - Create PostgreSQL instance
   - Enable PostGIS extension

3. **Cloud Storage**:
   - Create storage bucket
   - Configure access permissions

### Azure Deployment

1. **Virtual Machine**:
   - Deploy Ubuntu VM

2. **Azure Database for PostgreSQL**:
   - Create server instance

3. **Azure Blob Storage**:
   - Configure storage account

## Security

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Regular security audits
- [ ] Keep dependencies updated

### User Security

**Password Policy**:
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special character
- Passwords hashed with bcrypt (salt rounds: 10)

**Authentication**:
- JWT tokens with 24-hour expiration
- Rate limiting on login attempts (5 attempts per 15 minutes)
- Optional: Implement 2FA

### Database Security

```sql
-- Create read-only user for backups
CREATE USER backup_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE civic_issues TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Create application user with limited privileges
CREATE USER civic_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE civic_issues TO civic_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO civic_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO civic_app;
```

## Monitoring

### Health Checks

**Backend**: `GET /health`
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T10:30:00Z",
  "uptime": 3600,
  "services": {
    "database": "ok",
    "ai": "ok"
  }
}
```

**AI Service**: `GET /health`
```json
{
  "status": "ok",
  "service": "AI Issue Detection"
}
```

### Prometheus Metrics

Add to `docker-compose.yml`:
```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  depends_on:
    - prometheus
```

### Log Management

**Centralized Logging** with ELK Stack:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

## Backup and Recovery

### Automated Backups

**Daily backups** (add to crontab):
```bash
0 2 * * * /path/to/scripts/backup.sh full >> /var/log/civic-backup.log 2>&1
```

**Backup to S3**:
```bash
#!/bin/bash
BACKUP_FILE=$(ls -t backups/*.gz | head -1)
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/$(date +\%Y-\%m-\%d)/
```

### Disaster Recovery

1. **Regular testing**: Test backups monthly
2. **Off-site backups**: Store in different region/provider
3. **Recovery Time Objective (RTO)**: < 4 hours
4. **Recovery Point Objective (RPO)**: < 24 hours

### Recovery Procedure

```bash
# 1. Stop services
docker-compose down

# 2. Restore database
./scripts/restore.sh backups/latest-backup.sql.gz

# 3. Restore uploads
aws s3 sync s3://your-backup-bucket/uploads ./uploads/

# 4. Start services
docker-compose up -d

# 5. Verify
curl http://localhost:3000/health
```

## Troubleshooting

### Common Issues

**1. Database connection failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U postgres -h localhost -d civic_issues -c "SELECT 1;"

# View logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

**2. Port already in use**
```bash
# Find process using port
lsof -i :3000
# or
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

**3. Out of disk space**
```bash
# Check disk usage
df -h

# Clean up old logs
find backend/logs -name "*.log" -mtime +30 -delete

# Clean up old backups
find backups -name "*.gz" -mtime +7 -delete
```

**4. High memory usage**
```bash
# Check memory
free -m

# Restart services
docker-compose restart

# Optimize PostgreSQL
# Edit postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
```

**5. Slow API responses**
```bash
# Check database performance
psql -U postgres -d civic_issues -c "
SELECT pid, query, state, wait_event_type
FROM pg_stat_activity
WHERE state != 'idle';"

# Add indexes if needed
psql -U postgres -d civic_issues -c "
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);"
```

### Support

For issues not covered here:
1. Check GitHub issues
2. Review application logs
3. Contact: support@vmc.gov.in

## Performance Optimization

### Database

```sql
-- Analyze and vacuum
VACUUM ANALYZE;

-- Update statistics
ANALYZE;

-- Reindex
REINDEX DATABASE civic_issues;
```

### Caching

- Enable Redis caching for frequent queries
- Configure CDN for static assets
- Use browser caching headers

### Load Balancing

For high-traffic scenarios:
```yaml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend-1
    - backend-2
    - backend-3
```

## Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor system health
- Check error logs
- Review security alerts

**Weekly**:
- Analyze database performance
- Review disk usage
- Update dependencies (dev environment)

**Monthly**:
- Apply security patches
- Test disaster recovery
- Review and rotate logs
- Performance tuning

**Quarterly**:
- Security audit
- Capacity planning
- Update documentation
