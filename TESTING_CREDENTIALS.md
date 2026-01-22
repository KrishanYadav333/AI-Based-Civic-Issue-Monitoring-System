# 🔑 Testing Credentials & Quick Start Guide

**Project**: AI Civic Issue Monitor - VMC  
**Environment**: Development/Testing  
**Last Updated**: January 22, 2026

---

## 📋 Quick Start Testing

### 1. Start All Services

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: AI Service
cd ai-service
python app.py

# Terminal 3: Frontend (optional)
cd frontend
npm start

# Terminal 4: Database (if not running as service)
# PostgreSQL should be running on port 5432
```

### 2. Verify Services are Running

```bash
# Run health checks
node scripts/health-check.js

# Or manually:
curl http://localhost:3000/health
curl http://localhost:5000/health
```

---

## 👥 Test User Accounts

### Admin Account (Full Access)

```
Email:    admin@vmc.gov.in
Password: Admin@123456
Role:     admin
Access:   - Full system access
          - View all wards
          - User management
          - System configuration
          - Analytics and reports
```

### Engineer Account - Ward 1

```
Email:    engineer1@vmc.gov.in
Password: Engineer@123456
Role:     engineer
Ward:     Ward 1 - Sayajigunj
Access:   - View issues in Ward 1
          - Resolve issues in Ward 1
          - Update issue status
          - Add resolution notes
```

### Engineer Account - Ward 2

```
Email:    engineer2@vmc.gov.in
Password: Engineer@123456
Role:     engineer
Ward:     Ward 2 - Alkapuri
Access:   - View issues in Ward 2
          - Resolve issues in Ward 2
          - Update issue status
          - Add resolution notes
```

### Surveyor Account (Field Staff)

```
Email:    surveyor@vmc.gov.in
Password: Surveyor@123456
Role:     surveyor
Access:   - Create new issues
          - Upload issue photos
          - View own submitted issues
          - Track issue status
```

---

## 🧪 Testing Workflows

### 1. Test User Login

**Method**: POST  
**URL**: `http://localhost:3000/api/auth/login`  
**Body**:
```json
{
  "email": "admin@vmc.gov.in",
  "password": "Admin@123456"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "VMC Admin",
    "email": "admin@vmc.gov.in",
    "role": "admin"
  }
}
```

**Copy the token** - you'll need it for subsequent requests!

---

### 2. Test Issue Creation (Surveyor)

First, login as surveyor and get the token.

**Method**: POST  
**URL**: `http://localhost:3000/api/issues`  
**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data
```

**Body** (form-data):
```
latitude: 22.305
longitude: 73.185
image: [Upload any JPEG/PNG file]
```

**Expected Response**:
```json
{
  "issueId": 1,
  "wardId": 1,
  "type": "pothole",
  "priority": "high",
  "confidence": 0.95,
  "status": "pending",
  "message": "Issue created successfully"
}
```

---

### 3. Test Get All Issues

**Method**: GET  
**URL**: `http://localhost:3000/api/issues`  
**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters** (optional):
```
?status=pending
?priority=high
?ward=1
?page=1
?limit=20
```

**Expected Response**:
```json
{
  "issues": [
    {
      "id": 1,
      "type": "pothole",
      "latitude": 22.305,
      "longitude": 73.185,
      "status": "pending",
      "priority": "high",
      "confidence_score": 0.95,
      "image_url": "/uploads/issue-123456.jpg",
      "ward_name": "Ward 1 - Sayajigunj",
      "created_at": "2026-01-22T..."
    }
  ],
  "count": 1,
  "page": 1,
  "totalPages": 1
}
```

---

### 4. Test Resolve Issue (Engineer)

Login as engineer and get token.

**Method**: POST  
**URL**: `http://localhost:3000/api/issues/1/resolve`  
**Headers**:
```
Authorization: Bearer ENGINEER_TOKEN_HERE
Content-Type: multipart/form-data
```

**Body**:
```
resolution_notes: Pothole filled with asphalt
resolution_image: [Upload before/after photo]
```

**Expected Response**:
```json
{
  "status": "resolved",
  "issue": {
    "id": 1,
    "status": "resolved",
    "resolution_notes": "Pothole filled with asphalt",
    "resolved_at": "2026-01-22T...",
    "engineer_name": "Ward 1 Engineer"
  }
}
```

---

### 5. Test Dashboard Stats (Admin)

**Method**: GET  
**URL**: `http://localhost:3000/api/dashboard/admin/stats`  
**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected Response**:
```json
{
  "totalIssues": 150,
  "pendingIssues": 45,
  "resolvedIssues": 95,
  "assignedIssues": 10,
  "highPriority": 20,
  "mediumPriority": 80,
  "lowPriority": 50,
  "byWard": [
    { "ward_name": "Ward 1", "count": 50 },
    { "ward_name": "Ward 2", "count": 45 }
  ],
  "byType": [
    { "type": "pothole", "count": 60 },
    { "type": "garbage", "count": 40 }
  ]
}
```

---

## 🖼️ Test Images

