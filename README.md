# AI-Based Civic Issue Monitoring System

**Production-Ready Microservices Architecture for Smart City Management**

Government-grade civic issue monitoring system for Vadodara Municipal Corporation (VMC) with 19 wards. Three-role architecture (Surveyor→Engineer→Admin) with AI classification and autonomous robot surveys.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CIVIC MONITORING SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend   │────▶│   MongoDB    │
│  (Port 3001)│     │  (Port 3000)│     │ (Port 27017) │
└─────────────┘     └─────────────┘     └──────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼────────┐
         │ AI Service  │      │ Robot Service │
         │ (Port 5000) │      │  (Port 5001)  │
         └─────────────┘      └───────────────┘
```

## 📁 Project Structure

```
.
├── ai-service/              # Main AI classification service (FastAPI + YOLOv8)
│   ├── src/
│   │   ├── main.py         # FastAPI app with /classify endpoint
│   │   ├── classifier.py   # Classification logic
│   │   ├── model.py        # YOLOv8/Keras model handler
│   │   ├── cache.py        # Redis caching layer
│   │   └── config.py       # Configuration management
│   ├── models/
│   │   ├── best_model.keras     # Trained classification model
│   │   └── class_indices.json  # Class mappings
│   ├── Dockerfile
│   └── requirements.txt
│
├── backend/                 # Node.js Express REST API
│   ├── src/
│   │   ├── index.js        # Entry point with middleware
│   │   ├── routes/         # API routes (auth, issues, dashboard)
│   │   ├── models/         # Mongoose models
│   │   ├── services/       # Business logic & AI integration
│   │   └── middleware/     # Auth, validation, security
│   ├── uploads/            # User uploaded images
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # React SPA (Redux Toolkit + Tailwind CSS)
│   ├── src/
│   │   ├── pages/          # Page components (Dashboard, ReportIssue, etc.)
│   │   ├── components/     # Reusable components (VMCHeader, VMCFooter)
│   │   ├── store/          # Redux store slices
│   │   ├── services/       # Axios API calls
│   │   └── styles/         # Tailwind configuration
│   ├── Dockerfile
│   └── package.json
│
├── robot-service/           # Autonomous robot surveys (Flask + Roboflow)
│   ├── app.py              # Flask app with 8 specialized AI models
│   ├── templates/          # HTML templates (index, robot, admin)
│   ├── static/             # Static files & uploaded images
│   ├── Dockerfile
│   └── requirements.txt    # Flask, inference-sdk, opencv
│
├── Mobile_Application/      # React Native mobile app
│   ├── src/
│   │   └── screens/        # Mobile screens
│   ├── App.js
│   └── app.json
│
├── database/                # Database initialization scripts
│   ├── mongo-init.js       # MongoDB setup with collections
│   └── init.sql            # Initial data seeding
│
├── docs/                    # Documentation
│   ├── QUICK_DEPLOY.md     # Deployment guide
│   ├── PRODUCTION_VERIFICATION.md
│   ├── FINAL_IMPLEMENTATION_COMPLETE.md
│   └── reference/          # API references
│
├── scripts/                 # Automation scripts
│   ├── seed-atlas.ps1      # Seed test data
│   └── test-deployment.ps1 # Deployment testing
│
├── docker-compose.yml       # Orchestration (5 services)
├── .env.example             # Environment template
├── DEMO_GUIDE.md           # Demo walkthrough
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (v20.10+)
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- 8GB RAM minimum

### 1. Clone & Setup
```bash
git clone <repository-url>
cd AI-civic-issue-monitor

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Set DB_PASSWORD, JWT_SECRET, ROBOFLOW_API_KEY
```

### 2. Run with Docker (Recommended)
```bash
# Start all 5 services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f ai-service
```

### 3. Access Applications
- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000/health
- **AI Service (FastAPI)**: http://localhost:5000/docs
- **Robot Service**: http://localhost:5001
- **MongoDB**: localhost:27017

### 4. Demo Login Credentials
```
Admin:
  Email: admin@vmc.gov.in
  Password: Admin@123

Engineer:
  Email: engineer1@vmc.gov.in
  Password: Engineer@123

Surveyor:
  Email: surveyor1@vmc.gov.in
  Password: Surveyor@123
```

## 🎯 Features

### Core Functionality
- ✅ **AI-Powered Issue Detection**: YOLOv8/Keras classification from images
- ✅ **Autonomous Robot Surveys**: Roboflow API integration with 8 specialized models
  - Potholes, Garbage, Manholes, Damaged Roads
  - Construction Debris, Stray Animals, Water Leakage, Visual Pollution
