# AI-Based Civic Issue Monitoring System - AI Agent Instructions

## Project Overview

Government-grade civic issue monitoring system for Vadodara Municipal Corporation (VMC) with 19 wards. Three-role architecture (Surveyor→Engineer→Admin) with AI classification, PostGIS geo-fencing, and microservices deployment.

**Stack**: Node.js/Express backend, React frontend, React Native mobile, Python Flask AI service, PostgreSQL+PostGIS, Redis caching, Docker deployment.

## Architecture Patterns

### Microservices Structure
```
backend/          → Express REST API (port 3000)
ai-service/       → Flask ML service (port 5000)
frontend/         → React+Vite SPA (port 3001)
mobile-app/       → React Native+Expo
database/         → PostgreSQL+PostGIS schemas
```

**Critical Integration**: Backend calls AI service via axios at `process.env.AI_SERVICE_URL/api/detect`. Always handle AI service failures gracefully with fallback classifications.

### Database: PostGIS Geographic Queries

Core pattern for ward assignment:
```sql
SELECT get_ward_by_coordinates(latitude, longitude);  -- Returns ward_id via ST_Contains
```

**Key tables**:
- `wards`: GEOMETRY polygons for boundaries, queried via spatial indexes
- `issues`: GEOGRAPHY points for location, auto-converted via trigger `set_issue_location()`
- `issue_logs`: Audit trail - ALWAYS log actions (created/assigned/resolved)

**Pattern**: Use transactions for multi-table operations (issue creation + logging).

### Security Middleware Stack (Order Matters!)

Applied in `backend/src/server.js` (lines 31-40):
```javascript
app.use(requestId);           // 1. Request tracing
app.use(helmet());            // 2. Security headers
app.use(sanitizeInput);       // 3. Trim inputs
app.use(xssProtection);       // 4. XSS detection
app.use(sqlInjectionProtection); // 5. SQL injection blocking
app.use(apiLimiter);          // 6. Rate limiting (Redis-backed)
```

**Route-specific limiters**: Use `loginLimiter` (5/15min) on auth routes, `uploadLimiter` (50/hr) on file uploads.

## Authentication & Authorization

### JWT Pattern
```javascript
// Generate token (24hr expiry)
const token = jwt.sign({ userId, email, role }, process.env.JWT_SECRET, { expiresIn: '24h' });

// Protect routes
app.get('/api/issues', authMiddleware, authorize('engineer', 'admin'), handler);
```

**Roles**: `surveyor` (create issues), `engineer` (resolve issues), `admin` (all access).

### Password Security
- Bcrypt with 10 salt rounds
- Validation: min 8 chars, must include uppercase, lowercase, digit, special char
- Schema: `backend/src/middleware/validation.js` (lines 8-12)

## File Upload Workflow

`backend/src/routes/issues.js` (lines 10-18):
```javascript
const upload = multer({
  storage: multer.diskStorage({ destination: 'uploads/', filename: timestamp + file.originalname }),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images'));
    cb(null, true);
  }
});
```

**Critical**: Always use `upload.single('image')` or `upload.single('resolution_image')` middleware before file handlers. Store paths as `/uploads/filename.jpg` in database.

## API Validation Pattern

Use centralized Joi schemas from `backend/src/middleware/validation.js`:
```javascript
const { validate, validationSchemas } = require('../middleware/validation');
router.post('/issues', validate(validationSchemas.createIssue), handler);
```

**Never** manually validate - use existing schemas for login, createUser, createIssue, issueFilters, etc.

## Geographic Assignment Logic

`backend/src/routes/issues.js` (lines 80-90):
```javascript
// 1. Get ward from coordinates
const wardResult = await db.query('SELECT get_ward_by_coordinates($1, $2)', [lat, lng]);
const wardId = wardResult.rows[0].get_ward_by_coordinates;

// 2. Find assigned engineer for that ward
const engineerResult = await db.query(
  'SELECT id FROM users WHERE role = $1 AND ward_id = $2 LIMIT 1',
  ['engineer', wardId]
);
```

**Pattern**: Ward assignment → Engineer lookup → Department assignment (based on issue type).

## AI Service Integration

`ai-service/app.py` (lines 50-80):
```python
@app.route('/api/detect', methods=['POST'])
def detect_issue():
    file = request.files['image']
    # Current: rule-based classifier (PLACEHOLDER)
    # TODO: Replace with trained model.predict()
    result = ml_classifier(image_path)
    return {'issueType': type, 'confidence': conf, 'priority': priority}
```

