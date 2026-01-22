# ⚠️ DEPRECATED - See DEPLOYMENT_RENDER.md

This file contains the original AWS/Kubernetes deployment guide.

**For the current 100% Free Stack deployment, please refer to: [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)**

---

# Deployment Guide (ARCHIVED - AWS/Kubernetes)

This guide is provided for reference only. The project now uses **Render Free Tier for deployment** instead of AWS/Kubernetes.

See `DEPLOYMENT_RENDER.md` for the current deployment instructions.

---

## Prerequisites

### Infrastructure Requirements
- Kubernetes cluster (EKS/GKE/AKS)
- PostgreSQL database (RDS/Cloud SQL)
- Redis cache (ElastiCache/Memorystore)
- S3-compatible storage bucket
- Domain name and SSL certificates
- CI/CD pipeline (GitHub Actions/GitLab CI)

### Software Requirements
- Docker 20.10+
- Kubernetes 1.24+
- Helm 3.8+
- kubectl configured
- AWS CLI / gcloud CLI / az CLI

### Access Requirements
- Administrative access to cloud provider
- Database admin credentials
- SSH access to bastion host (if applicable)
- API keys for third-party services

---

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Production (.env.prod)
```bash
# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.civicmonitoring.vmc.in

# Database
DATABASE_URL=postgresql://user:password@prod-db-host:5432/civic_issues
DB_SSL=true
DB_POOL_SIZE=20
DB_IDLE_TIMEOUT=30000

# Redis
REDIS_URL=redis://prod-redis-host:6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_production_jwt_secret_key
JWT_EXPIRY=24h

# AI Service
AI_SERVICE_URL=https://ai-service.civicmonitoring.vmc.in

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=civic-issues-prod
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_CLOUDFRONT_URL=https://cdn.civicmonitoring.vmc.in

# Email/SMS (Production)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_user
SMTP_PASS=your_ses_smtp_password
SMS_API_KEY=your_sms_api_key

# Monitoring
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
NEW_RELIC_LICENSE_KEY=your_new_relic_key

# Security
CORS_ORIGIN=https://dashboard.civicmonitoring.vmc.in
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json
```

#### Staging (.env.staging)
Similar to production but with staging-specific values.

#### Development (.env.dev)
Local development configuration.

### Secrets Management

Use cloud-native secrets management:

#### AWS Secrets Manager
```bash
# Store secrets
aws secretsmanager create-secret \
  --name civic-issues/prod/database \
  --secret-string '{"username":"dbuser","password":"dbpass"}'

# Retrieve in application
const secrets = await awsSecrets.getSecretValue({ SecretId: 'civic-issues/prod/database' });
```

#### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: civic-issues-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  db-password: <base64-encoded-password>
```

---

## Database Setup

### PostgreSQL Configuration

1. **Create RDS Instance**
```bash
aws rds create-db-instance \
  --db-instance-identifier civic-issues-prod \
  --db-instance-class db.r6g.large \
  --engine postgres \
  --engine-version 14.6 \
  --allocated-storage 100 \
  --master-username admin \
  --master-user-password <password> \
  --vpc-security-group-ids <security-group> \
  --db-subnet-group-name <subnet-group>
```

2. **Enable PostGIS Extension**
```sql
-- Connect to database
psql -h prod-db-host -U admin -d civic_issues

-- Enable extensions
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE EXTENSION pg_stat_statements;
```

3. **Create Database Schema**
```bash
# Run migrations
psql -h prod-db-host -U admin -d civic_issues < database/schema.sql

# Load initial data
psql -h prod-db-host -U admin -d civic_issues < database/seeds/wards.sql
psql -h prod-db-host -U admin -d civic_issues < database/seeds/departments.sql
```

4. **Configure Read Replica**
```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier civic-issues-prod-replica \
  --source-db-instance-identifier civic-issues-prod
```

### Redis Setup

1. **Create ElastiCache Cluster**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id civic-issues-redis \
  --cache-node-type cache.r6g.large \
  --engine redis \
  --engine-version 6.2 \
  --num-cache-nodes 2 \
  --security-group-ids <security-group>
```