For testing issue detection, use images of:
- Potholes (roads with holes)
- Garbage/waste piles
- Debris on roads
- Stray cattle
- Broken roads
- Open manholes

The AI service will classify the issue type based on the image.

---

## 📍 Test Coordinates

### Valid Coordinates (Within Vadodara Boundaries)

**Ward 1 - Sayajigunj**:
```
Latitude:  22.305
Longitude: 73.185
```

**Ward 2 - Alkapuri**:
```
Latitude:  22.303
Longitude: 73.175
```

**Ward 3 - Manjalpur**:
```
Latitude:  22.295
Longitude: 73.195
```

### Invalid Coordinates (Outside Service Area)
```
Latitude:  28.6139  (Delhi)
Longitude: 77.2090
```
Should return error: "Location is outside service area"

---

## 🛠️ API Testing Tools

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vmc.gov.in","password":"Admin@123456"}'

# Create issue
curl -X POST http://localhost:3000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "latitude=22.305" \
  -F "longitude=73.185" \
  -F "image=@/path/to/image.jpg"

# Get issues
curl -X GET "http://localhost:3000/api/issues?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. **Import Collection**: Use the Swagger docs at `http://localhost:3000/api-docs`
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `token`: Your JWT token after login
3. **Test All Endpoints**: Use the pre-configured requests

### Using Swagger UI

Visit: `http://localhost:3000/api-docs`

1. Click "Authorize" button
2. Enter token: `Bearer YOUR_TOKEN_HERE`
3. Test endpoints directly in browser

---

## 🧪 Automated Testing

### Run Unit Tests

```bash
cd backend
npm test
```

Expected: All 24 tests should pass

### Run Integration Tests

```bash
cd backend
npm run test:integration
```

### Run Load Tests

```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/health
```

---

## 🔍 Common Test Scenarios

### Scenario 1: Complete Surveyor Workflow

1. Login as surveyor
2. Take location coordinates (or use test coordinates)
3. Upload issue photo
4. Verify issue created with AI classification
5. Check issue appears in issue list

### Scenario 2: Complete Engineer Workflow

1. Login as engineer
2. View issues in assigned ward
3. Select a pending issue
4. Add resolution notes
5. Upload resolution photo
6. Mark as resolved
7. Verify status updated

### Scenario 3: Admin Dashboard

1. Login as admin
2. View system-wide statistics
3. Filter issues by ward/status/priority
4. View heatmap of issue locations
5. Generate reports

---

## 🐛 Troubleshooting Testing

### Issue: "Token Invalid" Error

**Solution**: Token might be expired (24-hour expiry). Login again to get a new token.

### Issue: "Location outside service area"

**Solution**: Use coordinates within Vadodara bounds (see test coordinates above).

### Issue: "File too large"

**Solution**: Image must be < 10MB. Compress or use a smaller image.

### Issue: "Only JPEG and PNG allowed"

**Solution**: Upload only .jpg, .jpeg, or .png files.

### Issue: Cannot create issue

**Solution**: 
1. Check you're logged in as surveyor
2. Verify coordinates are within range
3. Ensure image is attached
4. Check backend logs: `tail -f backend/logs/combined.log`

---

## 📊 Expected Test Results

### Authentication Tests
- ✅ Login with valid credentials → 200 OK
- ✅ Login with invalid email → 401 Unauthorized
- ✅ Login with wrong password → 401 Unauthorized
- ✅ Token verification → 200 OK
- ✅ Expired token → 401 Unauthorized

### Issue Tests
- ✅ Create issue with image → 201 Created
- ✅ Create without auth → 401 Unauthorized
- ✅ Create without image → 400 Bad Request
- ✅ Get all issues → 200 OK
- ✅ Get issue by ID → 200 OK
- ✅ Resolve issue (engineer) → 200 OK
- ✅ Resolve issue (non-engineer) → 403 Forbidden

### Authorization Tests
- ✅ Admin can access all endpoints
- ✅ Engineer can only resolve assigned ward issues
- ✅ Surveyor can only create issues
- ✅ Cross-ward access denied for engineers

---

## 📝 Test Data Summary

| Users     | Count | Passwords        |
|-----------|-------|------------------|
| Admin     | 1     | Admin@123456     |
| Engineers | 2     | Engineer@123456  |
| Surveyors | 1     | Surveyor@123456  |

| Wards     | Coordinates       | Polygon Defined |
|-----------|-------------------|-----------------|
| Ward 1    | 22.31, 73.18      | ✅              |
| Ward 2    | 22.30, 73.17      | ✅              |
| Ward 3    | 22.29, 73.19      | ✅              |

| Departments    | Issue Types                |
|----------------|----------------------------|
| Roads          | pothole, broken_road       |
| Sanitation     | garbage, debris            |
| Drainage       | open_manhole               |
| Animal Control | stray_cattle               |

---

## 🚀 Ready to Test!

All credentials and endpoints are ready. Start services and begin testing!

**Quick Command**:
```bash
# Seed test users (first time only)
node scripts/seed-users.js

# Run health checks
node scripts/health-check.js

# Start testing!
```

---

**Need Help?**  
- Check logs: `backend/logs/combined.log`
- API Docs: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`
