-- Premium Features Schema Update
-- Adding support for Trust Scores, Voting, Cost Estimation, and Quality Ratings

-- 1. Updates to Users Table (Trust & Gamification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_score FLOAT DEFAULT 2.5; -- Initial neutral score
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_reports_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reports_count INTEGER DEFAULT 0;

-- 2. Updates to Issues Table (Democracy & Budgeting)
ALTER TABLE issues ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5);

-- 3. Create Upvotes Table to track who voted (Prevent spam voting)
CREATE TABLE IF NOT EXISTS issue_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- User who voted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, user_id) -- One vote per user per issue
);

CREATE INDEX IF NOT EXISTS idx_issue_votes_issue ON issue_votes(issue_id);

-- 4. Function to Auto-Update Priority based on Votes (Democracy Protocol)
CREATE OR REPLACE FUNCTION update_issue_priority_on_vote()
RETURNS TRIGGER AS $$
DECLARE
    vote_count INTEGER;
    current_priority VARCHAR;
BEGIN
    -- Get current vote count
    SELECT COUNT(*) INTO vote_count FROM issue_votes WHERE issue_id = NEW.issue_id;
    
    -- Update the upvotes counter cache on the issue table
    UPDATE issues SET upvotes = vote_count WHERE id = NEW.issue_id;
    
    -- Check if we need to escalate to Critical
    -- Rule: If > 50 votes and not already Critical/Resolved/Closed
    SELECT priority INTO current_priority FROM issues WHERE id = NEW.issue_id;
    
    IF vote_count >= 50 AND current_priority != 'critical' THEN
        UPDATE issues 
        SET priority = 'critical',
            notes = COALESCE(notes, '') || E'\n[System]: Priority auto-escalated to Critical due to high Civic Voice (50+ votes).'
        WHERE id = NEW.issue_id AND status IN ('pending', 'assigned', 'in_progress');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Democracy Protocol
DROP TRIGGER IF EXISTS trigger_update_priority_on_vote ON issue_votes;
CREATE TRIGGER trigger_update_priority_on_vote
    AFTER INSERT ON issue_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_issue_priority_on_vote();

-- 5. Function to Update User Trust Score
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Logic: If issue is RESOLVED (Valid), increment user's verified count
    -- Trust Score = (Verified / Total) * 5 (Simple heuristic for now)
    
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        UPDATE users 
        SET 
            verified_reports_count = verified_reports_count + 1,
            trust_score = (CAST((verified_reports_count + 1) AS FLOAT) / GREATEST(total_reports_count, 1)) * 5.0
        WHERE id = NEW.submitted_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trust_score ON issues;
CREATE TRIGGER trigger_update_trust_score
    AFTER UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_trust_score();

-- Comments
COMMENT ON TABLE issue_votes IS 'Tracks citizen upvotes for democracy protocol';
COMMENT ON COLUMN users.trust_score IS 'Dynamic score (0-5) based on report accuracy';
