-- Additional database optimizations and new features

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    notification_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'issue_assigned', 'issue_resolved', 'high_priority', 'sla_breach'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    issue_id INTEGER REFERENCES issues(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue escalation rules
CREATE TABLE IF NOT EXISTS escalation_rules (
    id SERIAL PRIMARY KEY,
    priority VARCHAR(20) NOT NULL,
    hours_threshold INTEGER NOT NULL,
    escalate_to_role VARCHAR(50) NOT NULL,
    notification_template TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default escalation rules
INSERT INTO escalation_rules (priority, hours_threshold, escalate_to_role, notification_template) VALUES
('high', 4, 'admin', 'High priority issue #{issue_id} not resolved within 4 hours'),
('medium', 24, 'admin', 'Medium priority issue #{issue_id} not resolved within 24 hours'),
('low', 72, 'admin', 'Low priority issue #{issue_id} not resolved within 72 hours')
ON CONFLICT DO NOTHING;

-- Issue templates table
CREATE TABLE IF NOT EXISTS issue_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issue_type issue_type NOT NULL,
    description_template TEXT,
    priority issue_priority DEFAULT 'medium',
    estimated_resolution_hours INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- SLA tracking
CREATE TABLE IF NOT EXISTS issue_sla (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER UNIQUE REFERENCES issues(id) ON DELETE CASCADE,
    sla_hours INTEGER NOT NULL,
    due_at TIMESTAMP NOT NULL,
    breached BOOLEAN DEFAULT false,
    breach_hours INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Citizen feedback (QR code scan)
CREATE TABLE IF NOT EXISTS citizen_feedback (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    location_verified BOOLEAN,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue attachments (multiple images)
CREATE TABLE IF NOT EXISTS issue_attachments (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Ward performance metrics (materialized view for faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS ward_performance_summary AS
SELECT 
    w.id as ward_id,
    w.name as ward_name,
    COUNT(i.id) as total_issues,
    COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_issues,
    COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_issues,
    COUNT(CASE WHEN i.priority = 'high' THEN 1 END) as high_priority_issues,
    ROUND(AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600)::numeric, 2) as avg_resolution_hours,
    COUNT(CASE WHEN sla.breached THEN 1 END) as sla_breaches
FROM wards w
LEFT JOIN issues i ON w.id = i.ward_id
LEFT JOIN issue_sla sla ON i.id = sla.issue_id
GROUP BY w.id, w.name;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_attachments_issue ON issue_attachments(issue_id);
CREATE INDEX IF NOT EXISTS idx_citizen_feedback_issue ON citizen_feedback(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_sla_due ON issue_sla(due_at) WHERE NOT breached;

-- Function to auto-create SLA for new issues
CREATE OR REPLACE FUNCTION create_issue_sla()
RETURNS TRIGGER AS $$
DECLARE
    sla_hours INTEGER;
BEGIN
    -- Set SLA based on priority
    sla_hours := CASE NEW.priority
        WHEN 'high' THEN 4
        WHEN 'medium' THEN 24
        WHEN 'low' THEN 72
        ELSE 48
    END;
    
    INSERT INTO issue_sla (issue_id, sla_hours, due_at)
    VALUES (NEW.id, sla_hours, NEW.created_at + (sla_hours || ' hours')::INTERVAL);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SLA creation
DROP TRIGGER IF EXISTS trigger_create_issue_sla ON issues;
CREATE TRIGGER trigger_create_issue_sla
    AFTER INSERT ON issues
    FOR EACH ROW
    EXECUTE FUNCTION create_issue_sla();

-- Function to check SLA breaches
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS void AS $$
BEGIN
    UPDATE issue_sla
    SET breached = true,
        breach_hours = EXTRACT(EPOCH FROM (NOW() - due_at))/3600
    WHERE due_at < NOW() 
    AND NOT breached
    AND EXISTS (
        SELECT 1 FROM issues 
        WHERE issues.id = issue_sla.issue_id 
        AND issues.status != 'resolved'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to refresh ward performance summary
CREATE OR REPLACE FUNCTION refresh_ward_performance()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY ward_performance_summary;
END;
$$ LANGUAGE plpgsql;

-- Add description field to issues for better context
ALTER TABLE issues ADD COLUMN IF NOT EXISTS description TEXT;

-- Add resolution time tracking
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_time_hours DECIMAL(10,2);

-- Update resolution time when issue is resolved
CREATE OR REPLACE FUNCTION update_resolution_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolution_time_hours := EXTRACT(EPOCH FROM (NOW() - NEW.created_at))/3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_resolution_time ON issues;
CREATE TRIGGER trigger_update_resolution_time
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_resolution_time();

-- Comments
COMMENT ON TABLE notification_preferences IS 'User notification preferences for email, push, and SMS';
COMMENT ON TABLE notifications IS 'In-app notification history for users';
COMMENT ON TABLE escalation_rules IS 'Automatic escalation rules based on priority and time';
COMMENT ON TABLE issue_sla IS 'SLA tracking for issues with breach detection';
COMMENT ON TABLE citizen_feedback IS 'Public feedback on resolved issues via QR code';
COMMENT ON TABLE user_activity IS 'Audit log for user actions';
COMMENT ON MATERIALIZED VIEW ward_performance_summary IS 'Pre-computed ward statistics for fast dashboard queries';
