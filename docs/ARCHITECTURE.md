# Service Communication Architecture

## Overview

This document explains how the 5 microservices communicate in the Civic Issue Monitoring System.

## Service Network

All services run on Docker bridge network `civic-network` with internal DNS resolution.

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER NETWORK: civic-network               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Frontend │  │  Backend  │  │AI Service │  │Robot Service │ │
│  │ :3001    │  │   :3000   │  │   :5000   │  │    :5001     │ │
│  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────────────┘ │
│       │              │              │                           │
│       │              └──────────────┘                           │
│       │                     │                                   │
│       │              ┌──────▼────────┐                          │
│       │              │   MongoDB     │                          │
│       │              │    :27017     │                          │
│       │              └───────────────┘                          │
│       │                                                         │
└───────┼─────────────────────────────────────────────────────────┘
        │
        ▼
   User Browser
```

## Communication Patterns

### 1. Issue Creation Flow

**Actors**: User → Frontend → Backend → AI Service → MongoDB

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as AI Service
    participant D as MongoDB

    U->>F: Upload image + GPS
    F->>B: POST /api/issues (multipart/form-data)
    B->>B: Save image to uploads/
    B->>A: POST http://ai-service:5000/classify
    A->>A: Load model, preprocess, infer
    A-->>B: {issue_type, confidence, ai_class}
    B->>D: Find ward by coordinates
    D-->>B: ward_id
    B->>D: Find engineer for ward
    D-->>B: engineer_id
    B->>D: Insert issue document
    D-->>B: Inserted _id
    B-->>F: {issue_id, issue_type, confidence}
    F-->>U: Display success + classification
```

**Key Code Locations**:
- Frontend: `frontend/src/pages/ReportIssue.jsx` (lines 120-145)
- Backend: `backend/src/routes/issues.js` (lines 50-150)
- AI Service: `ai-service/src/main.py` (lines 30-80)

**Environment Variables**:
```env
# Backend must know AI service URL
AI_SERVICE_URL=http://ai-service:5000  # Docker service name!

# NOT: http://localhost:5000 (won't work in Docker)
```

**Request Format**:
```javascript
// Frontend → Backend
const formData = new FormData();
formData.append('image', file);
formData.append('latitude', position.latitude);
formData.append('longitude', position.longitude);
formData.append('description', description);

axios.post('http://localhost:3000/api/issues', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});

// Backend → AI Service
const aiFormData = new FormData();
aiFormData.append('file', fs.createReadStream(imagePath));

axios.post(`${process.env.AI_SERVICE_URL}/classify`, aiFormData, {
  headers: aiFormData.getHeaders(),
  timeout: 30000
});
```

---

### 2. Dashboard Statistics Flow

**Actors**: Admin → Frontend → Backend → MongoDB

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant D as MongoDB

    A->>F: Open admin dashboard
    F->>B: GET /api/dashboard/admin/stats
    B->>D: Aggregate issues by status
    D-->>B: {pending, resolved, in_progress}
    B->>D: Aggregate issues by ward
    D-->>B: [{ward_id, count}]
    B->>D: Aggregate issues by type
    D-->>B: [{type, count}]
    B-->>F: Combined statistics JSON
    F->>F: Render charts (Recharts)
    F-->>A: Display dashboard
```

**Key Code Locations**:
- Frontend: `frontend/src/pages/AdminDashboard.jsx`
- Backend: `backend/src/routes/dashboard.js`
- MongoDB Aggregation: Pipeline in route handler

**Aggregation Example**:
```javascript
// backend/src/routes/dashboard.js
const stats = await Issue.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  }
]);