- ✅ **Geographic Assignment**: MongoDB geo-queries for ward-based routing
- ✅ **Role-Based Access Control**: Surveyor (create), Engineer (resolve), Admin (manage)
- ✅ **Real-Time Tracking**: Complete audit trail with issue logs
- ✅ **Multi-Platform**: Web dashboards + React Native mobile app

### Security Features
- ✅ JWT authentication (24hr expiry) with bcrypt hashing (10 rounds)
- ✅ Rate limiting (Redis-backed)
  - API: 100 requests/15min
  - Login: 5 attempts/15min
  - Upload: 50 requests/hour
- ✅ XSS and SQL injection protection
- ✅ Input validation with Joi schemas
- ✅ Helmet.js security headers
- ✅ File upload validation (10MB max, images only)

### Administration
- ✅ Statistics dashboard with analytics
- ✅ Ward performance metrics
- ✅ Issue heatmap visualization
- ✅ Activity monitoring
- ✅ User management
- ✅ Email notifications (Nodemailer)

### DevOps
- ✅ Docker multi-stage builds
- ✅ Automated health checks
- ✅ Logging with Winston
- ✅ Prometheus metrics (optional)
- ✅ CI/CD ready (.github/workflows)

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure environment
npm run dev           # Starts on port 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Starts on port 3001
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 5000
```

### Robot Service
```bash
cd robot-service
pip install -r requirements.txt
python app.py         # Starts on port 5001
```

## 🐳 Docker Services

### 1. ai-service (Port 5000)
**Purpose**: Main issue classification using trained YOLOv8/Keras model

**Technology**: FastAPI, TensorFlow, YOLOv8

**Key Endpoints**:
- `POST /classify` - Classify issue from multipart image file
- `POST /classify-base64` - Classify from base64 encoded string
- `GET /health` - Health check
- `GET /model-info` - Model metadata & class list

**Environment Variables**:
```env
PORT=5000
MODEL_PATH=models/best_model.keras
CONFIDENCE_THRESHOLD=0.5
MODEL_DEVICE=cpu  # or 'cuda' for GPU
```

**Integration**: Backend calls this at `http://ai-service:5000/classify` after receiving image upload

---

### 2. robot-service (Port 5001)
**Purpose**: Autonomous robot surveys using Roboflow API with 8 specialized models

**Technology**: Flask, OpenCV, Roboflow SDK

**Key Endpoints**:
- `POST /detect` - Multi-model detection on uploaded image
- `POST /robot/submit` - Submit robot survey data
- `GET /health` - Health check
- `GET /api/stats` - Survey statistics
- `GET /` - Web interface

**AI Models** (via Roboflow):
1. Potholes detection
2. Garbage detection
3. Manhole detection
4. Damaged roads
5. Construction debris
6. Stray animals
7. Water leakage
8. Visual pollution

**Environment Variables**:
```env
PORT=5001
ROBOFLOW_API_KEY=your_roboflow_api_key
```

**Database**: SQLite (`robot_survey.db`) - independent from main MongoDB

---

### 3. backend (Port 3000)
**Purpose**: Main API server for CRUD operations, authentication, AI integration

**Technology**: Node.js 18, Express, MongoDB, Mongoose, JWT

**Key Routes**:
- `/api/auth/*` - Login, register, token refresh
- `/api/issues/*` - CRUD operations on issues
- `/api/users/*` - User management
- `/api/dashboard/*` - Statistics & analytics
- `/health` - Health check

**Environment Variables**:
```env
PORT=3000
DB_HOST=mongodb
DB_NAME=civic_issues
AI_SERVICE_URL=http://ai-service:5000
JWT_SECRET=your_32_char_secret
```

**AI Integration**:
```javascript
// backend/src/services/aiService.js
const response = await axios.post(`${AI_SERVICE_URL}/classify`, formData);
const { issue_type, confidence, ai_class } = response.data;
```

---

### 4. frontend (Port 3001)
**Purpose**: React SPA for admin/engineer/surveyor dashboards

**Technology**: React 18, Redux Toolkit, Tailwind CSS, Vite

**Key Features**:
- Admin dashboard with analytics
- Engineer issue management
- Surveyor mobile-first interface
- Leaflet maps integration
- Camera & GPS integration
- Real-time Redux state management

**Environment Variables**:
```env
VITE_API_URL=http://localhost:3000
```

---

### 5. mongodb (Port 27017)
**Purpose**: Primary database for users, issues, wards, departments

**Technology**: MongoDB 7.0

**Collections**:
- `users` - User accounts with roles
- `issues` - Reported civic issues
- `departments` - Department master data
- `wards` - Geographic ward boundaries

**Indexes**:
- `issues`: location (2dsphere), status, ward_id
- `users`: email (unique), role

## 📊 Service Communication Flow

