-- Database Initialization Script for Civic Issue Monitoring System
-- Run this to set up the database from scratch

-- Drop existing database if it exists (careful in production!)
DROP DATABASE IF EXISTS civic_issues;
DROP DATABASE IF EXISTS civic_issues_test;

-- Create databases
CREATE DATABASE civic_issues;
CREATE DATABASE civic_issues_test;

-- Connect to main database
\c civic_issues

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('surveyor', 'engineer', 'admin')),
    ward_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ward ON users(ward_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- WARDS TABLE (with PostGIS geometry)
-- ============================================
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_number INTEGER UNIQUE NOT NULL,
    ward_name VARCHAR(255) NOT NULL,
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    centroid GEOMETRY(POINT, 4326),
    area_sqkm DECIMAL(10, 2),
    population INTEGER,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary);
CREATE INDEX idx_wards_centroid ON wards USING GIST(centroid);
CREATE INDEX idx_wards_number ON wards(ward_number);

-- ============================================
-- ISSUE TYPES TABLE
-- ============================================
CREATE TABLE issue_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100) NOT NULL,
    default_priority VARCHAR(20) CHECK (default_priority IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_types_code ON issue_types(code);

-- Insert default issue types
INSERT INTO issue_types (code, name, description, department, default_priority) VALUES
('pothole', 'Pothole', 'Road damage and potholes', 'Roads', 'high'),
('garbage', 'Garbage Accumulation', 'Trash and waste collection problems', 'Sanitation', 'medium'),
('debris', 'Debris', 'Scattered waste and rubble', 'Sanitation', 'medium'),
('stray_cattle', 'Stray Cattle', 'Abandoned or roaming livestock', 'AnimalControl', 'medium'),
('broken_road', 'Broken Road', 'Damaged road surfaces', 'Roads', 'high'),
('open_manhole', 'Open Manhole', 'Uncovered utility access points', 'Drainage', 'critical');

-- ============================================
-- ISSUES TABLE (with PostGIS location)
-- ============================================
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Location data (PostGIS)
    location GEOMETRY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    ward_id UUID REFERENCES wards(id),
    address TEXT,
    
    -- Issue classification
    issue_type_id UUID REFERENCES issue_types(id) NOT NULL,
    issue_type_code VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    
    -- AI classification data
    ai_confidence DECIMAL(5, 2),
    ai_alternative_classes JSONB,
    
    -- Priority and status
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected')
    ),
    
    -- Content
    description TEXT,
    image_url TEXT NOT NULL,
    resolution_image_url TEXT,
    resolution_notes TEXT,
    
    -- Assignment
    surveyor_id UUID REFERENCES users(id),
    engineer_id UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE INDEX idx_issues_location ON issues USING GIST(location);
CREATE INDEX idx_issues_ward ON issues(ward_id);
CREATE INDEX idx_issues_type ON issues(issue_type_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_engineer ON issues(engineer_id);
CREATE INDEX idx_issues_surveyor ON issues(surveyor_id);
CREATE INDEX idx_issues_created ON issues(created_at);

-- Trigger to auto-set location from lat/lng
CREATE OR REPLACE FUNCTION set_issue_location() RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_issue_location
    BEFORE INSERT OR UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION set_issue_location();

-- ============================================
-- ISSUE LOGS TABLE
-- ============================================
CREATE TABLE issue_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_logs_issue ON issue_logs(issue_id);
CREATE INDEX idx_issue_logs_created ON issue_logs(created_at);

-- ============================================
-- SPATIAL FUNCTIONS
-- ============================================

-- Function to get ward by coordinates
CREATE OR REPLACE FUNCTION get_ward_by_coordinates(lat DECIMAL, lng DECIMAL)
RETURNS UUID AS $$
DECLARE
    ward_uuid UUID;
BEGIN
    SELECT id INTO ward_uuid
    FROM wards
    WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
    LIMIT 1;
    
    RETURN ward_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

-- Sample wards for testing
INSERT INTO wards (ward_number, ward_name, boundary, centroid, area_sqkm, population, department) VALUES
(1, 'Ward 1 - Central', 
    ST_GeomFromText('POLYGON((73.17 22.32, 73.19 22.32, 73.19 22.30, 73.17 22.30, 73.17 22.32))', 4326),
    ST_SetSRID(ST_MakePoint(73.18, 22.31), 4326),
    5.2,
    45000,
    'Roads'
),
(2, 'Ward 2 - Sayajigunj', 
    ST_GeomFromText('POLYGON((73.18 22.31, 73.20 22.31, 73.20 22.29, 73.18 22.29, 73.18 22.31))', 4326),
    ST_SetSRID(ST_MakePoint(73.19, 22.30), 4326),
    4.8,
    38000,
    'Roads'
),
(3, 'Ward 3 - Fatehgunj', 
    ST_GeomFromText('POLYGON((73.19 22.33, 73.21 22.33, 73.21 22.31, 73.19 22.31, 73.19 22.33))', 4326),
    ST_SetSRID(ST_MakePoint(73.20, 22.32), 4326),
    6.2,
    52000,
    'Sanitation'
);

-- Admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'System Administrator', 'admin');

-- Sample engineers
INSERT INTO users (username, email, password_hash, full_name, phone, role, ward_id) VALUES
('engineer1', 'engineer1@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'Amit Patel', '9876543213', 'engineer', 
    (SELECT id FROM wards WHERE ward_number = 1)),
('engineer2', 'engineer2@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'Neha Desai', '9876543214', 'engineer',
    (SELECT id FROM wards WHERE ward_number = 2)),
('engineer3', 'engineer3@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'Suresh Mehta', '9876543215', 'engineer',
    (SELECT id FROM wards WHERE ward_number = 3));

-- Sample surveyors
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('surveyor1', 'surveyor1@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'Rajesh Kumar', '9876543211', 'surveyor'),
('surveyor2', 'surveyor2@vmc.gov.in', '$2b$10$xvzfP5W8aKQQJ7zC9mYgJOqF.jGZ0B8qYqxQZ3yW.XK5wZW3qYqxQ', 'Priya Sharma', '9876543212', 'surveyor');

-- ============================================
-- SETUP TEST DATABASE
-- ============================================
\c civic_issues_test

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Copy all table structures (but not data)
\c civic_issues
\! pg_dump -U postgres -d civic_issues --schema-only | psql -U postgres -d civic_issues_test

-- Add essential test data to test database
\c civic_issues_test

-- Copy issue types
INSERT INTO issue_types SELECT * FROM civic_issues.issue_types;

-- Copy sample wards
INSERT INTO wards SELECT * FROM civic_issues.wards WHERE ward_number <= 2;

GRANT ALL PRIVILEGES ON DATABASE civic_issues TO postgres;
GRANT ALL PRIVILEGES ON DATABASE civic_issues_test TO postgres;
