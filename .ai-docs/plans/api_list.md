# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.civicmonitoring.vmc.in/api`

## Authentication
All endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### POST /auth/login
Employee login with credentials.

**Request:**
```json
{
  "email": "surveyor@vmc.in",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "S001",
    "name": "Raj Kumar",
    "email": "surveyor@vmc.in",
    "role": "surveyor",
    "ward_id": 5
  },
  "expiresIn": 86400
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /auth/refresh
Refresh expired JWT token.

**Request:**
```json
{
  "token": "expired_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "new_jwt_token",
  "expiresIn": 86400
}
```

### POST /auth/logout
Logout user (invalidate token).

**Request:** (Empty body, just requires valid token in header)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /auth/password-reset
Request password reset via email.

**Request:**
```json
{
  "email": "user@vmc.in"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Reset link sent to email"
}
```

---

## 2. Issue Management Endpoints

### POST /issues
Submit a new civic issue.

**Request (multipart/form-data):**
```
image: <binary_file>
latitude: 22.3072
longitude: 73.1812
issue_type: pothole
description: "Large pothole on main street"
```

**Response (201 Created):**
```json
{
  "success": true,
  "issue": {
    "id": 5421,
    "type": "pothole",
    "latitude": 22.3072,
    "longitude": 73.1812,
    "ward_id": 5,
    "status": "pending",
    "priority": "high",
    "confidence_score": 0.92,
    "image_url": "https://your-render-app.onrender.com/uploads/issues/5421.jpg",
    "surveyor_id": "S001",
    "created_at": "2026-01-13T10:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Image is required",
  "details": "Please provide a valid image file"
}
```

### GET /issues/{id}
Get detailed information about an issue.

**Request:** 
```
GET /issues/5421
```

**Response (200 OK):**
```json
{
  "success": true,
  "issue": {
    "id": 5421,
    "type": "pothole",
    "latitude": 22.3072,
    "longitude": 73.1812,
    "ward_id": 5,
    "ward_name": "Ward 5",
    "status": "assigned",
    "priority": "high",
    "confidence_score": 0.92,
    "image_url": "https://your-render-app.onrender.com/uploads/issues/5421.jpg",
    "resolution_image_urls": [],
    "surveyor_id": "S001",
    "surveyor_name": "Raj Kumar",
    "engineer_id": "E005",
    "engineer_name": "Priya Singh",
    "department": "Roads",
    "created_at": "2026-01-13T10:30:00Z",
    "assigned_at": "2026-01-13T11:00:00Z",
    "resolved_at": null,
    "notes": "Large pothole on main street, safety hazard"
  }
}
```

### GET /issues
Get list of issues with filtering and pagination.

**Query Parameters:**
- `status`: pending, assigned, resolved (optional)
- `priority`: high, medium, low (optional)
- `type`: pothole, garbage, debris, cattle, broken_road, open_manhole (optional)
- `ward_id`: integer (optional)
- `engineer_id`: string (optional)
- `date_from`: ISO date (optional)
- `date_to`: ISO date (optional)
- `page`: integer (default 1)
- `limit`: integer (default 20, max 100)
- `sort`: field_name:asc/desc (default created_at:desc)

**Request:**
```
GET /issues?status=pending&priority=high&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5421,
      "type": "pothole",
      "priority": "high",
      "status": "pending",
      "ward_id": 5,
      "location": "22.3072, 73.1812",
      "created_at": "2026-01-13T10:30:00Z"
    },
    {
      "id": 5420,
      "type": "garbage",
      "priority": "medium",
      "status": "pending",
      "ward_id": 5,
      "location": "22.3080, 73.1820",
      "created_at": "2026-01-13T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 234,
    "pages": 12
  }
}
```

### PUT /issues/{id}/accept
Accept/claim an issue as engineer.

**Request:**
```
PUT /issues/5421/accept
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue accepted",
  "issue": {
    "id": 5421,
    "status": "assigned",
    "engineer_id": "E005",
    "assigned_at": "2026-01-13T11:00:00Z"
  }
}
```

### POST /issues/{id}/resolve
Upload resolution images and mark issue as resolved.

**Request (multipart/form-data):**
```
resolution_images: [<file1>, <file2>, <file3>]
notes: "Pothole filled and compacted"
```

**Response (200 OK):**
```json
{
  "success": true,
  "issue": {
    "id": 5421,
    "status": "resolved",
    "resolution_image_urls": [
      "https://your-render-app.onrender.com/uploads/resolutions/5421_res_1.jpg",
      "https://your-render-app.onrender.com/uploads/resolutions/5421_res_2.jpg"
    ],
    "resolved_at": "2026-01-15T14:30:00Z",
    "resolution_time_hours": 52
  }
}
```

### POST /issues/{id}/notes
Add notes/comments to an issue.

**Request:**
```json
{
  "note": "Scheduled for repair on 16th",
  "visibility": "private" // or "public"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "note": {
    "id": 1,
    "issue_id": 5421,
    "user_id": "E005",
    "user_name": "Priya Singh",
    "note": "Scheduled for repair on 16th",
    "visibility": "private",
    "created_at": "2026-01-13T11:15:00Z"
  }
}
```

### DELETE /issues/{id}
Delete/archive an issue (admin only).

**Request:**
```
DELETE /issues/5421
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Issue archived"
}
```

---

## 3. Ward & Geo-fencing Endpoints

### GET /wards
Get list of all wards.

**Request:**
```
GET /wards
```

**Response (200 OK):**
```json
{
  "success": true,
  "wards": [
    {
      "id": 1,
      "name": "Ward 1",
      "area_sq_km": 45.2,
      "population": 125000,
      "boundary": {
        "type": "Polygon",
        "coordinates": [[[73.1, 22.3], [73.2, 22.3], [73.2, 22.4], [73.1, 22.4], [73.1, 22.3]]]
      }
    },
    {
      "id": 2,
      "name": "Ward 2",
      "area_sq_km": 52.1,
      "population": 140000,
      "boundary": { ... }
    }
  ]
}
```

### GET /wards/{id}
Get details of a specific ward.

**Request:**
```
GET /wards/5
```

**Response (200 OK):**
```json
{
  "success": true,
  "ward": {
    "id": 5,
    "name": "Ward 5",
    "area_sq_km": 48.5,
    "population": 135000,
    "boundary": { ... },
    "engineers": [
      {
        "id": "E005",
        "name": "Priya Singh",
        "role": "engineer"
      }
    ],
    "issue_stats": {
      "total": 45,
      "pending": 12,
      "assigned": 8,
      "resolved": 25
    }
  }
}
```

### GET /wards/locate/{latitude}/{longitude}
Get ward ID from GPS coordinates (geo-fencing).

**Request:**
```
GET /wards/locate/22.3072/73.1812
```

**Response (200 OK):**
```json
{
  "success": true,
  "ward": {
    "id": 5,
    "name": "Ward 5",
    "confidence": 0.99
  }
}
```

---

## 4. Dashboard Endpoints

### GET /dashboard/engineer/{engineer_id}
Get engineer's dashboard data with assigned issues.

**Query Parameters:**
- `status`: pending, assigned, resolved (optional)
- `priority`: high, medium, low (optional)
- `days`: 7, 30, 90 (default: all)

**Request:**
```
GET /dashboard/engineer/E005?status=assigned&priority=high
```

**Response (200 OK):**
```json
{
  "success": true,
  "engineer": {
    "id": "E005",
    "name": "Priya Singh",
    "ward_id": 5,
    "ward_name": "Ward 5"
  },
  "stats": {
    "total_assigned": 25,
    "pending": 12,
    "in_progress": 5,
    "resolved_7days": 8,
    "avg_resolution_time": 1.2
  },
  "issues": [
    {
      "id": 5421,
      "type": "pothole",
      "priority": "high",
      "status": "assigned",
      "location": "22.3072, 73.1812",
      "created_at": "2026-01-13T10:30:00Z",
      "days_pending": 2
    }
  ]
}
```

### GET /dashboard/admin/stats
Get system-wide statistics.

**Query Parameters:**
- `date_from`: ISO date (optional)
- `date_to`: ISO date (optional)

**Request:**
```
GET /dashboard/admin/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "total_issues": 847,
    "pending": 234,
    "assigned": 345,
    "resolved": 268,
    "resolved_7days": 156,
    "avg_resolution_time": 1.35,
    "by_priority": {
      "high": 234,
      "medium": 456,
      "low": 157
    },
    "by_type": {
      "pothole": 270,
      "garbage": 236,
      "debris": 152,
      "cattle": 101,
      "broken_road": 59,
      "open_manhole": 25
    },
    "by_ward": [
      {"ward_id": 5, "count": 98, "avg_time": 1.1},
      {"ward_id": 3, "count": 76, "avg_time": 0.9},
      {"ward_id": 18, "count": 45, "avg_time": 3.1}
    ]
  }
}
```

### GET /dashboard/admin/heatmap
Get issue heatmap data for visualization.

**Query Parameters:**
- `type`: pothole, garbage, all (optional)
- `date_from`: ISO date (optional)
- `date_to`: ISO date (optional)

**Request:**
```
GET /dashboard/admin/heatmap?type=pothole
```

**Response (200 OK):**
```json
{
  "success": true,
  "heatmap_data": [
    {
      "latitude": 22.3072,
      "longitude": 73.1812,
      "intensity": 0.85,
      "issue_count": 12,
      "issue_type": "pothole"
    },
    {
      "latitude": 22.3150,
      "longitude": 73.1900,
      "intensity": 0.65,
      "issue_count": 8,
      "issue_type": "pothole"
    }
  ]
}
```

---

## 5. User Management Endpoints (Admin Only)

### GET /users
Get list of all users.

**Query Parameters:**
- `role`: surveyor, engineer, admin (optional)
- `ward_id`: integer (optional)
- `status`: active, inactive (optional)
- `page`: integer (default 1)
- `limit`: integer (default 20)

**Request:**
```
GET /users?role=engineer&status=active&page=1
```

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": "E005",
      "name": "Priya Singh",
      "email": "priya@vmc.in",
      "role": "engineer",
      "ward_id": 5,
      "status": "active",
      "created_at": "2025-08-15T10:00:00Z",
      "last_active": "2026-01-13T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /users
Create a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@vmc.in",
  "role": "surveyor",
  "ward_id": 8,
  "password": "TempPassword123!" // or auto-generate
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "S042",
    "name": "John Doe",
    "email": "john@vmc.in",
    "role": "surveyor",
    "ward_id": 8,
    "status": "active",
    "created_at": "2026-01-13T15:00:00Z"
  },
  "message": "Invitation email sent"
}
```