2. **Configure Redis Parameters**
- maxmemory-policy: allkeys-lru
- tcp-keepalive: 300
- timeout: 300

---

## Containerization

### Docker Images

#### Backend Dockerfile
```dockerfile
FROM node:16-alpine

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
CMD ["npm", "start"]
```

#### AI Service Dockerfile
```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and source
COPY models/ ./models/
COPY src/ ./src/

EXPOSE 8001
CMD ["python", "src/main.py"]
```

### Build and Push Images

```bash
# Build images
docker build -t civic-issues-backend:latest ./backend
docker build -t civic-issues-ai:latest ./ai-service

# Tag for registry
docker tag civic-issues-backend:latest your-registry.com/civic-issues-backend:v1.0.0
docker tag civic-issues-ai:latest your-registry.com/civic-issues-ai:v1.0.0

# Push to registry
docker push your-registry.com/civic-issues-backend:v1.0.0
docker push your-registry.com/civic-issues-ai:v1.0.0
```

---

## Kubernetes Deployment

### Namespace Setup

```bash
# Create namespace
kubectl create namespace civic-issues-prod

# Set context
kubectl config set-context --current --namespace=civic-issues-prod
```

### ConfigMaps and Secrets

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: civic-issues-config
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "warn"

# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: civic-issues-secrets
type: Opaque
data:
  jwt-secret: <base64>
  db-password: <base64>
  redis-password: <base64>
```

### Database Migration Job

```yaml
# migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migration
        image: your-registry.com/civic-issues-backend:v1.0.0
        command: ["npm", "run", "migrate"]
        envFrom:
        - configMapRef:
            name: civic-issues-config
        - secretRef:
            name: civic-issues-secrets
      restartPolicy: Never
```

### Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civic-issues-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: civic-issues-backend
  template:
    metadata:
      labels:
        app: civic-issues-backend
    spec:
      containers:
      - name: backend
        image: your-registry.com/civic-issues-backend:v1.0.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: civic-issues-config
        - secretRef:
            name: civic-issues-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### AI Service Deployment

```yaml
# ai-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: civic-issues-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: civic-issues-ai
  template:
    metadata:
      labels:
        app: civic-issues-ai
    spec:
      containers:
      - name: ai
        image: your-registry.com/civic-issues-ai:v1.0.0
        ports:
        - containerPort: 8001
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
            nvidia.com/gpu: 1  # If using GPU
          limits:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 60
          periodSeconds: 30
```

### Services

```yaml
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: civic-issues-backend
spec:
  selector:
    app: civic-issues-backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP

# ai-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: civic-issues-ai
spec:
  selector:
    app: civic-issues-ai
  ports:
  - port: 8001
    targetPort: 8001
  type: ClusterIP
```

### Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: civic-issues-ingress
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.civicmonitoring.vmc.in
    - dashboard.civicmonitoring.vmc.in
    secretName: civic-issues-tls
  rules:
  - host: api.civicmonitoring.vmc.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: civic-issues-backend
            port:
              number: 3000
  - host: dashboard.civicmonitoring.vmc.in
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: civic-issues-web
            port:
              number: 80
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: your-registry.com
  IMAGE_NAME: civic-issues

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build and push backend
      uses: docker/build-push-action@v3
      with:
        context: ./backend
        push: true
        tags: ${{ steps.login-ecr.outputs.registry }}/civic-issues-backend:latest

    - name: Build and push AI service
      uses: docker/build-push-action@v3
      with:
        context: ./ai-service
        push: true
        tags: ${{ steps.login-ecr.outputs.registry }}/civic-issues-ai:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kube config
      run: aws eks update-kubeconfig --name civic-issues-prod

    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/civic-issues-backend backend=${{ steps.login-ecr.outputs.registry }}/civic-issues-backend:latest
        kubectl set image deployment/civic-issues-ai ai=${{ steps.login-ecr.outputs.registry }}/civic-issues-ai:latest
        kubectl rollout status deployment/civic-issues-backend
        kubectl rollout status deployment/civic-issues-ai
```

---

## Monitoring & Observability

### Application Monitoring

