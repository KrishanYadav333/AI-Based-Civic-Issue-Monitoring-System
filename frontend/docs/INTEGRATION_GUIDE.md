# 🔗 System Integration Guide
## Connecting Mobile App + Web Dashboard + Backend API

This guide explains how to connect all three parts of the Civic Issue Monitoring System.

---

## 📋 System Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Mobile App     │         │   Backend API    │         │  AI Service     │
│  (React Native) │────────▶│  (Node.js)       │────────▶│  (FastAPI)      │
│  by Krishan     │  HTTP   │  by Anuj         │  HTTP   │  YOLOv8         │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │   + PostGIS      │
                            └──────────────────┘
         
┌─────────────────┐
│  Web Dashboard  │────────▶  Same Backend API
│  (React.js)     │   HTTP     (Port 3001)
│  by Aditi       │
└─────────────────┘
```

---

## 🚀 Current Status

### ✅ What Exists:
- **Web Dashboard** (React.js) - Running on localhost:5173
- **Mobile App** (React Native) - Built by Krishan
- **Mock Data** - Web dashboard using mockData.js

### ⚠️ What Needs to be Built:
- **Backend API** (Node.js/Express) - By Anuj
- **AI Service** (FastAPI/YOLOv8) - By Krishan  
- **PostgreSQL Database** - Setup
- **API Integration** - Connect all parts

---

## 📦 Backend API Requirements (Anuj's Task)

### 1. Setup Backend Server

```bash
# Create backend folder
mkdir backend
cd backend
npm init -y

# Install dependencies (100% FREE STACK)
npm install express cors dotenv jsonwebtoken bcryptjs
npm install pg sequelize  # PostgreSQL ORM
npm install multer sharp  # Image handling (local storage)
npm install joi  # Validation
npm install winston  # Logging
```

### 2. Required API Endpoints

#### **Authentication**
```javascript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

#### **Issues**
```javascript
GET    /api/issues              // List issues with filters
GET    /api/issues/:id          // Get single issue
POST   /api/issues              // Create new issue (from mobile)
PUT    /api/issues/:id          // Update issue
DELETE /api/issues/:id          // Delete issue
POST   /api/issues/:id/accept   // Engineer accepts issue
POST   /api/issues/:id/resolve  // Mark as resolved
POST   /api/issues/:id/comments // Add comment
POST   /api/issues/:id/upload   // Upload resolution image
```

#### **Users**
```javascript
GET    /api/users               // List all users
GET    /api/users/:id           // Get user details
POST   /api/users               // Create user
PUT    /api/users/:id           // Update user
DELETE /api/users/:id           // Delete user
```

#### **Wards**
```javascript
GET    /api/wards               // List all wards
GET    /api/wards/:id           // Get ward details
POST   /api/wards/locate        // Find ward by coordinates (PostGIS)
```

#### **Analytics**
```javascript
GET    /api/analytics/dashboard      // Admin dashboard stats
GET    /api/analytics/engineer/:id   // Engineer performance
GET    /api/analytics/ward/:id       // Ward statistics
```

### 3. Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- 'admin', 'engineer', 'surveyor'
  ward_assigned INTEGER[],
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wards table (with PostGIS)
CREATE EXTENSION postgis;

CREATE TABLE wards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  boundary GEOMETRY(POLYGON, 4326),
  population INTEGER,
  area_sqkm DECIMAL
);

-- Issues table
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  priority VARCHAR(20),
  status VARCHAR(50) DEFAULT 'Pending',
  ward_id INTEGER REFERENCES wards(id),
  location GEOMETRY(POINT, 4326),
  created_by INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  ai_classification VARCHAR(50),
  ai_confidence DECIMAL(5,2)
);

-- Images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id),
  image_url VARCHAR(500),
  image_type VARCHAR(20), -- 'issue' or 'resolution'
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id),
  user_id INTEGER REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🌐 Environment Configuration

### Backend (.env file)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# CORS (Allow frontend and mobile app)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:19006
```

### Web Dashboard (.env file)
```bash
# Create: frontend/.env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Civic Issue Monitoring
```

### Mobile App (.env file - React Native)
```bash
# Create in mobile app root
API_URL=http://localhost:3001/api
# For Android emulator use: http://10.0.2.2:3001/api
# For iOS simulator use: http://localhost:3001/api
# For physical device use: http://192.168.x.x:3001/api (your computer's IP)
```

---

## 📱 Mobile App API Integration (Krishan's React Native)

### 1. Install Dependencies in Mobile App
```bash
npm install axios @react-native-async-storage/async-storage
```

### 2. Create API Service (mobile app)

Create: `mobile-app/src/services/api.js`
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

export const issueAPI = {
  // Submit new issue from mobile
  createIssue: async (issueData) => {
    const formData = new FormData();
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('type', issueData.type);
    formData.append('latitude', issueData.latitude);
    formData.append('longitude', issueData.longitude);
    
    if (issueData.image) {
      formData.append('image', {
        uri: issueData.image.uri,
        type: 'image/jpeg',
        name: 'issue-photo.jpg',
      });
    }
    
    return api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getMyIssues: () => 
    api.get('/issues/my-issues'),
  
  getIssueById: (id) => 
    api.get(`/issues/${id}`),
};

export default api;
```

---

## 🎨 Web Dashboard API Integration

The web dashboard API service has been updated. Here's what changed:

### Before (Mock Data):
```javascript
// Using setTimeout and mock responses
const response = await new Promise(resolve => {
  setTimeout(() => resolve({ data: { issues: [] } }), 500);
});
```

