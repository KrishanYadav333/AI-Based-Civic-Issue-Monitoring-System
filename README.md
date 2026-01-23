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
=======
﻿# AI-Based Civic Issue Monitoring System

## Project Overview

The AI-Based Civic Issue Monitoring System is a geo-fencing enabled mobile and web application designed to help Vadodara Municipal Corporation (VMC) proactively identify and resolve civic issues. The system leverages AI-powered image recognition to automatically detect problems such as potholes, garbage accumulation, debris, stray cattle, broken roads, and open manholes across the city's 19 wards.

## Problem Statement

Currently, civic issues in Vadodara are identified mainly through citizen complaints or feedback, leaving many issues undetected. This reactive approach leads to:
- Delayed problem resolution
- Inconsistent identification across wards
- Lack of data-driven prioritization
- Poor resource allocation

This system transforms the process into a proactive, data-driven approach by enabling VMC employees to conduct field surveys using mobile applications with automated issue detection.

## Key Features

### For Field Surveyors
- Geo-fencing enabled mobile application
- One-click image capture with automatic GPS tagging
- Automatic issue type detection using AI/ML
- Real-time issue submission
- Offline mode support with sync capability

### For Ward Engineers
- Dashboard to view assigned issues
- Issue filtering by priority, type, status, location
- Resolution image upload capability
- Issue close/completion workflow
- Performance metrics and assignment history

### For System Administrators
- System-wide analytics and statistics
- Ward-wise issue heatmaps
- User management (CRUD operations)
- Issue priority distribution analysis
- Department-wise resolution tracking
- System health monitoring

## System Architecture

### Components
1. **Mobile Application** (React Native/Flutter)
   - Geo-location capture
   - Image capture and compression
   - Issue reporting interface
   - Offline support with SQLite

2. **Backend API Server** (Node.js/Python/Java)
   - RESTful API endpoints
   - JWT authentication
   - Geo-fencing logic (using PostGIS)
   - Workflow orchestration
   - Image storage management

3. **AI/ML Service**
   - Computer vision model for issue classification
   - Confidence scoring
   - Multi-class image classification

4. **Database** (PostgreSQL with PostGIS)
   - User and role management
   - Ward boundary data with spatial indexing
   - Issue tracking and history
   - Department mapping

5. **Web Dashboards** (React/Vue)
   - Engineer dashboard (issue assignment and resolution)
   - Admin dashboard (analytics and monitoring)

6. **Third-party Services**
   - Cloud storage (AWS S3/Google Cloud Storage) for images
   - SMS/Email notifications
   - Maps API for ward boundaries

## Vadodara City Structure

- **City Division**: 19 wards
- **Teams Available**: Water Supply, Roads, Garbage, Cattle Control, Drainage
- **Geographical Data**: Ward-wise boundaries (GeoJSON polygons)

## User Roles

| Role | Responsibilities | Access |
|------|------------------|--------|
| **Field Surveyor** | Capture issues via mobile app, submit issue reports with images and GPS | Mobile app, limited to assigned ward |
| **Ward Engineer** | Review assigned issues, verify problems, upload resolution images, close issues | Engineer dashboard, assigned ward issues |
| **Admin** | System monitoring, user management, analytics, configure system parameters | Admin dashboard, system-wide access |

## Issue Types

The system detects and tracks the following civic issues:
- **Potholes** - Road damage
- **Garbage Accumulation** - Trash and waste collection problems
- **Debris** - Scattered waste and rubble
- **Stray Cattle** - Abandoned or roaming livestock
- **Broken Roads** - Damaged road surfaces
- **Open Manholes** - Uncovered utility access points

## Priority Levels

Issues are assigned priority based on:
- **High**: Safety hazards, major infrastructure damage, health risks
- **Medium**: Maintenance issues, moderate inconvenience
- **Low**: Minor issues, cosmetic problems

## Data Flow Diagram

```
Field Surveyor Mobile App
    ↓
    ├─→ Capture Image + GPS Location
    ├─→ Submit to Backend API
    ↓
Backend API Server
    ├─→ Geo-fencing (Identify Ward)
    ├─→ Send Image to AI Service
    ├─→ Receive Classification + Confidence Score
    ├─→ Assign to Department based on Issue Type
    ├─→ Calculate Priority
    ├─→ Store in Database
    ↓
Database (PostgreSQL + PostGIS)
    ├─→ Store Issue with all metadata
    ├─→ Trigger notification to assigned engineer
    ↓
Ward Engineer Dashboard
    ├─→ View assigned issues (notifications)
    ├─→ Review issue details and images
    ├─→ Plan resolution
    ├─→ Upload resolution images
    ├─→ Close issue
    ↓
Admin Dashboard
    ├─→ View system-wide statistics
    ├─→ Monitor resolution rates
    ├─→ View heatmaps
    └─→ Analyze trends by ward and department
```

