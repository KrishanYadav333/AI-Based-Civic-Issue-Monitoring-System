-- Test Database Schema (Without PostGIS)
-- Simplified version for unit testing without spatial dependencies

-- Drop existing tables if they exist
DROP TABLE IF EXISTS issue_logs CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS wards CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('surveyor', 'engineer', 'admin');
CREATE TYPE issue_type AS ENUM ('pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole', 'other');
CREATE TYPE issue_status AS ENUM ('pending', 'assigned', 'resolved');
CREATE TYPE issue_priority AS ENUM ('high', 'medium', 'low');

-- Wards table: Stores ward information (without GEOMETRY)
CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boundary_json TEXT,  -- Store GeoJSON as text for testing
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users table: VMC employees (surveyors, engineers, admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Changed to match production schema
    role user_role NOT NULL,
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
    department_id INTEGER,
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
    description TEXT,
    issue_types TEXT[]  -- Array of issue types handled by this department
);

-- Issues table: Civic issues reported by surveyors
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    surveyor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    engineer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ward_id INTEGER REFERENCES wards(id) ON DELETE SET NULL,
    department VARCHAR(255),
    type issue_type NOT NULL,  -- Changed from issue_type to match routes
    priority issue_priority DEFAULT 'medium',
    status issue_status DEFAULT 'pending',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url TEXT,
    resolution_image_url TEXT,
    description TEXT,
    confidence_score DECIMAL(5, 2),  -- Changed from ai_confidence
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for issues
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_ward_id ON issues(ward_id);
CREATE INDEX idx_issues_engineer_id ON issues(engineer_id);
CREATE INDEX idx_issues_created_at ON issues(created_at);

-- Issue logs table: Audit trail for issue changes
CREATE TABLE issue_logs (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    notes TEXT,  -- Changed from details
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issue_logs_issue_id ON issue_logs(issue_id);
CREATE INDEX idx_issue_logs_created_at ON issue_logs(created_at);

-- Mock function for geo-fencing (without PostGIS)
CREATE OR REPLACE FUNCTION get_ward_by_coordinates(lat DECIMAL, lng DECIMAL) 
RETURNS INTEGER AS $$
BEGIN
    -- Simple mock: return ward 1 for testing
    -- In production, this would use ST_Contains with PostGIS
    RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