### After (Real API):
```javascript
// Using actual HTTP calls
const response = await api.get('/issues', { params: filters });
```

---

## 🔄 Data Flow Examples

### 1. Mobile App → Submit Issue

```javascript
// Mobile App (React Native)
const submitIssue = async () => {
  try {
    const issueData = {
      title: 'Pothole on Main Street',
      description: 'Large pothole causing damage',
      type: 'pothole',
      latitude: 40.7128,
      longitude: -74.0060,
      image: capturedImage,
    };
    
    const response = await issueAPI.createIssue(issueData);
    // Response: { id: 123, status: 'Pending', ... }
  } catch (error) {
    console.error('Failed to submit issue:', error);
  }
};
```

### 2. Backend → Process Image with AI

```javascript
// Backend API (Node.js)
app.post('/api/issues', upload.single('image'), async (req, res) => {
  try {
    // 1. Save image to local storage
    const imagePath = req.file.path;
    
    // 2. Send to AI service for classification
    const aiResponse = await axios.post('http://localhost:8000/classify', {
      image_path: imagePath
    });
    
    // 3. Determine ward using PostGIS
    const ward = await findWardByCoordinates(req.body.latitude, req.body.longitude);
    
    // 4. Calculate priority
    const priority = calculatePriority(
      aiResponse.data.issue_type,
      aiResponse.data.confidence,
      ward
    );
    
    // 5. Save to database
    const issue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      type: aiResponse.data.issue_type,
      priority,
      ward_id: ward.id,
      location: `POINT(${req.body.longitude} ${req.body.latitude})`,
      ai_confidence: aiResponse.data.confidence,
      status: 'Pending',
    });
    
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Web Dashboard → View Issues

```javascript
// Web Dashboard (React.js)
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchIssues } from './store/issueSlice';

function IssueList() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // This now calls real API instead of mock data
    dispatch(fetchIssues({ 
      status: 'Pending',
      ward: 'Ward 1' 
    }));
  }, []);
  
  return <div>...</div>;
}
```

---

## 🧪 Testing the Integration

### 1. Start Backend Server
```bash
cd backend
npm run dev  # Should run on port 3001
```

### 2. Start AI Service
```bash
cd ai-service
python main.py  # Should run on port 8000
```

### 3. Start Web Dashboard
```bash
cd dashboard
npm run dev  # Running on port 5173
```

### 4. Start Mobile App
```bash
cd mobile-app
npm start
# Press 'a' for Android or 'i' for iOS
```

### 5. Test API Endpoints
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get issues
curl http://localhost:3001/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Implementation Checklist

### Anuj (Backend Developer)
- [ ] Setup Express.js server with PostgreSQL
- [ ] Implement all 20+ API endpoints
- [ ] Setup PostGIS for geo-fencing
- [ ] Implement JWT authentication
- [ ] Setup local image storage with Multer
- [ ] Create database migrations
- [ ] Add request validation (Joi)
- [ ] Integrate with AI service
- [ ] Add error handling middleware
- [ ] Write API tests

### Krishan (AI Service + Mobile Integration)
- [ ] Update mobile app API calls (remove mocks)
- [ ] Implement real authentication flow
- [ ] Setup image upload from camera
- [ ] Add offline queue with SQLite
- [ ] Test GPS/location services
- [ ] Build YOLOv8 FastAPI service
- [ ] Create classification endpoint
- [ ] Train/fine-tune model for civic issues

### Aditi (Frontend Integration)
- [ ] Update Redux slices to use real API
- [ ] Add environment variables
- [ ] Implement error handling UI
- [ ] Add loading states
- [ ] Test all dashboard features
- [ ] Handle authentication tokens
- [ ] Add retry logic for failed requests

### Raghav (DevOps)
- [ ] Setup PostgreSQL database
- [ ] Configure CORS for API
- [ ] Setup Docker for backend
- [ ] Deploy to Render
- [ ] Setup CI/CD pipeline
- [ ] Configure environment variables
- [ ] Setup monitoring and logging

---

## 🔐 Security Considerations

1. **JWT Tokens**: Expire after 7 days
2. **Password Hashing**: Use bcrypt (12 rounds)
3. **Input Validation**: Joi schemas on all endpoints
4. **CORS**: Only allow specific origins
5. **Rate Limiting**: Max 100 requests per 15 minutes
6. **Image Upload**: Max 5MB, validate file types
7. **SQL Injection**: Use Sequelize ORM (parameterized queries)

---

## 📝 Next Steps

1. **Anuj** starts building the backend API server
2. **Krishan** updates mobile app API integration
3. **Aditi** updates web dashboard to use real API
4. **Raghav** sets up PostgreSQL and deployment

Once backend is ready (even with basic endpoints), all three can integrate simultaneously.

---

## 🆘 Common Issues & Solutions

### Issue: Mobile app can't connect to backend
**Solution**: 
- Android emulator: Use `http://10.0.2.2:3001/api`
- Physical device: Use computer's local IP
- Check if backend is running and accessible

### Issue: CORS errors in web dashboard
**Solution**: Add CORS configuration in backend:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:19006'],
  credentials: true
}));
```

### Issue: Images not uploading
**Solution**: 
- Check Multer configuration
- Verify upload directory exists
- Check file size limits

---

## 📞 Team Communication

**Daily Sync**: Share API endpoint status
**Shared Postman Collection**: For testing endpoints
**API Documentation**: Use Swagger (http://localhost:3001/api-docs)

