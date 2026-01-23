# AI-Based Civic Issue Monitoring System

A comprehensive solution for monitoring and managing civic issues in Vadodara city, featuring AI-powered issue classification, geographic assignment, and role-based dashboards.

## ✅ Current Status

- **Backend Tests**: 14/34 passing (41% - All auth tests passing ✅)
- **Database**: Fully configured with 5 tables
- **Deployment**: Automated scripts ready
- **Documentation**: Complete setup guides

## 📁 Project Structure

```
├── ai-service/          # Python Flask AI classification service
├── backend/             # Node.js Express REST API
├── database/            # PostgreSQL schemas and migrations
├── docs/                # Deployment and technical documentation
├── frontend/            # React + Vite web application
├── Mobile_Application/  # React Native mobile app
├── scripts/             # Deployment and setup automation
├── .github/             # GitHub Actions CI/CD workflows
├── docker-compose.yml   # Docker orchestration
├── QUICKSTART.md        # Quick deployment guide
├── QUICK_DEPLOY.md      # One-command deployment
├── SETUP_INSTRUCTIONS.md # Detailed setup steps
├── TESTING_GUIDE.md     # Testing documentation
└── README.md            # This file
```

## 🌟 Features

### Core Functionality
- **AI-Powered Issue Detection**: Automatic classification of civic issues from images
- **Geographic Assignment**: PostGIS-based ward assignment using geo-fencing
- **Role-Based Access Control**: Surveyor, Engineer, and Admin roles
- **Real-Time Tracking**: Complete audit trail with issue logs
- **Multi-Platform**: Web dashboards and mobile app

### Security Features
- JWT authentication with bcrypt password hashing
- Rate limiting (API, login, file upload)
- XSS and SQL injection protection
- Input validation and sanitization
- Security headers with Helmet
- Request ID tracing

### Administration
- Statistics dashboard with analytics
- Ward performance metrics
- Issue heatmap visualization
- Activity monitoring
- User management
- Email notifications

### DevOps
- Docker containerization
- Automated backup/restore
- Deployment automation
- Health monitoring
- API documentation (Swagger)
- Logging with Winston

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **PostgreSQL**: 12.x or higher with PostGIS extension
- **Redis**: 7.x or higher
- **Docker**: 20.10+ and Docker Compose 2.0+ (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System

# Configure environment
cp .env.production.example .env.production
# Edit .env.production with your settings

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# AI Service: http://localhost:5000
# API Docs: http://localhost:3000/api-docs
```

### Option 2: Manual Installation

```bash
# Run automated setup
# Linux/macOS:
chmod +x scripts/setup.sh
./scripts/setup.sh

# Windows:
PowerShell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Start services individually
cd backend && npm start
cd ai-service && source venv/bin/activate && gunicorn app:app
cd frontend && npm run dev
```

## 📁 Project Structure

```
AI-Based-Civic-Issue-Monitoring-System/
├── database/
│   ├── schema.sql              # Database schema with PostGIS
│   └── seed_data.sql           # Sample data
├── backend/
│   ├── src/
│   │   ├── server.js           # Express application
│   │   ├── config/
│   │   │   ├── database.js     # PostgreSQL connection
│   │   │   └── swagger.json    # API documentation
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── rateLimiter.js  # Rate limiting
│   │   │   ├── security.js     # Security protections
│   │   │   ├── validation.js   # Input validation
│   │   │   └── errorHandler.js # Error handling
│   │   ├── routes/
│   │   │   ├── auth.js         # Authentication routes
│   │   │   ├── issues.js       # Issue management
│   │   │   ├── wards.js        # Ward information
│   │   │   ├── dashboard.js    # Analytics endpoints
│   │   │   └── users.js        # User management
│   │   └── utils/
│   │       ├── logger.js       # Winston logger
│   │       └── emailService.js # Email notifications
│   ├── tests/
│   │   ├── unit/              # Unit tests
│   │   └── integration/       # Integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React app
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── EngineerDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── components/
│   ├── nginx.conf             # Production Nginx config
│   └── package.json
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── CaptureIssueScreen.js
│   │   │   └── IssueHistoryScreen.js
│   │   └── context/
│   │       └── AuthContext.js
│   ├── App.js
│   └── package.json
├── ai-service/
│   ├── app.py                 # Flask AI service
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/
│   ├── setup.sh              # Linux/Mac setup
│   ├── setup.ps1             # Windows setup
│   ├── backup.sh             # Database backup
│   ├── restore.sh            # Database restore
│   └── deploy.sh             # Deployment automation
├── docs/
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── architecture.md       # System architecture
│   ├── database_schema.md    # Database documentation
│   └── api_list.md          # API reference
├── docker-compose.yml        # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- PostgreSQL (12+) with PostGIS extension
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System
```

2. Setup Database
```bash
cd database
psql -U postgres -f schema.sql
psql -U postgres -f seed_data.sql
```

3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. Setup AI Service
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

5. Setup Frontend
```bash
cd frontend
npm install
npm start
```

6. Setup Mobile App
```bash
cd mobile-app
npm install
npx react-native run-android  # or run-ios
```

## API Documentation
See [plans/api_list.md](plans/api_list.md) for complete API documentation.

## Architecture
See [plans/architecture.md](plans/architecture.md) for system architecture details.

## Database Schema
See [plans/database_schema.md](plans/database_schema.md) for database design.

## License
MIT
