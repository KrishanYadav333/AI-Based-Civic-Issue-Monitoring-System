# Database Setup Guide

## Prerequisites
- PostgreSQL 14+ installed
- PostGIS extension available

## Quick Start

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE civic_monitoring;

# Connect to the database
\c civic_monitoring
```

### 2. Run Schema
```bash
# From backend/database directory
psql -U postgres -d civic_monitoring -f schema.sql
```

### 3. Run Seed Data (Development Only)
```bash
psql -U postgres -d civic_monitoring -f seed.sql
```

## Database Features

### PostGIS Geo-fencing
- Ward boundaries stored as POLYGON geometry
- Issues stored with POINT geometry
- `ST_Contains` used for point-in-polygon detection
- Spatial indexes for performance

### Helper Functions
- `get_ward_from_coordinates(lat, lng)` - Returns ward UUID
- `check_duplicate_issue(lat, lng, type, time)` - Finds duplicates
- `generate_issue_number()` - Auto-generates unique issue IDs

### Views
- `ward_statistics` - Ward-wise issue counts and metrics
- `engineer_performance` - Engineer performance metrics

## Testing Queries

### Test Geo-fencing
```sql
SELECT get_ward_from_coordinates(22.30, 73.18);
```

### Test Duplicate Detection
```sql
SELECT * FROM check_duplicate_issue(
    22.30,  -- latitude
    73.18,  -- longitude
    'pothole',  -- issue type
    CURRENT_TIMESTAMP
);
```

### View Issues with Ward Names
```sql
SELECT 
    i.issue_number,
    i.issue_type_code,
    i.priority,
    i.status,
    w.ward_name,
    ST_X(i.location) as longitude,
    ST_Y(i.location) as latitude
FROM issues i
JOIN wards w ON i.ward_id = w.id;
```

### Find Issues Within Radius
```sql
-- Find all issues within 500m of a point
SELECT 
    issue_number,
    issue_type_code,
    ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint(73.18, 22.30), 4326)::geography
    ) AS distance_meters
FROM issues
WHERE ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(73.18, 22.30), 4326)::geography,
    500
)
ORDER BY distance_meters;
```

## Schema Overview

### Main Tables
- `users` - Surveyors, engineers, admins
- `wards` - Ward boundaries (PostGIS POLYGON)
- `issue_types` - Pothole, garbage, etc.
- `issues` - Main issue tracking (PostGIS POINT)
- `issue_history` - Audit trail
- `notifications` - User notifications
- `issue_metrics` - Performance tracking

### Indexes
- Spatial indexes on all geometry columns (GIST)
- B-tree indexes on foreign keys and commonly queried columns

## Environment Setup

Update backend/.env with database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_monitoring
DB_USER=postgres
DB_PASSWORD=your_password
```

## Production Deployment

For Render Free Tier PostgreSQL:
1. Create PostgreSQL instance on Render
2. Get connection string
3. Run schema.sql via Render dashboard or psql
4. Skip seed.sql (development only)
5. Update .env with Render database URL