**Backend calls** `backend/src/routes/issues.js` (lines 95-105):
```javascript
const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/api/detect`, formData, {
  headers: formData.getHeaders(),
  timeout: 30000
});
const { issueType, confidence, priority } = aiResponse.data;
```

**Fallback**: On AI failure, default to `issueType='other'`, `priority='medium'`.

## Dashboard Endpoints

### Engineer Dashboard
`GET /api/dashboard/engineer/:id` → Returns:
- Statistics: total_issues, pending_issues, resolved_issues, high_priority_count
- Issues: All issues assigned to engineer with ward/department details

### Admin Dashboard
`GET /api/dashboard/admin/stats` → System-wide statistics
`GET /api/dashboard/admin/heatmap` → Array of {latitude, longitude, status, priority} for map visualization
`GET /api/dashboard/admin/ward-performance` → Per-ward metrics with resolution rates

## Testing Conventions

`backend/tests/`:
- **Unit tests**: `tests/unit/*.test.js` - Test individual functions (auth, issues)
- **Integration tests**: `tests/integration/*.test.js` - Test complete workflows

**Pattern**: Create test users/wards in `beforeAll`, clean up in `afterAll`:
```javascript
beforeAll(async () => {
  const result = await db.query('INSERT INTO wards...');
  testWardId = result.rows[0].id;
});
afterAll(async () => {
  await db.query('DELETE FROM wards WHERE id = $1', [testWardId]);
});
```

Run: `npm test` (all), `npm run test:unit`, `npm run test:integration`

## Development Workflow

### Local Setup
```bash
./scripts/setup.sh      # Linux/Mac - automated setup with DB init
.\scripts\setup.ps1     # Windows - same functionality
```

### Docker Deployment
```bash
docker-compose up -d                               # Main services
docker-compose -f docker-compose.monitoring.yml up -d  # Prometheus+Grafana
```

### Health Checks
- Backend: `GET /health` → `{status: 'ok', services: {database: 'ok', ai: 'ok'}}`
- AI: `GET /health` → `{status: 'ok', service: 'AI Issue Detection'}`

### Logging
Winston logger at `backend/src/utils/logger.js`:
```javascript
logger.info('Issue created', { issueId, userId });
logger.error('AI service failed', { error: err.message });
```

Logs: `backend/logs/combined.log`, `backend/logs/error.log`

## Critical File Paths

| Component | Key Files | Purpose |
|-----------|-----------|---------|
| Database Schema | `database/schema.sql` | PostGIS setup, triggers, spatial indexes |
| Auth | `backend/src/middleware/auth.js` | JWT verification, role authorization |
| Validation | `backend/src/middleware/validation.js` | Joi schemas for all routes |
| Security | `backend/src/middleware/security.js` | XSS, SQL injection, sanitization |
| Rate Limiting | `backend/src/middleware/rateLimiter.js` | Redis-backed limiters |
| API Docs | `backend/src/config/swagger.json` | OpenAPI 3.0 specification |
| Email | `backend/src/utils/emailService.js` | Nodemailer templates |

## Common Pitfalls & Fixes

### Issue Creation Fails
- **Check**: Ward boundaries populated? Run `database/seed_data.sql`
- **Check**: AI service running? Fallback to default classification
- **Pattern**: Always use transaction for issue + log insertion

### Authentication Errors
- **Check**: JWT_SECRET set in `.env`? Must be 32+ chars
- **Check**: Token expired? JWT expiry is 24 hours
- **Pattern**: Always send token as `Authorization: Bearer <token>`

### File Upload Fails
- **Check**: `uploads/` directory exists? Created by setup script
- **Check**: File size < 10MB? Enforced by multer config
- **Pattern**: Use `multipart/form-data` with FormData

### Rate Limit Errors
- **Check**: Redis running? Required for rate limiters
- **Fix**: Adjust limits in `backend/src/middleware/rateLimiter.js`
- **Pattern**: Different limits for API (100/15min), login (5/15min), upload (50/hr)

## Code Style Conventions

### Backend (Node.js)
- Airbnb ESLint config (run `npm run lint`)
- Async/await (no callbacks or raw Promises)
- Centralized error handling via `errorHandler` middleware
- Always validate inputs with Joi schemas

### Frontend (React)
- Functional components with hooks (no classes)
- Context API for auth state (`AuthContext`)
- Tailwind CSS for styling
- Axios for API calls

### Database Queries
- Always use parameterized queries: `db.query('SELECT * FROM users WHERE id = $1', [userId])`
- Use transactions for multi-step operations
- Prefer stored functions for complex spatial queries

## Environment Variables

Critical vars (see `.env.production.example`):
```bash
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD  # PostgreSQL
JWT_SECRET                                        # Min 32 chars
AI_SERVICE_URL=http://localhost:5000              # AI microservice
REDIS_HOST=localhost                              # Rate limiting
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS      # Email notifications
```

## Mobile App Specifics

`mobile-app/src/screens/CaptureIssueScreen.js`:
- **Permissions**: Camera + Location required (checked in `requestPermissions()`)
- **GPS**: High accuracy with `Location.getCurrentPositionAsync({accuracy: HIGH})`
- **Upload**: FormData with multipart/form-data to `POST /api/issues`

## Production Deployment

Use `scripts/deploy.sh`:
1. Git pull latest
2. Install dependencies (`npm ci`)
3. Run database migrations
4. Restart services (Docker or PM2)
5. Health checks
6. Cleanup old images

**Monitoring**: Access Grafana at `:3002` for metrics, Prometheus at `:9090`

## When Adding New Features

1. **New API endpoint**: Add route → Add validation schema → Update Swagger docs
2. **New database table**: Add to `schema.sql` → Add indexes → Document in `database_schema.md`
3. **New role/permission**: Update `authorize()` middleware → Update seed data
4. **New issue type**: Update `issue_type` enum → Update AI classifier → Update department mappings

---

**Quick Reference**: API docs at `http://localhost:3000/api-docs` | Architecture at `plans/architecture.md`
