#!/bin/bash

# Performance optimization script for Civic Issue Monitor
# This script optimizes database, applies system tuning, and configures caching

set -e

echo "=== Civic Issue Monitor Performance Optimization ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# 1. Database Optimization
echo -e "${GREEN}[1/5] Optimizing Database...${NC}"

psql -U $DB_USER -d $DB_NAME << EOF
-- Vacuum and analyze all tables
VACUUM ANALYZE;

-- Reindex all indexes
REINDEX DATABASE $DB_NAME;

-- Update table statistics
ANALYZE issues;
ANALYZE users;
ANALYZE wards;
ANALYZE departments;
ANALYZE issue_logs;

-- Create additional indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_created_at_desc ON issues(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status_priority ON issues(status, priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_ward_status ON issues(ward_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_engineer_status ON issues(assigned_engineer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issue_logs_issue_performed ON issue_logs(issue_id, performed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_location_gist ON issues USING GIST(location);

-- Optimize PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET max_worker_processes = '8';
ALTER SYSTEM SET max_parallel_workers_per_gather = '4';
ALTER SYSTEM SET max_parallel_workers = '8';
ALTER SYSTEM SET max_parallel_maintenance_workers = '4';

SELECT pg_reload_conf();
EOF

echo -e "${GREEN}Database optimization complete!${NC}"

# 2. Redis Optimization
echo -e "${GREEN}[2/5] Configuring Redis for optimal performance...${NC}"

redis-cli << EOF
CONFIG SET maxmemory 256mb
CONFIG SET maxmemory-policy allkeys-lru
CONFIG SET save ""
CONFIG REWRITE
EOF

echo -e "${GREEN}Redis configuration complete!${NC}"

# 3. System Tuning
echo -e "${GREEN}[3/5] Applying system optimizations...${NC}"

# Increase file descriptor limits
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Kernel parameter tuning
cat >> /etc/sysctl.conf << EOF
# Network optimization
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_tw_reuse = 1

# Memory and swap
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File system
fs.file-max = 2097152
EOF

sysctl -p

echo -e "${GREEN}System tuning complete!${NC}"

# 4. Node.js/Backend Optimization
echo -e "${GREEN}[4/5] Optimizing Node.js backend...${NC}"

cd backend

# Update PM2 configuration for production
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'civic-backend',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      UV_THREADPOOL_SIZE: 128
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Install and configure compression
npm install compression --save

echo -e "${GREEN}Backend optimization complete!${NC}"

# 5. Nginx Optimization
echo -e "${GREEN}[5/5] Optimizing Nginx...${NC}"

cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Caching
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    include /etc/nginx/conf.d/*.conf;
}
EOF

nginx -t && nginx -s reload

echo -e "${GREEN}Nginx optimization complete!${NC}"

# 6. Create monitoring script
cat > scripts/monitor.sh << 'EOFMON'
#!/bin/bash

# Quick system monitoring script
echo "=== System Status ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo ""
echo "=== Database Status ==="
psql -U postgres -d civic_issues -c "SELECT count(*) as total_issues, 
       count(*) FILTER (WHERE status='pending') as pending,
       count(*) FILTER (WHERE status='resolved') as resolved 
       FROM issues;"
echo ""
echo "=== Redis Status ==="
redis-cli INFO stats | grep total_commands_processed
echo ""
echo "=== Backend Status ==="
curl -s http://localhost:3000/health | jq .
EOFMON

chmod +x scripts/monitor.sh

echo ""
echo -e "${GREEN}=== Optimization Complete! ===${NC}"
echo ""
echo "Summary:"
echo "✓ Database indexes created and optimized"
echo "✓ PostgreSQL configuration tuned"
echo "✓ Redis configured for caching"
echo "✓ System parameters optimized"
echo "✓ Node.js cluster mode configured"
echo "✓ Nginx performance enhanced"
echo "✓ Monitoring script created"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart PostgreSQL: sudo systemctl restart postgresql"
echo "2. Restart services: docker-compose restart or pm2 restart all"
echo "3. Monitor performance: ./scripts/monitor.sh"
echo "4. Check logs for any issues"
echo ""
echo -e "${YELLOW}Performance tips:${NC}"
echo "- Run VACUUM ANALYZE weekly"
echo "- Monitor slow queries with pg_stat_statements"
echo "- Review Nginx access logs for traffic patterns"
echo "- Use Redis for frequently accessed data"
echo "- Enable CDN for static assets"
echo "- Consider database read replicas for high load"