const wardPerformance = await Issue.aggregate([
  {
    $group: {
      _id: '$ward_id',
      total: { $sum: 1 },
      resolved: {
        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      ward_id: '$_id',
      resolution_rate: { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }
    }
  }
]);
```

---

### 3. Robot Survey Flow

**Actors**: Robot → Robot Service → Roboflow API → SQLite

```mermaid
sequenceDiagram
    participant R as Robot
    participant RS as Robot Service
    participant RF as Roboflow API
    participant DB as SQLite

    R->>RS: POST /detect (image)
    RS->>RS: Save image to static/uploads/
    
    par Run 8 AI models
        RS->>RF: Potholes model
        RF-->>RS: Detections
        RS->>RF: Garbage model
        RF-->>RS: Detections
        RS->>RF: Manholes model
        RF-->>RS: Detections
        RS->>RF: Damaged roads model
        RF-->>RS: Detections
        RS->>RF: Construction debris model
        RF-->>RS: Detections
        RS->>RF: Stray animals model
        RF-->>RS: Detections
        RS->>RF: Water leakage model
        RF-->>RS: Detections
        RS->>RF: Visual pollution model
        RF-->>RS: Detections
    end
    
    RS->>RS: Draw bounding boxes (OpenCV)
    RS->>RS: Save annotated image
    RS->>DB: Insert survey record
    DB-->>RS: Success
    RS-->>R: {detections, annotated_image_url}
```

**Key Code Locations**:
- Robot Service: `robot-service/app.py` (lines 100-300)
- Roboflow Integration: Uses `inference-sdk` library

**IMPORTANT**: Robot service is **independent** from main backend. It does NOT connect to MongoDB or Backend API. Data stays in local SQLite database.

**Roboflow Configuration**:
```python
# robot-service/app.py
from inference_sdk import InferenceHTTPClient

client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key=os.environ.get("ROBOFLOW_API_KEY")
)

models = {
    'potholes': 'potholes-model/1',
    'garbage': 'garbage-detection/2',
    'manholes': 'manhole-cover/1',
    'damaged_roads': 'road-damage/3',
    'construction_debris': 'construction-waste/1',
    'stray_animals': 'animal-detection/2',
    'water_leakage': 'water-leak/1',
    'visual_pollution': 'pollution-detect/1'
}

# Run inference
for model_name, model_id in models.items():
    result = client.infer(image_path, model_id=model_id)
    detections[model_name] = result['predictions']
```

---

### 4. Authentication Flow

**Actors**: User → Frontend → Backend

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as MongoDB

    U->>F: Enter email + password
    F->>B: POST /api/auth/login
    B->>D: Find user by email
    D-->>B: User document
    B->>B: bcrypt.compare(password, hash)
    alt Password valid
        B->>B: jwt.sign({userId, role})
        B-->>F: {token, user}
        F->>F: localStorage.setItem('token')
        F->>F: Redux dispatch(setUser)
        F-->>U: Redirect to dashboard
    else Password invalid
        B-->>F: 401 Unauthorized
        F-->>U: Display error
    end
```

**JWT Token Structure**:
```javascript
// Payload
{
  userId: "507f1f77bcf86cd799439011",
  email: "admin@vmc.gov.in",
  role: "admin",
  iat: 1706605200,  // Issued at
  exp: 1706691600   // Expires (24 hours later)
}

// Token in requests
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

**Middleware Protection**:
```javascript
// backend/src/middleware/auth.js
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage
router.get('/api/issues', authMiddleware, authorize('engineer', 'admin'), handler);
```

---

## Service URLs

### External (from browser)
```
Frontend:      http://localhost:3001
Backend API:   http://localhost:3000
AI Service:    http://localhost:5000
Robot Service: http://localhost:5001
```

### Internal (Docker network)
```
Frontend → Backend:   http://backend:3000
Backend → AI Service: http://ai-service:5000
Backend → Robot:      http://robot-service:5001  (not used currently)
Backend → MongoDB:    mongodb://mongodb:27017/civic_issues
```

**CRITICAL**: Backend `.env` must use service names, NOT `localhost`:
```env
# ✅ Correct (Docker)
AI_SERVICE_URL=http://ai-service:5000
DB_HOST=mongodb

# ❌ Wrong (will fail in Docker)
AI_SERVICE_URL=http://localhost:5000
DB_HOST=localhost
```

---

## Health Checks

All services expose `/health` endpoints for monitoring:

```bash
# Check all services
curl http://localhost:3000/health  # Backend
curl http://localhost:5000/health  # AI Service
curl http://localhost:5001/health  # Robot Service

# Expected responses
{
  "status": "ok",
  "service": "Civic Issues Backend",
  "timestamp": "2025-01-30T12:00:00Z",
  "database": "connected",
  "ai_service": "reachable"
}
```

**Docker Compose health checks**:
```yaml
# docker-compose.yml
ai-service:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

---

## Error Handling

### AI Service Unavailable

If AI service is down or slow, backend should fallback:

```javascript
// backend/src/services/aiService.js
try {
  const response = await axios.post(`${AI_SERVICE_URL}/classify`, formData, {
    timeout: 30000  // 30 second timeout
  });
  return response.data;
} catch (error) {
  logger.error('AI service failed', { error: error.message });
  
  // Fallback classification
  return {
    issue_type: 'other',
    confidence: 0.0,
    ai_class: 'unknown',
    fallback: true
  };
}
```

### Database Connection Loss

Backend should retry MongoDB connection:

```javascript
// backend/src/index.js
mongoose.connect(process.env.MONGODB_URI, {
  retryWrites: true,
  retryReads: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

mongoose.connection.on('disconnected', () => {
  logger.error('MongoDB disconnected');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI);
  }, 5000);
});
```

---

## Performance Optimizations

### 1. Redis Caching (AI Service)
```python
# ai-service/src/cache.py
import redis
import hashlib

redis_client = redis.Redis(host='localhost', port=6379)

def get_cached_prediction(image_hash):
    return redis_client.get(f'prediction:{image_hash}')

def cache_prediction(image_hash, result, ttl=3600):
    redis_client.setex(f'prediction:{image_hash}', ttl, result)
```

### 2. MongoDB Indexes
```javascript
// backend/src/models/Issue.js
issueSchema.index({ location: '2dsphere' });  // Geo queries
issueSchema.index({ status: 1, created_at: -1 });  // Dashboard
issueSchema.index({ assigned_to: 1, status: 1 });  // Engineer view
issueSchema.index({ ward_id: 1 });  // Ward filtering
```

### 3. Image Compression
```javascript
// backend/src/middleware/imageProcessing.js
const sharp = require('sharp');

const compressImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};
```

---

## Security Measures

### 1. Rate Limiting
```javascript
// Applied in backend/src/index.js
app.use('/api/', apiLimiter);         // 100 req/15min
app.use('/api/auth/login', loginLimiter);  // 5 req/15min
app.use('/api/issues', uploadLimiter);     // 50 req/hour
```

### 2. Input Validation
```javascript
// backend/src/middleware/validation.js
const createIssueSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  description: Joi.string().max(500),
  image: Joi.string().required()
});
```

### 3. File Upload Security
```javascript
// backend/src/routes/issues.js
const upload = multer({
  storage: multer.diskStorage({ /* ... */ }),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    cb(null, true);
  }
});
```

---

## Monitoring & Logging

### Centralized Logging
```javascript
// backend/src/utils/logger.js (Winston)
logger.info('Issue created', { issueId, userId, ward });
logger.error('AI service timeout', { error, duration });
logger.warn('High memory usage', { memory: process.memoryUsage() });

// Logs stored in:
// - backend/logs/combined.log
// - backend/logs/error.log
```

### Metrics Collection
```javascript
// backend/src/middleware/metrics.js
const { register, Counter, Histogram } = require('prom-client');

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

---

## Debugging Tips

### 1. Check Service Communication
```bash
# From backend container, test AI service
docker exec -it civic-issues-backend curl http://ai-service:5000/health

# From host, test through port mapping
curl http://localhost:5000/health
```

### 2. View Real-Time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Grep for errors
docker-compose logs -f | grep -i error
```

### 3. Inspect Network
```bash
# List Docker networks
docker network ls

# Inspect civic-network
docker network inspect civic-network

# See connected containers
docker network inspect civic-network | grep Name
```

---

## Summary

| Service | Port | Purpose | Dependencies | Key Endpoints |
|---------|------|---------|--------------|---------------|
| **Frontend** | 3001 | React SPA | Backend | /, /login, /dashboard |
| **Backend** | 3000 | REST API | MongoDB, AI Service | /api/issues, /api/auth |
| **AI Service** | 5000 | Classification | None | /classify, /health |
| **Robot Service** | 5001 | Robot surveys | Roboflow API | /detect, /health |
| **MongoDB** | 27017 | Database | None | N/A |

**Key Communication Patterns**:
1. Frontend always calls Backend (never calls AI/Robot directly)
2. Backend calls AI Service for classification
3. Robot Service is independent (own database, own workflow)
4. All services use Docker service names for internal communication
5. Health checks ensure service availability

---

**For more details**: See `/backend/src/routes/` for API implementations