### Issue Reporting Flow
```
Surveyor (Frontend Web/Mobile)
    │
    ├─[1. Upload Image + GPS coordinates]────▶ Backend (Port 3000)
    │                                               │
    │                                               ├─[2. Save image to uploads/]
    │                                               │
    │                                               ├─[3. Forward image to AI]────▶ AI Service (Port 5000)
    │                                               │                                    │
    │                                               │                                    ├─[Load model]
    │                                               │                                    ├─[Preprocess image]
    │                                               │                                    ├─[Run inference]
    │                                               │                                    │
    │                                               │◀──[4. Return classification]───────┘
    │                                               │    {issue_type, confidence, ai_class}
    │                                               │
    │                                               ├─[5. Query MongoDB for ward]
    │                                               ├─[6. Assign to engineer]
    │                                               ├─[7. Save to database]
    │                                               │
    │◀──[8. Return Issue ID + classification]──────┘
```

### Robot Survey Flow
```
Autonomous Robot
    │
    ├─[1. Capture image from camera]────▶ Robot Service (Port 5001)
    │                                          │
    │                                          ├─[2. Call Roboflow API]────▶ Roboflow (8 models)
    │                                          │                                 │
    │                                          │◀──[3. Return detections]────────┘
    │                                          │    {potholes, garbage, manholes...}
    │                                          │
    │                                          ├─[4. Draw bounding boxes (OpenCV)]
    │                                          ├─[5. Save results to SQLite]
    │                                          ├─[6. Store images in static/]
    │                                          │
    │◀──[7. Return detection results]─────────┘
```

## 🔐 Security Architecture

### Authentication Flow
```javascript
// 1. User login
POST /api/auth/login
{
  "email": "surveyor@vmc.gov.in",
  "password": "Surveyor@123"
}

// 2. Backend verifies password (bcrypt)
const isMatch = await bcrypt.compare(password, user.password);

// 3. Generate JWT token (24hr expiry)
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// 4. Frontend stores token in localStorage
localStorage.setItem('token', token);

// 5. Subsequent requests include token
headers: { 'Authorization': `Bearer ${token}` }
```

### Middleware Stack (Order matters!)
```javascript
// backend/src/index.js
app.use(requestId);              // 1. Request tracing
app.use(helmet());               // 2. Security headers
app.use(sanitizeInput);          // 3. Trim/sanitize inputs
app.use(xssProtection);          // 4. XSS detection
app.use(sqlInjectionProtection); // 5. SQL injection blocking
app.use(apiLimiter);             // 6. Rate limiting
```

### Rate Limiting Strategy
```javascript
// API calls: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({ client: redisClient })
});

// Login attempts: 5 per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

// File uploads: 50 per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50
});
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests (Jest)
cd backend
npm test                     # All tests
npm run test:unit            # Unit tests only
npm run test:integration     # Integration tests
npm run test:coverage        # With coverage report

# AI Service tests (pytest)
cd ai-service
pytest tests/ -v

# Frontend tests (Vitest)
cd frontend
npm test
```

### Test Coverage
- Backend: 14/34 tests passing (41%)
- AI Service: Model loading, inference, API endpoints
- Frontend: Component rendering, Redux actions

## 📦 Production Deployment

### Option 1: Docker Compose (Recommended)
```bash
# 1. Pull latest code
git pull origin main

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Build images
docker-compose build

# 4. Start services
docker-compose up -d

# 5. Verify health
curl http://localhost:3000/health
curl http://localhost:5000/health
curl http://localhost:5001/health

# 6. Scale backend if needed
docker-compose up -d --scale backend=3
```

### Option 2: Kubernetes (Advanced)
```bash
# 1. Build and push images
docker build -t your-registry/civic-backend:latest ./backend
docker push your-registry/civic-backend:latest

# 2. Apply manifests
kubectl apply -f k8s/

# 3. Check status
kubectl get pods
kubectl get services

# 4. Access via LoadBalancer
kubectl get svc frontend-service
```

### Option 3: Cloud Platforms
See `docs/QUICK_DEPLOY.md` for platform-specific guides:
- **Render.com**: Managed hosting with auto-deploy
- **Railway.app**: Simple deployment from Git
- **Vercel**: Frontend static hosting
- **Heroku**: Container deployment

## 🔄 Maintenance

### Update Services
```bash
# Pull updates
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check logs for errors
docker-compose logs --tail=100 -f
```

### Monitor Services
```bash
# Check service status
docker-compose ps

# View resource usage
docker stats

# Restart specific service
docker-compose restart backend
```

