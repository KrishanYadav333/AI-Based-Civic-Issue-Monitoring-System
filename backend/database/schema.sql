-- Database Schema for AI-Based Civic Issue Monitoring System
-- PostgreSQL + PostGIS (100% FREE STACK)

-- Enable PostGIS extension for spatial queries
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
    boundary GEOMETRY(POLYGON, 4326) NOT NULL, -- PostGIS geometry for geo-fencing
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
    
    -- Images
    image_url VARCHAR(500) NOT NULL,
    resolution_image_url VARCHAR(500),
    
    -- Relationships
    submitted_by UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    
    -- Notes and description
    description TEXT,
    notes TEXT,
    resolution_notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Metadata
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES issues(id),
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issues_location ON issues USING GIST(location);
CREATE INDEX idx_issues_ward ON issues(ward_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_priority ON issues(priority);
CREATE INDEX idx_issues_type ON issues(issue_type_id);
CREATE INDEX idx_issues_submitted_by ON issues(submitted_by);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_issues_submitted_at ON issues(submitted_at);
CREATE INDEX idx_issues_number ON issues(issue_number);

-- ============================================
-- ISSUE HISTORY TABLE
-- ============================================
CREATE TABLE issue_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_assigned_to UUID,
    new_assigned_to UUID,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_history_issue ON issue_history(issue_id);
CREATE INDEX idx_issue_history_created ON issue_history(created_at);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    issue_id UUID REFERENCES issues(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_issue ON notifications(issue_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- ANALYTICS / METRICS TABLE
-- ============================================
CREATE TABLE issue_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) UNIQUE,
    
    -- Time metrics (in minutes)
    time_to_assign INTEGER,
    time_to_start INTEGER,
    time_to_resolve INTEGER,
    time_to_close INTEGER,
    
    -- Resolution time
    total_resolution_time INTEGER,
    
    -- SLA compliance
    sla_target_minutes INTEGER,
    sla_breached BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_issue_metrics_issue ON issue_metrics(issue_id);
CREATE INDEX idx_issue_metrics_sla ON issue_metrics(sla_breached);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get ward from coordinates using PostGIS
CREATE OR REPLACE FUNCTION get_ward_from_coordinates(lat DECIMAL, lng DECIMAL)
RETURNS UUID AS $$
DECLARE
    ward_uuid UUID;
BEGIN
    SELECT id INTO ward_uuid
    FROM wards
    WHERE ST_Contains(
        boundary,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    );
    
    RETURN ward_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check for duplicate issues (within 100m radius, 1 hour, same type)
CREATE OR REPLACE FUNCTION check_duplicate_issue(
    lat DECIMAL,
    lng DECIMAL,
    issue_type VARCHAR,
    submission_time TIMESTAMP
)
RETURNS TABLE(issue_id UUID, distance_meters DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        ST_Distance(
            i.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
        ) AS distance
    FROM issues i
    WHERE i.issue_type_code = issue_type
        AND i.submitted_at > (submission_time - INTERVAL '1 hour')
        AND ST_DWithin(
            i.location::geography,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            100  -- 100 meters radius
        )
    ORDER BY distance
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique issue number
CREATE OR REPLACE FUNCTION generate_issue_number()
RETURNS VARCHAR AS $$
DECLARE
    issue_num VARCHAR;
    year_part VARCHAR;
    seq_part INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(issue_number FROM 10) AS INTEGER)), 0) + 1
    INTO seq_part
    FROM issues
    WHERE issue_number LIKE 'VMC' || year_part || '%';
    
    issue_num := 'VMC' || year_part || LPAD(seq_part::TEXT, 6, '0');
    
    RETURN issue_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate issue number
CREATE OR REPLACE FUNCTION set_issue_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.issue_number IS NULL OR NEW.issue_number = '' THEN
        NEW.issue_number := generate_issue_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_issue_number
    BEFORE INSERT ON issues
    FOR EACH ROW
    EXECUTE FUNCTION set_issue_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_wards_updated_at
    BEFORE UPDATE ON wards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View for ward-wise statistics
CREATE OR REPLACE VIEW ward_statistics AS
SELECT 
    w.id AS ward_id,
    w.ward_number,
    w.ward_name,
    COUNT(i.id) AS total_issues,
    COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) AS resolved_issues,
    COUNT(CASE WHEN i.status = 'pending' THEN 1 END) AS pending_issues,
    COUNT(CASE WHEN i.priority = 'high' OR i.priority = 'critical' THEN 1 END) AS high_priority_issues,
    AVG(m.total_resolution_time) AS avg_resolution_time_minutes
FROM wards w
LEFT JOIN issues i ON i.ward_id = w.id
LEFT JOIN issue_metrics m ON m.issue_id = i.id
GROUP BY w.id, w.ward_number, w.ward_name;

-- View for engineer performance
CREATE OR REPLACE VIEW engineer_performance AS
SELECT 
    u.id AS engineer_id,
    u.full_name AS engineer_name,
    u.ward_id,
    COUNT(i.id) AS total_assigned,
    COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN i.status = 'in_progress' THEN 1 END) AS in_progress_count,
    AVG(m.total_resolution_time) AS avg_resolution_time_minutes,
    COUNT(CASE WHEN m.sla_breached = true THEN 1 END) AS sla_breaches
FROM users u
LEFT JOIN issues i ON i.assigned_to = u.id
LEFT JOIN issue_metrics m ON m.issue_id = i.id
WHERE u.role = 'engineer'
GROUP BY u.id, u.full_name, u.ward_id;

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Sample ward (you'll need to add real ward boundaries)
INSERT INTO wards (ward_number, ward_name, boundary, centroid, area_sqkm, population, department) VALUES
(1, 'Ward 1 - Alkapuri', 
    ST_GeomFromText('POLYGON((73.17 22.31, 73.19 22.31, 73.19 22.29, 73.17 22.29, 73.17 22.31))', 4326),
    ST_SetSRID(ST_MakePoint(73.18, 22.30), 4326),
    5.2,
    45000,
    'Roads'
);

-- Sample admin user (password: admin123 - bcrypt hash)
INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES
('admin', 'admin@vmc.gov.in', '$2b$10$YourBcryptHashHere', 'Admin User', '9876543210', 'admin');

COMMENT ON TABLE issues IS 'Main table for civic issues with PostGIS location data';
COMMENT ON COLUMN issues.location IS 'PostGIS POINT geometry for spatial queries';
COMMENT ON FUNCTION get_ward_from_coordinates IS 'Returns ward UUID from lat/lng using ST_Contains';
COMMENT ON FUNCTION check_duplicate_issue IS 'Finds potential duplicate issues within 100m and 1 hour';
