-- Add table for FCM device tokens
CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    fcm_token TEXT,
    platform VARCHAR(20) CHECK (platform IN ('android', 'ios', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX idx_user_devices_fcm_token ON user_devices(fcm_token);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_device_timestamp
    BEFORE UPDATE ON user_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_user_device_timestamp();

-- Add spatial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_location_gist ON issues USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_wards_boundary_gist ON wards USING GIST(boundary);

-- Create materialized view for geospatial analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS issue_density_grid AS
WITH grid AS (
    SELECT 
        generate_series(
            FLOOR((ST_XMin(ST_Extent(boundary)))::numeric * 100) / 100,
            CEIL((ST_XMax(ST_Extent(boundary)))::numeric * 100) / 100,
            0.01
        ) as lng,
        generate_series(
            FLOOR((ST_YMin(ST_Extent(boundary)))::numeric * 100) / 100,
            CEIL((ST_YMax(ST_Extent(boundary)))::numeric * 100) / 100,
            0.01
        ) as lat
    FROM wards
)
SELECT 
    g.lng,
    g.lat,
    ST_MakePoint(g.lng, g.lat) as grid_point,
    COUNT(i.id) as issue_count,
    JSON_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL) as issue_types
FROM grid g
LEFT JOIN issues i ON ST_DWithin(
    ST_SetSRID(ST_MakePoint(g.lng, g.lat), 4326)::geography,
    i.location,
    500  -- 500 meters radius
)
WHERE i.created_at >= NOW() - INTERVAL '30 days'
GROUP BY g.lng, g.lat
HAVING COUNT(i.id) > 0;

CREATE INDEX idx_issue_density_grid_point ON issue_density_grid USING GIST(grid_point);

-- Function to refresh density grid
CREATE OR REPLACE FUNCTION refresh_issue_density_grid()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY issue_density_grid;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily refresh (requires pg_cron extension)
-- SELECT cron.schedule('refresh-density-grid', '0 2 * * *', 'SELECT refresh_issue_density_grid()');