### Backup Database
```bash
# MongoDB backup
docker exec civic-issues-mongodb mongodump \
  --out=/backup/$(date +%Y%m%d)

# Copy backup to host
docker cp civic-issues-mongodb:/backup ./backups/

# Restore from backup
docker exec civic-issues-mongodb mongorestore /backup/20250130
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-service

# Last 100 lines
docker-compose logs --tail=100 backend

# Follow errors only
docker-compose logs -f | grep ERROR
```

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs for errors
docker-compose logs <service-name>

# Verify ports are not in use
netstat -an | findstr "3000 3001 5000 5001 27017"

# Rebuild container
docker-compose build <service-name>
docker-compose up -d <service-name>
```

### Port Conflicts
```
ERROR: Port 5000 is already in use

Solution:
1. Check what's using the port:
   netstat -ano | findstr :5000
2. Kill the process:
   taskkill /PID <process-id> /F
3. Or change ports in docker-compose.yml
```

### AI Service Issues
```bash
# Check model file exists
ls -lh ai-service/models/best_model.keras

# Test AI endpoint directly
curl -X POST http://localhost:5000/classify \
  -F "file=@test-image.jpg"

# Check FastAPI docs
open http://localhost:5000/docs
```

### Database Connection Issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Connect to MongoDB shell
docker exec -it civic-issues-mongodb mongosh

# Verify collections
show dbs
use civic_issues
show collections
```

### Frontend Not Loading
```bash
# Check if API is accessible
curl http://localhost:3000/health

# Verify environment variable
docker exec civic-issues-frontend env | grep VITE_API_URL

# Check browser console for CORS errors
# Backend should allow origin: http://localhost:3001
```

## 📝 Environment Variables

### Required Variables
```env
# Database
DB_HOST=mongodb
DB_PORT=27017
DB_NAME=civic_issues
DB_USER=admin
DB_PASSWORD=your_secure_password_min_12_chars

# Authentication (CRITICAL: Use strong secret)
JWT_SECRET=your_32_character_secret_key_here

# Service URLs (Docker internal network)
AI_SERVICE_URL=http://ai-service:5000
ROBOT_SERVICE_URL=http://robot-service:5001

# AI Service
MODEL_PATH=models/best_model.keras
CONFIDENCE_THRESHOLD=0.5

# Robot Service API Keys
ROBOFLOW_API_KEY=your_roboflow_api_key_here
```

### Optional Variables
```env
# Redis (for caching & rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@vmc.gov.in
SMTP_PASS=your_app_password

# Monitoring
ENABLE_METRICS=true
PROMETHEUS_PORT=9090
```

## 📚 API Documentation

- **Backend API**: http://localhost:3000/api-docs (Swagger UI)
- **AI Service**: http://localhost:5000/docs (FastAPI auto-docs)
- **Robot Service**: http://localhost:5001/ (Web interface)

### Key API Endpoints

#### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
```

#### Issues
```bash
GET    /api/issues              # List all issues
POST   /api/issues              # Create new issue
GET    /api/issues/:id          # Get issue details
PUT    /api/issues/:id          # Update issue
DELETE /api/issues/:id          # Delete issue
PATCH  /api/issues/:id/resolve  # Mark as resolved
```

#### Dashboard
```bash
GET /api/dashboard/admin/stats       # Admin statistics
GET /api/dashboard/admin/heatmap     # Issue heatmap data
GET /api/dashboard/engineer/:id      # Engineer dashboard
GET /api/dashboard/surveyor/:id      # Surveyor statistics
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

### Coding Standards
- **Backend**: ESLint (Airbnb config) + Prettier
- **Frontend**: ESLint (React) + Prettier
- **Python**: Black formatter + Flake8

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Team

- **Krishan** - Full Stack Developer & AI Integration
- **AI Team** - Model Training & Optimization
- **DevOps** - Infrastructure & Deployment

## 🆘 Support

- 📧 **Email**: support@vmc.gov.in
- 📞 **Phone**: 0265-2426002 (VMC Helpline)
- 🐛 **Issues**: GitHub Issues tab
- 📖 **Docs**: `/docs` folder
- 💬 **Chat**: Slack workspace (for contributors)

## 📈 Roadmap

### Current Release (v1.0)
- ✅ Core issue reporting
- ✅ AI classification
- ✅ Robot surveys
- ✅ Role-based dashboards

### Planned Features (v1.1)
- 🔄 Real-time WebSocket notifications
- 🔄 Advanced analytics with charts
- 🔄 Mobile app push notifications
- 🔄 Multilingual support (Gujarati, Hindi)

### Future Enhancements (v2.0)
- 📋 Citizen portal for public reporting
- 📋 SMS notifications
- 📋 Payment gateway integration
- 📋 Third-party API integrations

---

**Built with ❤️ for Vadodara Municipal Corporation (VMC)**

*Hackathon Project | Smart City Initiative | Digital India*
