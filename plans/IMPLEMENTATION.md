# Implementation Guide

## Technology Stack

### Frontend

#### Mobile Application
- **Framework**: React Native (for cross-platform iOS/Android)
  - Alternative: Flutter (if Dart preferred)
- **State Management**: Redux or Context API
- **Navigation**: React Navigation
- **Maps**: react-native-maps / Google Maps SDK
- **Camera**: react-native-camera / expo-camera
- **Geolocation**: react-native-geolocation / expo-location
- **Offline Storage**: SQLite (react-native-sqlite-storage) / WatermelonDB
- **HTTP Client**: Axios / Fetch API
- **Image Processing**: react-native-image-resizer
- **Testing**: Jest, React Native Testing Library

#### Web Dashboards
- **Framework**: React.js or Vue.js 3
- **UI Library**: Material-UI / Ant Design / Tailwind CSS
- **Charts**: Chart.js / Recharts / D3.js
- **Maps**: Mapbox GL / Google Maps
- **State Management**: Redux / Vuex / Pinia
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library / Vitest

### Backend

- **Runtime**: Node.js 16+ (Express.js)
  - Alternative: Python 3.8+ (Django/FastAPI) or Java 11+ (Spring Boot)
- **Framework**: Express.js
- **Database ORM**: Sequelize / TypeORM / Prisma
- **Validation**: Joi / Yup
- **Authentication**: jsonwebtoken (JWT) / Passport.js
- **File Upload**: Multer / express-fileupload
- **Logging**: Winston / Morgan
- **Task Queue**: Bull (Redis-based) for async operations
- **Testing**: Jest, Supertest
- **API Documentation**: Swagger/OpenAPI

### Database

- **Primary Database**: PostgreSQL 12+
  - **Spatial Extension**: PostGIS (for geo-fencing)
  - **Connection Pooling**: pg-pool / HikariCP
- **Caching**: Redis 6+ (for sessions, notifications, rate limiting)
- **Search** (optional): Elasticsearch (for issue logs)

### AI/ML Service

- **Framework**: TensorFlow 2.x or PyTorch 1.9+
- **Model**: MobileNet / ResNet50 pre-trained CNN
- **Model Format**: ONNX (for cross-platform deployment)
- **Server**: FastAPI / Flask (Python)
- **Containerization**: Docker
- **GPU Support**: CUDA 11+ (if using GPU)

### Infrastructure & DevOps

- **Containerization**: Docker
- **Orchestration**: Kubernetes (K8s)
- **Container Registry**: Docker Hub / AWS ECR / Google Container Registry
- **Cloud Platform**: AWS / Google Cloud Platform / Azure
- **Infrastructure as Code**: Terraform / CloudFormation
- **CI/CD**: GitHub Actions / GitLab CI / Jenkins
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) / CloudWatch / Stackdriver
- **Monitoring**: Prometheus / Grafana / Datadog
- **Storage**: AWS S3 / Google Cloud Storage / Azure Blob Storage

---

## Project Structure

