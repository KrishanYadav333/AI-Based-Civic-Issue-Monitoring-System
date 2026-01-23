-- Seed data for AI-Based Civic Issue Monitoring System
-- Run this after schema.sql

-- Insert sample departments
INSERT INTO departments (name, issue_types) VALUES
    ('Roads and Infrastructure', ARRAY['pothole', 'broken_road', 'open_manhole']::TEXT[]),
    ('Sanitation and Waste Management', ARRAY['garbage', 'debris']::TEXT[]),
    ('Animal Control', ARRAY['stray_cattle']::TEXT[]);

-- Insert admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role, ward_id) VALUES
    ('Admin User', 'admin@vmc.gov.in', '$2b$10$YourHashedPasswordHere', 'admin', NULL);

-- Note: Ward boundaries need to be populated with actual GeoJSON data for Vadodara's 19 wards
-- Sample ward insertion (replace with actual boundary data)
INSERT INTO wards (name, boundary) VALUES
    ('Ward 1', ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[73.1812,22.3072],[73.1912,22.3072],[73.1912,22.2972],[73.1812,22.2972],[73.1812,22.3072]]]}'));

-- Add more wards (total 19 wards for Vadodara)
-- Ward 2-19 should be added with actual boundary data

-- Insert sample ward engineers (1 per ward)
-- Password: engineer123
INSERT INTO users (name, email, password_hash, role, ward_id) VALUES
    ('Engineer Ward 1', 'engineer1@vmc.gov.in', '$2b$10$YourHashedPasswordHere', 'engineer', 1);

-- Insert sample field surveyors
-- Password: surveyor123
INSERT INTO users (name, email, password_hash, role, ward_id) VALUES
    ('Surveyor A', 'surveyora@vmc.gov.in', '$2b$10$YourHashedPasswordHere', 'surveyor', 1),
    ('Surveyor B', 'surveyorb@vmc.gov.in', '$2b$10$YourHashedPasswordHere', 'surveyor', 1);

-- Sample issues (for testing)
-- These will be created through the API in normal operation
-- INSERT INTO issues (type, latitude, longitude, ward_id, status, priority, confidence_score, image_url, department) VALUES
--     ('pothole', 22.3072, 73.1812, 1, 'pending', 'high', 0.95, '/uploads/issue-001.jpg', 'Roads and Infrastructure');

COMMIT;
