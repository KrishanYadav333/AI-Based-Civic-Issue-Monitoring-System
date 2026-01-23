#!/bin/bash
# Database Setup Script for Linux/Mac
# Sets up PostgreSQL database with PostGIS for Civic Issue Monitoring System

set -e

echo "================================"
echo "Database Setup Script"
echo "================================"
echo ""

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="civic_issues"
DB_TEST_NAME="civic_issues_test"

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo "  Test Database: $DB_TEST_NAME"
echo ""

# Check if PostgreSQL is installed
echo "[1/6] Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL 'psql' not found in PATH"
    echo "Please install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  Mac: brew install postgresql"
    exit 1
fi
echo "✓ PostgreSQL found at: $(which psql)"
echo ""

# Set password environment variable
export PGPASSWORD=$DB_PASSWORD

# Test database connection
echo "[2/6] Testing PostgreSQL connection..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    echo "ERROR: Cannot connect to PostgreSQL"
    echo "Please check your PostgreSQL installation and credentials"
    exit 1
fi
echo "✓ PostgreSQL connection successful"
echo ""

# Check if PostGIS is available
echo "[3/6] Checking PostGIS extension..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT * FROM pg_available_extensions WHERE name='postgis';" | grep -q "postgis"; then
    echo "✓ PostGIS extension is available"
else
    echo "WARNING: PostGIS extension not found"
    echo "Install PostGIS:"
    echo "  Ubuntu/Debian: sudo apt-get install postgis postgresql-{version}-postgis-3"
    echo "  Mac: brew install postgis"
fi
echo ""

# Drop and recreate databases
echo "[4/6] Setting up databases..."
echo "  Dropping existing databases (if any)..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1 || true
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_TEST_NAME;" > /dev/null 2>&1 || true

echo "  Creating main database: $DB_NAME..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1

echo "  Creating test database: $DB_TEST_NAME..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_TEST_NAME;" > /dev/null 2>&1
echo "✓ Databases created successfully"
echo ""

# Run schema initialization
echo "[5/6] Initializing database schema..."
SCHEMA_FILE="$(dirname "$0")/../backend/database/schema.sql"
if [ -f "$SCHEMA_FILE" ]; then
    echo "  Loading schema from: $SCHEMA_FILE"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCHEMA_FILE" > /dev/null 2>&1
    
    # Also load schema to test database
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_TEST_NAME -f "$SCHEMA_FILE" > /dev/null 2>&1
    echo "✓ Schema loaded successfully"
else
    echo "WARNING: Schema file not found at: $SCHEMA_FILE"
fi
echo ""

# Run seed data
echo "[6/6] Loading seed data..."
SEED_FILE="$(dirname "$0")/../backend/database/seed.sql"
if [ -f "$SEED_FILE" ]; then
    echo "  Loading seed data from: $SEED_FILE"
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SEED_FILE" > /dev/null 2>&1; then
        echo "✓ Seed data loaded successfully"
    else
        echo "WARNING: Some seed data may have failed to load"
    fi
else
    echo "INFO: No seed data file found (optional)"
fi
echo ""

# Verify setup
echo "Verifying setup..."
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables created: $(echo $TABLE_COUNT | xargs)"

ISSUE_TYPES_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM issue_types;")
echo "  Issue types: $(echo $ISSUE_TYPES_COUNT | xargs)"

WARDS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM wards;")
echo "  Wards: $(echo $WARDS_COUNT | xargs)"

echo ""
echo "================================"
echo "✓ Database Setup Complete!"
echo "================================"
echo ""
echo "Database Credentials:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Test Database: $DB_TEST_NAME"
echo "  Username: $DB_USER"
echo ""
echo "Next Steps:"
echo "  1. Update .env file with database credentials"
echo "  2. Run 'cd backend && npm install && npm start'"
echo "  3. Run 'cd ai-service && pip install -r requirements.txt && python app.py'"
echo "  4. Run 'cd frontend && npm install && npm run dev'"
echo ""