#### Health Checks
```javascript
// backend/src/routes/health.js
router.get('/health', (req, res) => {
  // Check database connection
  // Check Redis connection
  // Check AI service availability
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.get('/ready', (req, res) => {
  // Check if app is ready to serve traffic
  res.json({ status: 'ready' });
});
```

#### Metrics Collection
```javascript
// Prometheus metrics
const promClient = require('prom-client');
const register = new promClient.Registry();

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

register.registerMetric(httpRequestDuration);
```

### Infrastructure Monitoring

#### CloudWatch Dashboard
- CPU Utilization
- Memory Usage
- Network Traffic
- Database Connections
- Error Rates
- Response Times

#### Alert Configuration
```yaml
# alert-rules.yaml
groups:
- name: civic-issues
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

### Logging

#### Centralized Logging
```javascript
// Winston configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Log Aggregation
- Use AWS CloudWatch Logs or ELK stack
- Structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG

---

## Security Configuration

### Network Security

#### Security Groups
```bash
# ALB Security Group
aws ec2 create-security-group \
  --group-name civic-issues-alb-sg \
  --description "ALB Security Group" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

#### WAF Configuration
```json
{
  "Name": "civic-issues-waf",
  "Scope": "REGIONAL",
  "DefaultAction": { "Allow": {} },
  "Rules": [
    {
      "Name": "AWSManagedRulesCommonRuleSet",
      "Priority": 1,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "OverrideAction": { "None": {} },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "AWSManagedRulesCommonRuleSet"
      }
    }
  ]
}
```

### Application Security

#### SSL/TLS Configuration
- Use AWS Certificate Manager for SSL certificates
- Enforce HTTPS redirect
- Use TLS 1.2+ only

#### API Security
- Rate limiting per IP and user
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection for web forms

#### Data Security
- Encrypt data at rest (RDS encryption)
- Encrypt data in transit (SSL/TLS)
- Database backups encrypted
- S3 bucket encryption enabled

---

## Backup & Recovery

### Database Backup

#### Automated Backups
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier civic-issues-prod \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

#### Manual Backup
```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier civic-issues-prod \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Application Backup

#### Configuration Backup
- Store Kubernetes manifests in Git
- Use ConfigMaps for non-sensitive config
- Secrets managed via AWS Secrets Manager

#### File Storage Backup
- S3 versioning enabled
- Cross-region replication
- Lifecycle policies for cost optimization

### Disaster Recovery

#### Recovery Time Objective (RTO)
- Database: 1 hour
- Application: 30 minutes
- Full system: 2 hours

#### Recovery Point Objective (RPO)
- Database: 5 minutes
- Application data: Real-time
- File storage: Real-time

#### Recovery Plan
1. Failover to backup region
2. Restore from latest backup
3. Update DNS records
4. Verify system functionality
5. Notify stakeholders

---

## Performance Optimization

### Database Optimization

#### Indexing Strategy
```sql
-- Create indexes for common queries
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_ward_id ON issues(ward_id);
CREATE INDEX idx_issues_engineer_id ON issues(engineer_id);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);

-- Spatial index for geo-fencing
CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary);
```

#### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Implement query result caching
- Use database read replicas for reporting

### Application Optimization

#### Caching Strategy
```javascript
// Redis caching for API responses
const cache = require('redis').createClient();

app.get('/api/issues', async (req, res) => {
  const cacheKey = `issues:${JSON.stringify(req.query)}`;
  
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  const issues = await Issue.findAll(req.query);
  await cache.setex(cacheKey, 300, JSON.stringify(issues)); // 5 min cache
  
  res.json(issues);
});
```

#### CDN Configuration
- Static assets served via CloudFront
- Image optimization and compression
- Global edge locations for low latency

### Scaling Configuration

#### Horizontal Pod Autoscaling
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: civic-issues-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: civic-issues-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks
- Review application logs
- Check disk usage
- Update security patches
- Verify backup integrity

#### Monthly Tasks
- Database performance analysis
- Security vulnerability scan
- Dependency updates
- Cost optimization review

#### Quarterly Tasks
- Disaster recovery testing
- Performance benchmarking
- Architecture review
- Compliance audit

### Update Procedures

#### Application Updates
1. Create feature branch
2. Implement changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main
7. CI/CD pipeline deploys automatically

