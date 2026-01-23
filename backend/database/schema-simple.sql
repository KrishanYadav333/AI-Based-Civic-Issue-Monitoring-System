-- Simplified Database Schema (No PostGIS Required)
-- For Development and Testing

-- ============================================
-- WARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_number INTEGER UNIQUE NOT NULL,
    ward_name VARCHAR(255) NOT NULL,
    boundary_json JSONB,
    centroid_lat DECIMAL(10, 8),
    centroid_lng DECIMAL(11, 8),
    area_sqkm DECIMAL(10, 2),
    population INTEGER,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wards_number ON wards(ward_number);

-- ============================================
-- ISSUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Location data
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

CREATE INDEX IF NOT EXISTS idx_issues_ward ON issues(ward_id);
CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(issue_type_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_engineer ON issues(engineer_id);
CREATE INDEX IF NOT EXISTS idx_issues_surveyor ON issues(surveyor_id);
CREATE INDEX IF NOT EXISTS idx_issues_created ON issues(created_at);

-- ============================================
-- ISSUE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issue_logs_issue ON issue_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_logs_created ON issue_logs(created_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get ward by coordinates (simple bounding box check)
CREATE OR REPLACE FUNCTION get_ward_by_coordinates(lat DECIMAL, lng DECIMAL)
RETURNS UUID AS $$
DECLARE
    ward_uuid UUID;
BEGIN
    -- Simple implementation: find closest ward by centroid
    SELECT id INTO ward_uuid
    FROM wards
    WHERE centroid_lat IS NOT NULL AND centroid_lng IS NOT NULL
    ORDER BY (
        (centroid_lat - lat) * (centroid_lat - lat) +
        (centroid_lng - lng) * (centroid_lng - lng)
    )
    LIMIT 1;
    
    RETURN ward_uuid;
END;
$$ LANGUAGE plpgsql;