## 100% FREE STACK CERTIFICATION

### Frontend Stack (Open-Source)
- **React Native** - Cross-platform mobile framework
- **expo-camera** - Open-source camera access
- **expo-location** - GPS/location services
- **OpenStreetMap + Leaflet** - Free map library (NO Google Maps)
- **SQLite** - Local offline database
- **Axios** - HTTP client

### Backend Stack (Open-Source)
- **Node.js/Express** - Server framework
- **PostgreSQL + PostGIS** - Spatial database (free, open-source)
- **Redis** - Caching (Render free tier)
- **JWT** - Authentication (no paid services)
- **Prisma/Sequelize** - ORM
- **Multer** - File uploads (local storage)

### AI/ML Stack (Open-Source)
- **YOLOv8** - Object detection model
- **PyTorch** - Deep learning framework
- **OpenCV** - Image processing
- **Local Inference** - Process on Render worker (NO cloud AI APIs)

### Deployment & DevOps (Free)
- **Render Free Tier** - Backend hosting (NOT AWS/Kubernetes)
- **GitHub Actions** - CI/CD pipeline (free)
- **Docker** - Containerization (open-source)
- **PostgreSQL (Render)** - Database (free tier)
- **Redis (Render)** - Cache (free tier)

### Notifications & Services (Free)
- **Firebase FCM** - Push notifications (free tier)
- **Nominatim** - Reverse geocoding (OpenStreetMap, free)
- **Local Storage** - Image storage on Render disk
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions / Jenkins
- **Storage**: S3 / Cloud Storage for images

## Security Considerations

1. **Authentication**: JWT-based, password hashing with bcrypt
2. **Authorization**: Role-based access control (RBAC)
3. **Data Encryption**: HTTPS/TLS for transit, encrypted storage for sensitive data
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **Input Validation**: Server-side validation of all inputs
6. **Image Security**: Virus scanning, size limits, format validation
7. **Database Security**: SQL injection prevention, parameterized queries
8. **Audit Logging**: Track all user actions for accountability

## Performance Requirements

- **API Response Time**: < 500ms for standard queries
- **Image Processing**: < 5 seconds for AI classification
- **Database Queries**: < 100ms (optimized with indexes)
- **Mobile App**: Support offline mode with sync on connectivity
- **Scalability**: Support concurrent access by 100+ VMC employees

## Quality Assurance

- **Unit Testing**: 80%+ code coverage
- **Integration Testing**: All API endpoints tested
- **End-to-End Testing**: Complete workflow testing
- **Performance Testing**: Load testing with simulated concurrent users
- **Security Testing**: Penetration testing, vulnerability scanning
>>>>>>> 2c703ce9cb9a6c22868337d1f274a3243a9c3813

## Getting Started

### Prerequisites
<<<<<<< HEAD
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
=======
- Node.js 16+ / Python 3.8+ / Java 11+
- PostgreSQL 12+
- Git
- Docker & Docker Compose (optional, for containerized setup)

### Installation Steps
1. Clone repository
2. Set up environment variables
3. Install dependencies
4. Configure database
5. Initialize database schema
6. Start backend server
7. Build and run mobile/web apps

See [IMPLEMENTATION.md](./plans/IMPLEMENTATION.md) for detailed setup instructions.

## Project Structure

```
AI-Based-Civic-Issue-Monitoring-System/
├── backend/                 # Backend API server
│   ├── src/
│   ├── tests/
│   └── config/
├── mobile/                  # Mobile application (React Native/Flutter)
│   ├── src/
│   ├── assets/
│   └── tests/
├── web/                     # Web dashboards
│   ├── src/
│   ├── public/
│   └── tests/
├── ai-service/              # AI/ML service for image classification
│   ├── models/
│   ├── src/
│   └── tests/
├── database/                # Database schemas and migrations
│   ├── migrations/
│   └── seeds/
├── plans/                   # Project documentation
│   ├── README.md (this file)
│   ├── REQUIREMENTS.md
│   ├── IMPLEMENTATION.md
│   ├── USER_WORKFLOWS.md
│   ├── api_list.md
│   ├── architecture.md
│   └── database_schema.md
├── docker-compose.yml       # Container orchestration
└── .env.example             # Environment variables template
```

## Contributing

1. Create feature branch from `main`
2. Make changes with meaningful commits
3. Push to origin
4. Create pull request with description
5. Code review and merge after approval

## Deployment

See [DEPLOYMENT.md](./plans/DEPLOYMENT.md) for production deployment instructions.

## Contact & Support

For project-related queries or issues, contact the development team.

## License

[Specify appropriate license]

## Changelog

### Version 1.0 (Initial Release)
- Mobile application for field surveyors
- Backend API server with geo-fencing
- AI-based issue classification
- Engineer and Admin dashboards
- Database schema with PostGIS integration