```
AI-Based-Civic-Issue-Monitoring-System/
│
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Auth, validation, logging
│   │   ├── utils/                # Helper functions
│   │   ├── config/               # Configuration files
│   │   └── app.js                # Express app setup
│   ├── tests/                    # Unit & integration tests
│   ├── migrations/               # Database migrations
│   ├── seeds/                    # Seed data
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── mobile/
│   ├── src/
│   │   ├── screens/              # Screen components
│   │   ├── components/           # Reusable components
│   │   ├── services/             # API calls, storage
│   │   ├── redux/                # State management
│   │   ├── utils/                # Helper functions
│   │   ├── config/               # Constants, config
│   │   └── App.js
│   ├── assets/                   # Images, fonts
│   ├── tests/                    # Unit tests
│   ├── package.json
│   ├── app.json
│   └── .env.example
│
├── web/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── services/             # API calls
│   │   ├── redux/                # State management
│   │   ├── utils/                # Helper functions
│   │   └── App.js
│   ├── public/                   # Static assets
│   ├── tests/                    # Unit tests
│   ├── package.json
│   └── .env.example
│
├── ai-service/
│   ├── models/
│   │   ├── issue_classifier.pt   # PyTorch model
│   │   └── class_mapping.json    # Issue type mapping
│   ├── src/
│   │   ├── main.py               # FastAPI app
│   │   ├── inference.py          # Model inference
│   │   ├── utils.py              # Helper functions
│   │   └── config.py             # Config
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   ├── 002_add_indexes.sql
│   │   └── ...
│   ├── seeds/
│   │   ├── wards.sql
│   │   ├── departments.sql
│   │   └── users.sql
│   └── schema.sql                # Complete schema
│
├── plans/
│   ├── README.md                 # Main documentation
│   ├── REQUIREMENTS.md           # Functional & non-functional requirements
│   ├── IMPLEMENTATION.md         # This file
│   ├── USER_WORKFLOWS.md         # User roles & workflows
│   ├── API_DOCUMENTATION.md      # Detailed API docs
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── api_list.md               # API endpoints overview
│   ├── architecture.md           # System architecture
│   └── database_schema.md        # Database schema details
│
├── docker-compose.yml            # Local development stack
├── Dockerfile.backend
├── Dockerfile.mobile
├── Dockerfile.web
├── .github/
│   └── workflows/
│       ├── backend-ci.yml        # Backend CI/CD
│       ├── mobile-ci.yml         # Mobile CI/CD
│       └── web-ci.yml            # Web CI/CD
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Setup & Installation

### Prerequisites

```bash
# Check versions
node --version      # v16.0.0+
npm --version       # v7.0.0+
python --version    # 3.8+
postgres --version  # 12+
docker --version    # 20.10+
git --version       # 2.30+
```

### 1. Database Setup (PostgreSQL + PostGIS)

```bash
# Create database
createdb civic_issues

# Connect to database
psql civic_issues

# Enable PostGIS extension
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Apply schema
psql civic_issues < database/schema.sql

# Load seed data
psql civic_issues < database/seeds/wards.sql
psql civic_issues < database/seeds/departments.sql
```

### 2. Backend Setup (Node.js + Express)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with:
# - DATABASE_URL=postgresql://user:password@localhost:5432/civic_issues
# - JWT_SECRET=your_secret_key
# - AI_SERVICE_URL=http://localhost:8001
# - AWS_S3_BUCKET=your-bucket-name
# - AWS_ACCESS_KEY_ID=your_key
# - AWS_SECRET_ACCESS_KEY=your_secret

# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Start server
npm run dev         # Development (http://localhost:3000)
npm start          # Production
```

### 3. AI Service Setup (Python + FastAPI)

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download pre-trained model
python scripts/download_model.py

# Create .env file
cp .env.example .env

# Update .env with model paths and configuration

# Start service
python src/main.py         # Development (http://localhost:8001)
gunicorn -w 4 src.main:app # Production
```

### 4. Mobile App Setup (React Native)

```bash
cd mobile

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with:
# - API_URL=http://localhost:3000/api
# - MAPS_API_KEY=your_google_maps_key
# - DEBUG=true

# Start development server (iOS)
npm run ios
# OR (Android)
npm run android

# For production build (iOS)
npm run build:ios

# For production build (Android)
npm run build:android
```

### 5. Web Dashboard Setup (React)

```bash
cd web

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with:
# - REACT_APP_API_URL=http://localhost:3000/api
# - REACT_APP_MAPS_API_KEY=your_google_maps_key

# Start development server
npm run start       # http://localhost:3001

# Build for production
npm run build
```

### 6. Docker Compose (Optional - Complete Stack)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access services:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000
# - Swagger Docs: http://localhost:3000/api-docs
# - pgAdmin: http://localhost:5050 (postgres admin panel)
# - Redis: localhost:6379
```

---

## Development Workflow

### Backend Development

```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Create migration
npm run migrate:create -- --name add_new_table

# Start with hot reload
npm run dev
```

### Mobile Development

