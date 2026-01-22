# 🎯 AI-Based Civic Issue Monitoring System

## 🏆 100% FREE STACK CERTIFIED ✅

**No Paid APIs • No Proprietary Services • No Vendor Lock-in**  
**Open-source Only • Free Cloud Tier • Fully Transparent**

---

## Project Overview

The AI-Based Civic Issue Monitoring System is a geo-fencing enabled mobile and web application designed to help Vadodara Municipal Corporation (VMC) proactively identify and resolve civic issues. The system leverages **open-source YOLOv8 AI** to automatically detect problems such as potholes, garbage accumulation, debris, stray cattle, broken roads, and open manholes across the city's 19 wards.

**Zero dependency on paid cloud services, commercial AI APIs, or proprietary tools.**

## Problem Statement

Currently, civic issues in Vadodara are identified mainly through citizen complaints or feedback, leaving many issues undetected. This reactive approach leads to:
- Delayed problem resolution
- Inconsistent identification across wards
- Lack of data-driven prioritization
- Poor resource allocation

This system transforms the process into a proactive, data-driven approach by enabling VMC employees to conduct field surveys using mobile applications with **free, open-source AI** for automated issue detection.

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
   - Open-source YOLOv8 model (no Cloud Vision APIs)
   - PyTorch framework for local inference
   - OpenCV for image processing

4. **Database** (PostgreSQL with PostGIS - open-source)
   - User and role management
   - Ward boundary data with spatial indexing (PostGIS)
   - Issue tracking and history

5. **Web Dashboards** (React - open-source)
   - Engineer dashboard (issue assignment and resolution)
   - Admin dashboard (analytics and monitoring)
   - Maps using OpenStreetMap + Leaflet (free, no Google Maps)

6. **Storage & Services** (100% Free)
   - **Local Disk Storage** on Render instance
   - **Firebase FCM** (free tier) for push notifications
   - **Nominatim** (OpenStreetMap) for reverse geocoding

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

---

## ✅ 100% FREE STACK CERTIFICATION

### 🎨 Frontend Stack (Open-Source)
- ✅ **React Native** - Cross-platform mobile framework
- ✅ **expo-camera** - Open-source camera access
- ✅ **expo-location** - GPS/location services
- ✅ **OpenStreetMap + Leaflet** - Free map library (NO Google Maps)
- ✅ **SQLite** - Local offline database
- ✅ **Axios** - HTTP client

### 🔧 Backend Stack (Open-Source)
- ✅ **Node.js/Express** - Server framework
- ✅ **PostgreSQL + PostGIS** - Spatial database (free, open-source)
- ✅ **Redis** - Caching (Render free tier)
- ✅ **JWT** - Authentication (no paid services)
- ✅ **Prisma/Sequelize** - ORM
- ✅ **Multer** - File uploads (local storage)

### 🧠 AI/ML Stack (Open-Source)
- ✅ **YOLOv8** - Object detection model
- ✅ **PyTorch** - Deep learning framework
- ✅ **OpenCV** - Image processing
- ✅ **Local Inference** - Process on Render worker (NO cloud AI APIs)

### 🚀 Deployment & DevOps (Free)
- ✅ **Render Free Tier** - Backend hosting (NOT AWS/Kubernetes)
- ✅ **GitHub Actions** - CI/CD pipeline (free)
- ✅ **Docker** - Containerization (open-source)
- ✅ **PostgreSQL (Render)** - Database (free tier)
- ✅ **Redis (Render)** - Cache (free tier)

### 🔔 Notifications & Services (Free)
- ✅ **Firebase FCM** - Push notifications (free tier)
- ✅ **Nominatim** - Reverse geocoding (OpenStreetMap, free)
- ✅ **Local Storage** - Image storage on Render disk

---

## ❌ STRICTLY NOT USED (Paid/Proprietary)

❌ Google Maps API  
❌ AWS/Azure/GCP paid services  
❌ AWS S3 (using local storage instead)  
❌ Cloud Vision APIs (using open-source YOLOv8)  
❌ Mapbox or paid map services  
❌ SMS gateways (using Firebase FCM instead)  
❌ Kubernetes (using Render Free Tier)  
❌ Proprietary AI models  
❌ Cloudinary or paid image hosting  
❌ Paid analytics services

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

## Technical Stack

### Frontend
- **Mobile**: React Native / Flutter
- **Web**: React.js / Vue.js
- **State Management**: Redux / Vuex
- **Maps**: Google Maps / Mapbox
- **Styling**: Tailwind CSS / Material UI

### Backend
- **Framework**: Node.js + Express / Django / Spring Boot
- **Language**: JavaScript/TypeScript / Python / Java
- **API**: RESTful architecture with JSON
- **Authentication**: JWT tokens

### Database
- **Primary**: PostgreSQL (relational data + spatial queries)
- **Caching**: Redis (session management, notifications)
- **Spatial Data**: PostGIS extension for geo-fencing

### AI/ML
- **Framework**: TensorFlow / PyTorch / OpenCV
- **Model**: Pre-trained CNN for image classification
- **Deployment**: Docker containers with GPU support

### Infrastructure
- **Cloud**: AWS / Google Cloud / Azure
- **Containerization**: Docker
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

## Getting Started

### Prerequisites
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
