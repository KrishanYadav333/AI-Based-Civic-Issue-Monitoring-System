-- AI-Based Civic Issue Monitoring System Database Schema
-- PostgreSQL with PostGIS extension

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS issue_logs CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS wards CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('surveyor', 'engineer', 'admin');
CREATE TYPE issue_type AS ENUM ('pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole');
CREATE TYPE issue_status AS ENUM ('pending', 'assigned', 'resolved');
CREATE TYPE issue_priority AS ENUM ('high', 'medium', 'low');

-- Wards table: Stores ward information and boundaries
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boundary GEOMETRY(POLYGON, 4326),  -- GeoJSON polygon for ward boundaries
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index for efficient geo-queries
CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary);

-- Users table: VMC employees (surveyors, engineers, admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,  -- NULL for admins
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ward_id ON users(ward_id);
CREATE INDEX idx_users_email ON users(email);

-- Departments table: Maps issue types to departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    issue_types TEXT[] NOT NULL,  -- Array of issue types handled by this department
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issues table: Civic issues reported by surveyors
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    type issue_type NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    location GEOGRAPHY(POINT, 4326),  -- Geographic point for spatial queries
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
    status issue_status DEFAULT 'pending' NOT NULL,
    priority issue_priority NOT NULL,
    confidence_score DECIMAL(3,2),  -- AI confidence score (0.00 to 1.00)
    image_url VARCHAR(500) NOT NULL,
    resolution_image_url VARCHAR(500),
    engineer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Create indexes for efficient queries
CREATE INDEX idx_issues_ward_id ON issues(ward_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_engineer_id ON issues(engineer_id);
CREATE INDEX idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX idx_issues_location ON issues USING GIST(location);

-- Issue logs table: Audit trail for issue changes
CREATE TABLE issue_logs (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,  -- e.g., 'created', 'assigned', 'resolved'
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create index for issue logs
CREATE INDEX idx_issue_logs_issue_id ON issue_logs(issue_id);
CREATE INDEX idx_issue_logs_timestamp ON issue_logs(timestamp DESC);

-- Function to automatically set location from latitude/longitude
CREATE OR REPLACE FUNCTION set_issue_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set location when inserting or updating issues
CREATE TRIGGER trigger_set_issue_location
BEFORE INSERT OR UPDATE ON issues
FOR EACH ROW
EXECUTE FUNCTION set_issue_location();

-- Function to find ward by coordinates
CREATE OR REPLACE FUNCTION get_ward_by_coordinates(lat DECIMAL, lng DECIMAL)
RETURNS INTEGER AS $$
DECLARE
    ward_id_result INTEGER;
BEGIN
    SELECT id INTO ward_id_result
    FROM wards
    WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
    LIMIT 1;
    
    RETURN ward_id_result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE wards IS 'Geographic boundaries of Vadodara''s 19 wards';
COMMENT ON TABLE users IS 'VMC employees: field surveyors, ward engineers, and admins';
COMMENT ON TABLE departments IS 'Departments responsible for different issue types';
COMMENT ON TABLE issues IS 'Civic issues detected and reported in the system';
COMMENT ON TABLE issue_logs IS 'Audit trail for all issue-related actions';