#### Database Updates
1. Create migration script
2. Test on staging environment
3. Backup production database
4. Run migration during maintenance window
5. Verify data integrity
6. Update application if needed

### Incident Response

#### Incident Response Plan
1. **Detection**: Monitoring alerts trigger
2. **Assessment**: Determine impact and severity
3. **Communication**: Notify stakeholders
4. **Containment**: Isolate affected components
5. **Recovery**: Restore from backup or fix issue
6. **Analysis**: Post-mortem analysis
7. **Prevention**: Implement fixes and improvements

#### Escalation Matrix
- **Level 1**: Application errors - On-call engineer
- **Level 2**: Database issues - DBA team
- **Level 3**: Infrastructure failure - DevOps team
- **Level 4**: System-wide outage - Management

---

## Cost Optimization

### Infrastructure Costs

#### Reserved Instances
```bash
# Purchase RI for consistent workloads
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id <offering-id> \
  --instance-count 3
```

#### Auto Scaling
- Scale down during off-peak hours
- Use spot instances for non-critical workloads
- Implement resource limits

### Storage Optimization

#### S3 Lifecycle Policies
```json
{
  "Rules": [
    {
      "ID": "Delete old images",
      "Status": "Enabled",
      "Prefix": "issues/",
      "Transitions": [
        {
          "Days": 365,
          "StorageClass": "STANDARD_IA"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

#### Database Optimization
- Archive old data to cheaper storage
- Use database compression
- Optimize query performance to reduce compute costs

---

## Compliance & Audit

### Data Protection
- GDPR compliance for user data
- Data retention policies
- Right to erasure implementation
- Data encryption standards

### Security Compliance
- Regular security assessments
- Penetration testing
- Vulnerability scanning
- Access control audits

### Operational Compliance
- SOC 2 compliance
- ISO 27001 certification
- Regular audit logging
- Incident reporting

---

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check pod status
kubectl get pods

# View pod logs
kubectl logs -f deployment/civic-issues-backend

# Check environment variables
kubectl exec -it deployment/civic-issues-backend -- env
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it deployment/civic-issues-backend -- npm run db:test

# Check database logs
aws rds describe-db-log-files --db-instance-identifier civic-issues-prod
```

#### High CPU/Memory Usage
```bash
# Check resource usage
kubectl top pods

# Scale deployment
kubectl scale deployment civic-issues-backend --replicas=5
```

#### Slow API Responses
```bash
# Check Redis connectivity
kubectl exec -it deployment/civic-issues-backend -- redis-cli ping

# Analyze slow queries
# Use database monitoring tools
```

### Emergency Procedures

#### Service Outage
1. Check monitoring dashboards
2. Identify affected components
3. Scale resources if needed
4. Restart failing services
5. Communicate with stakeholders
6. Document incident

#### Data Loss
1. Stop all write operations
2. Assess data loss extent
3. Restore from backup
4. Verify data integrity
5. Resume operations
6. Conduct post-mortem

---

## Support & Documentation

### Internal Documentation
- Runbooks for common procedures
- Troubleshooting guides
- Architecture decision records
- API documentation updates

### External Support
- Cloud provider support plans
- Third-party service SLAs
- Vendor contact information
- Emergency contact lists

### Training
- Onboarding documentation
- System administration training
- Security awareness training
- Regular knowledge sharing sessions

---

## Checklist

### Pre-Deployment
- [ ] Infrastructure provisioned
- [ ] Security groups configured
- [ ] SSL certificates obtained
- [ ] Database initialized
- [ ] Secrets configured
- [ ] CI/CD pipeline set up
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Deployment
- [ ] Code deployed to staging
- [ ] Integration tests passed
- [ ] Performance tests completed
- [ ] Security scan passed
- [ ] Database migration tested
- [ ] Rollback plan documented

### Post-Deployment
- [ ] Application accessible
- [ ] Monitoring alerts working
- [ ] Logs aggregating correctly
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team notified of deployment

### Maintenance
- [ ] Regular backups verified
- [ ] Security patches applied
- [ ] Performance monitored
- [ ] Logs reviewed
- [ ] Incident response tested
- [ ] Cost optimization reviewed