### PUT /users/{id}
Update user information.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@vmc.in",
  "ward_id": 9,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "S042",
    "name": "John Doe",
    "email": "john.doe@vmc.in",
    "ward_id": 9,
    "role": "surveyor",
    "status": "active"
  }
}
```

### DELETE /users/{id}
Deactivate/delete a user.

**Request:**
```
DELETE /users/S042
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deactivated"
}
```

### POST /users/{id}/password-reset
Reset user password (admin).

**Request:**
```json
{
  "new_password": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 6. AI Service Endpoints

### POST /ai/classify-image
Classify a civic issue image (internal service).

**Request (multipart/form-data):**
```
image: <binary_file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "classification": {
    "type": "pothole",
    "confidence": 0.92,
    "alternatives": [
      {"type": "debris", "confidence": 0.05},
      {"type": "broken_road", "confidence": 0.03}
    ]
  }
}
```

---

## 7. Reporting Endpoints

### POST /reports/generate
Generate a system report.

**Request:**
```json
{
  "type": "monthly", // daily, weekly, monthly, custom
  "date_from": "2026-01-01",
  "date_to": "2026-01-31",
  "format": "pdf", // pdf, csv, excel
  "sections": ["summary", "statistics", "ward_performance", "recommendations"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "report": {
    "id": "RPT001",
    "type": "monthly",
    "format": "pdf",
    "download_url": "https://your-render-app.onrender.com/uploads/reports/monthly_jan_2026.pdf",
    "generated_at": "2026-01-13T15:30:00Z",
    "expires_in": 604800
  }
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details if available",
  "timestamp": "2026-01-13T15:00:00Z"
}
```

### Common Error Codes
- `INVALID_REQUEST` (400): Invalid request parameters
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate or conflicting data
- `VALIDATION_ERROR` (400): Data validation failed
- `SERVER_ERROR` (500): Internal server error
- `SERVICE_UNAVAILABLE` (503): AI or other service unavailable

---

## Rate Limiting

API implements rate limiting:
- **Field Surveyor**: 100 requests/minute
- **Ward Engineer**: 100 requests/minute
- **Admin**: 200 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642079400
```

---

## API Versioning

Current API version: `v1`

Future API versions will be prefixed:
- `/api/v1/issues`
- `/api/v2/issues` (future)

Backwards compatibility will be maintained for at least 2 versions.

---

## API Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"surveyor@vmc.in","password":"password123"}'

# Get issues
curl -X GET http://localhost:3000/api/issues \
  -H "Authorization: Bearer eyJhbGc..."

# Submit issue
curl -X POST http://localhost:3000/api/issues \
  -H "Authorization: Bearer eyJhbGc..." \
  -F "image=@issue.jpg" \
  -F "latitude=22.3072" \
  -F "longitude=73.1812"
```

### Using Postman
- Import collection: `postman_collection.json`
- Set environment variables: `BASEURL`, `TOKEN`
- Execute requests with pre-configured settings

### API Documentation Interface
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api/openapi.json
