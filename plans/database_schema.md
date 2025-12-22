# Database Schema

Basic schema for the system. Using relational database (e.g., PostgreSQL with PostGIS for geo data).

## Tables

### users
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- email (VARCHAR(255) UNIQUE)
- password_hash (VARCHAR(255))
- role (ENUM: 'surveyor', 'engineer', 'admin')
- ward_id (INTEGER, FOREIGN KEY to wards.id, NULL for admin)
- created_at (TIMESTAMP DEFAULT NOW())

### wards
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- boundary (GEOMETRY, for GeoJSON polygons)
- created_at (TIMESTAMP DEFAULT NOW())

### issues
- id (SERIAL PRIMARY KEY)
- type (ENUM: 'pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole')
- latitude (DECIMAL(10,8))
- longitude (DECIMAL(11,8))
- ward_id (INTEGER, FOREIGN KEY to wards.id)
- status (ENUM: 'pending', 'assigned', 'resolved')
- priority (ENUM: 'high', 'medium', 'low')
- confidence_score (DECIMAL(3,2), from AI)
- image_url (VARCHAR(500))
- resolution_image_url (VARCHAR(500), NULL)
- engineer_id (INTEGER, FOREIGN KEY to users.id, NULL)
- department (VARCHAR(255), mapped from issue type)
- created_at (TIMESTAMP DEFAULT NOW())
- resolved_at (TIMESTAMP, NULL)

### departments
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- issue_types (JSON ARRAY, e.g., ['pothole', 'broken_road'])

### issue_logs
- id (SERIAL PRIMARY KEY)
- issue_id (INTEGER, FOREIGN KEY to issues.id)
- action (VARCHAR(255), e.g., 'created', 'assigned', 'resolved')
- user_id (INTEGER, FOREIGN KEY to users.id)
- timestamp (TIMESTAMP DEFAULT NOW())

## Indexes
- issues: ward_id, status, priority, engineer_id
- users: role, ward_id
- wards: spatial index on boundary (if using PostGIS)