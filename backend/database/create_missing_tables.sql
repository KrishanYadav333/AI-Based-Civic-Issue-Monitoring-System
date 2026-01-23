-- Missing Tables Migration
-- Creates issue_history and notifications tables

-- Issue History Table
CREATE TABLE IF NOT EXISTS issue_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    status VARCHAR(50),
    changed_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_issue_history_issue ON issue_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_created ON issue_history(created_at);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    issue_id UUID REFERENCES issues(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_issue ON notifications(issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Issue Votes Table (if not exists from premium migration)
CREATE TABLE IF NOT EXISTS issue_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_issue_votes_issue ON issue_votes(issue_id);

COMMENT ON TABLE issue_history IS 'Tracks status changes and actions on issues';
COMMENT ON TABLE notifications IS 'User notifications for issue updates';
COMMENT ON TABLE issue_votes IS 'Civic Voice voting records';