```bash
cd mobile

# Run tests
npm test

# Lint code
npm run lint

# Start metro bundler
npm start

# Launch on Android emulator
npm run android

# Launch on iOS simulator
npm run ios
```

### Web Development

```bash
cd web

# Run tests
npm test

# Lint code
npm run lint

# Start dev server with hot reload
npm run start

# Build for production
npm run build
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/civic_issues
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h
AI_SERVICE_URL=http://localhost:8001
AWS_S3_BUCKET=civic-issues-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
LOG_LEVEL=debug
```

### Mobile (.env)
```
API_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_key
DEBUG=true
OFFLINE_SYNC_INTERVAL=300000
IMAGE_COMPRESS_QUALITY=0.7
MAX_IMAGE_SIZE=10485760
```

### Web (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
REACT_APP_DEBUG=true
REACT_APP_CHARTS_LIBRARY=recharts
```

### AI Service (.env)
```
MODEL_PATH=./models/issue_classifier.pt
CLASS_MAPPING_PATH=./models/class_mapping.json
CONFIDENCE_THRESHOLD=0.7
DEVICE=cpu
PORT=8001
DEBUG=true
```

---

## Testing Strategy

### Unit Tests
- Test individual functions/components in isolation
- Coverage target: ≥ 80%
- Tools: Jest, React Testing Library

### Integration Tests
- Test API endpoints with database
- Test service interactions
- Tools: Supertest, pytest

### End-to-End Tests
- Test complete workflows
- Tools: Cypress, Playwright, Detox (mobile)

### Performance Tests
- Load testing with 100+ concurrent users
- Tools: Apache JMeter, k6

### Security Tests
- Penetration testing
- OWASP Top 10 validation
- Tools: OWASP ZAP, Burp Suite

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] SSL certificates configured
- [ ] CORS headers configured properly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy configured
- [ ] CI/CD pipeline tested
- [ ] Load balancer configured
- [ ] CDN configured (if needed)
- [ ] Security headers added
- [ ] API documentation published
- [ ] Incident response plan documented

---

## Common Commands

```bash
# Database
psql civic_issues                    # Connect to database
\dt                                   # List tables
\d issues                             # Describe table

# Backend
npm run dev                           # Start development server
npm test                              # Run tests
npm run lint                          # Lint code
npm run migrate                       # Run migrations

# Mobile
npm run android                       # Run on Android
npm run ios                           # Run on iOS
npm run test                          # Run tests

# Web
npm start                             # Start dev server
npm run build                         # Build for production
npm test                              # Run tests

# Docker
docker-compose up -d                 # Start all services
docker-compose logs -f               # View logs
docker-compose exec backend npm test # Run tests in container
```

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep civic_issues

# Verify PostGIS is installed
psql civic_issues -c "SELECT postgis_version()"
```

### Backend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port is in use
lsof -i :3000

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

### Mobile Issues
```bash
# Clear build artifacts
npm run android-clean

# Reset metro cache
npm start -- --reset-cache

# Rebuild native modules
cd ios && pod install && cd ..
```

---

## Performance Optimization

### Backend
- Use database indexing
- Implement caching with Redis
- Use connection pooling
- Compress responses with gzip
- Implement pagination for large datasets

### Mobile
- Compress images before upload
- Implement offline queue system
- Use SQLite for local storage
- Lazy load screens
- Optimize bundle size

### Web
- Code splitting and lazy loading
- Implement virtual scrolling for large lists
- Cache API responses
- Use CDN for static assets
- Minimize CSS/JS bundles

---

## Security Best Practices

- Never commit .env files
- Use environment variables for secrets
- Keep dependencies updated
- Implement rate limiting
- Use HTTPS everywhere
- Validate and sanitize all inputs
- Implement CSRF protection
- Use secure cookies
- Regular security audits
- Follow OWASP guidelines

---

## References

- [Express.js Documentation](https://expressjs.com/)
- [React Native Docs](https://reactnative.dev/)
- [PostgreSQL PostGIS Docs](https://postgis.net/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Docs](https://kubernetes.io/)
- [OWASP Top 10](https://owasp.org/Top10/)
