-- Database initialization script
-- Run this after schema.sql to set up development environment

-- ============================================
-- DEVELOPMENT WARD BOUNDARIES
-- Sample ward boundaries for Vadodara
-- Replace with actual VMC ward boundaries
-- ============================================

INSERT INTO wards (ward_number, ward_name, boundary, centroid, area_sqkm, population, department) VALUES
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
),
(4, 'Ward 4 - Raopura', 
    ST_GeomFromText('POLYGON((73.16 22.30, 73.18 22.30, 73.18 22.28, 73.16 22.28, 73.16 22.30))', 4326),
    ST_SetSRID(ST_MakePoint(73.17, 22.29), 4326),
    3.5,
    42000,
    'Drainage'
);

-- ============================================
-- DEVELOPMENT USERS
-- ============================================

-- Sample surveyors
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('surveyor1', 'surveyor1@vmc.gov.in', '$2b$10$demoHashForDevelopment123', 'Rajesh Kumar', '9876543211', 'surveyor'),
('surveyor2', 'surveyor2@vmc.gov.in', '$2b$10$demoHashForDevelopment123', 'Priya Sharma', '9876543212', 'surveyor');

-- Sample engineers (one per ward)
INSERT INTO users (username, email, password_hash, full_name, phone, role, ward_id) VALUES
('engineer1', 'engineer1@vmc.gov.in', '$2b$10$demoHashForDevelopment123', 'Amit Patel', '9876543213', 'engineer', 
    (SELECT id FROM wards WHERE ward_number = 1)),
('engineer2', 'engineer2@vmc.gov.in', '$2b$10$demoHashForDevelopment123', 'Neha Desai', '9876543214', 'engineer',
    (SELECT id FROM wards WHERE ward_number = 2)),
('engineer3', 'engineer3@vmc.gov.in', '$2b$10$demoHashForDevelopment123', 'Suresh Mehta', '9876543215', 'engineer',
    (SELECT id FROM wards WHERE ward_number = 3));

-- ============================================
-- SAMPLE ISSUES FOR TESTING
-- ============================================

-- Insert sample issues for development
INSERT INTO issues (
    location, latitude, longitude, ward_id, address,
    issue_type_id, issue_type_code, department,
    priority, status, image_url,
    submitted_by, ai_confidence, description
) VALUES
(
    ST_SetSRID(ST_MakePoint(73.18, 22.30), 4326),
    22.30, 73.18,
    (SELECT id FROM wards WHERE ward_number = 1),
    'Near Alkapuri Garden',
    (SELECT id FROM issue_types WHERE code = 'pothole'),
    'pothole', 'Roads',
    'high', 'pending',
    '/uploads/sample_pothole.jpg',
    (SELECT id FROM users WHERE username = 'surveyor1'),
    0.89,
    'Large pothole on main road causing traffic issues'
),
(
    ST_SetSRID(ST_MakePoint(73.19, 22.30), 4326),
    22.30, 73.19,
    (SELECT id FROM wards WHERE ward_number = 2),
    'Sayajigunj Market Area',
    (SELECT id FROM issue_types WHERE code = 'garbage'),
    'garbage', 'Sanitation',
    'medium', 'assigned',
    '/uploads/sample_garbage.jpg',
    (SELECT id FROM users WHERE username = 'surveyor1'),
    0.92,
    'Garbage accumulation near market'
);

-- ============================================
-- HELPER QUERIES FOR DEVELOPMENT
-- ============================================

-- Query to test geo-fencing
-- SELECT get_ward_from_coordinates(22.30, 73.18);

-- Query to test duplicate detection
-- SELECT * FROM check_duplicate_issue(22.30, 73.18, 'pothole', CURRENT_TIMESTAMP);

-- Query to view all issues with ward names
-- SELECT 
--     i.issue_number,
--     i.issue_type_code,
--     i.priority,
--     i.status,
--     w.ward_name,
--     u.full_name as submitted_by
-- FROM issues i
-- JOIN wards w ON i.ward_id = w.id
-- JOIN users u ON i.submitted_by = u.id;

COMMENT ON DATABASE civic_monitoring IS 'AI-Based Civic Issue Monitoring System - 100% Free Stack (PostgreSQL + PostGIS)';
