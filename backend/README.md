# Backend API - Civic Issue Monitoring System

Node.js + Express backend with PostgreSQL + PostGIS for spatial queries.

## Features

- **Issue Management**: Submit, track, assign, and resolve civic issues
- **AI Classification**: Integration with FastAPI AI service for image classification
- **Geo-Fencing**: PostGIS spatial queries for ward detection and duplicate checking
- **Workflow Management**: State machine for issue lifecycle
- **Authentication**: JWT-based auth with role-based access control
- **Analytics**: Dashboard statistics and SLA monitoring

## Tech Stack

- Node.js 18+
- Express 4.x
- PostgreSQL 14+ with PostGIS extension
- Redis (optional, for caching)
- bcrypt (password hashing)
- JWT (authentication)
- Winston (logging)

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL 14+ with PostGIS extension
3. Redis (optional)

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_monitoring
DB_USER=postgres
DB_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 3. Setup Database

Create database and enable PostGIS:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE civic_monitoring;

# Connect to database
\c civic_monitoring

# Enable PostGIS extension
CREATE EXTENSION postgis;

# Exit psql
\q
```

Run schema and seed data:

```bash
# Run schema
psql -U postgres -d civic_monitoring -f database/schema.sql

# Run seed data (optional, for development)
psql -U postgres -d civic_monitoring -f database/seed.sql
```

### 4. Start Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password

### Issues

- `POST /api/issues` - Submit new issue (authenticated)
- `GET /api/issues` - Get all issues with filters
- `GET /api/issues/nearby` - Get issues near location
- `GET /api/issues/:id` - Get issue details
- `PATCH /api/issues/:id` - Update issue
- `POST /api/issues/:id/assign` - Assign to engineer (admin only)
- `POST /api/issues/:id/status` - Update status
- `POST /api/issues/:id/resolve` - Resolve issue (engineer only)
- `POST /api/issues/:id/reject` - Reject issue (admin only)
- `GET /api/issues/:id/history` - Get issue history

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `GET /api/users/:id/issues` - Get engineer's assigned issues
- `PATCH /api/users/:id` - Update user (admin only)

### Wards

- `GET /api/wards` - Get all wards
- `GET /api/wards/:id` - Get ward by ID
- `GET /api/wards/:id/statistics` - Get ward statistics
- `GET /api/wards/locate/coordinates` - Get ward from coordinates

### Analytics

- `GET /api/analytics/dashboard` - Dashboard statistics (admin only)
- `GET /api/analytics/sla-breaches` - SLA breach candidates (admin only)
- `GET /api/analytics/wards` - All ward statistics (admin only)

### Health

- `GET /health` - Health check endpoint

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get token from `/api/auth/login` or `/api/auth/register` endpoints.

## User Roles

- **surveyor**: Can submit and view issues
- **engineer**: Can view, update, and resolve assigned issues
- **admin**: Full access to all endpoints

## Example Requests

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "surveyor",
    "full_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### Submit Issue

```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "latitude": 22.3072,
    "longitude": 73.1812,
    "image_url": "/path/to/image.jpg",
    "description": "Large pothole on main road"
  }'
```

### Get Issues

```bash
curl http://localhost:3000/api/issues?status=pending&priority=high \
  -H "Authorization: Bearer <your-token>"
```

## Database Schema

See [database/README.md](database/README.md) for detailed schema documentation.

Key tables:
- `users` - User accounts with roles
- `wards` - Administrative wards with PostGIS boundaries
- `issue_types` - Civic issue categories
- `issues` - Reported issues with spatial data
- `issue_history` - Audit trail
- `notifications` - User notifications
- `issue_metrics` - SLA tracking

## Project Structure

```
backend/
├── src/
│   ├── core/
│   │   └── constants.js       # Application constants
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js    # Error handling
│   │   └── validation.js      # Request validation
│   ├── routes/
│   │   ├── analytics.js       # Analytics endpoints
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── issues.js          # Issue management endpoints
│   │   ├── users.js           # User management endpoints
│   │   └── wards.js           # Ward endpoints
│   ├── services/
│   │   ├── aiService.js       # AI service integration
│   │   ├── authService.js     # Authentication logic
│   │   ├── database.js        # Database connection
│   │   ├── geoService.js      # PostGIS spatial queries
│   │   ├── issueService.js    # Issue business logic
│   │   └── workflowService.js # State machine
│   ├── utils/
│   │   ├── helpers.js         # Helper functions
│   │   ├── logger.js          # Winston logger
│   │   ├── response.js        # API responses
│   │   └── validation.js      # Validators
│   └── index.js               # Main server
├── database/
│   ├── schema.sql             # Database schema
│   ├── seed.sql               # Sample data
│   └── README.md              # Database docs
├── tests/                     # Test files
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Logging

Logs are stored in:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Log rotation: 5MB max file size, 5 files kept

## Testing

Run tests:

```bash
npm test
```

## Development

Watch mode with auto-reload:

```bash
npm run dev
```

## Production Deployment

See [../plans/DEPLOYMENT.md](../plans/DEPLOYMENT.md) for deployment instructions.

Quick steps:
1. Set `NODE_ENV=production` in `.env`
2. Configure production database
3. Set strong `JWT_SECRET`
4. Deploy to Render/Railway/Heroku
5. Enable PostGIS extension on production database

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:
```bash
psql -U postgres -d civic_monitoring -c "SELECT NOW();"
```

### PostGIS Extension Missing

Enable PostGIS:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Verify:
```sql
SELECT PostGIS_version();
```

### AI Service Connection Issues

Check AI service is running:
```bash
curl http://localhost:8000/health
```

Update `AI_SERVICE_URL` in `.env` if needed.

## License

MIT
