-- Test Data for Unit Testing

-- Insert test wards
INSERT INTO wards (id, name, boundary_json) VALUES 
(1, 'Ward 1 - Sayajigunj', '{"type":"Polygon","coordinates":[[[73.18,22.31],[73.19,22.31],[73.19,22.32],[73.18,22.32],[73.18,22.31]]]}'),
(2, 'Ward 2 - Alkapuri', '{"type":"Polygon","coordinates":[[[73.17,22.30],[73.18,22.30],[73.18,22.31],[73.17,22.31],[73.17,22.30]]]}'),
(3, 'Ward 3 - Manjalpur', '{"type":"Polygon","coordinates":[[[73.19,22.29],[73.20,22.29],[73.20,22.30],[73.19,22.30],[73.19,22.29]]]}');

-- Reset sequence
SELECT setval('wards_id_seq', 3, true);

-- Insert departments
INSERT INTO departments (id, name, description, issue_types) VALUES
(1, 'Roads', 'Road maintenance and repair', ARRAY['pothole', 'broken_road']),
(2, 'Sanitation', 'Garbage collection and cleanup', ARRAY['garbage', 'debris']),
(3, 'Drainage', 'Drainage and sewage management', ARRAY['open_manhole']),
(4, 'Animal Control', 'Stray animal management', ARRAY['stray_cattle']);

-- Reset sequence
SELECT setval('departments_id_seq', 4, true);
