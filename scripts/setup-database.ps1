#!/usr/bin/env pwsh
# Database Setup Script for Windows
# Sets up PostgreSQL database with PostGIS for Civic Issue Monitoring System

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Database Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }
$DB_NAME = "civic_issues"
$DB_TEST_NAME = "civic_issues_test"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Port: $DB_PORT" -ForegroundColor Gray
Write-Host "  User: $DB_USER" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  Test Database: $DB_TEST_NAME" -ForegroundColor Gray
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "[1/6] Checking PostgreSQL installation..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL 'psql' not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL found at: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Test database connection
Write-Host "[2/6] Testing PostgreSQL connection..." -ForegroundColor Yellow
$testConnection = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT version();" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $testConnection" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL installation and credentials" -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL connection successful" -ForegroundColor Green
Write-Host ""

# Check if PostGIS is available
Write-Host "[3/6] Checking PostGIS extension..." -ForegroundColor Yellow
$postgisCheck = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT * FROM pg_available_extensions WHERE name='postgis';" -t 2>&1
if ($postgisCheck -match "postgis") {
    Write-Host "✓ PostGIS extension is available" -ForegroundColor Green
} else {
    Write-Host "WARNING: PostGIS extension not found" -ForegroundColor Yellow
    Write-Host "Install PostGIS from: https://postgis.net/install/" -ForegroundColor Yellow
}
Write-Host ""

# Drop and recreate databases
Write-Host "[4/6] Setting up databases..." -ForegroundColor Yellow
Write-Host "  Dropping existing databases (if any)..." -ForegroundColor Gray
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1 | Out-Null
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_TEST_NAME;" 2>&1 | Out-Null

Write-Host "  Creating main database: $DB_NAME..." -ForegroundColor Gray
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database $DB_NAME" -ForegroundColor Red
    exit 1
}

Write-Host "  Creating test database: $DB_TEST_NAME..." -ForegroundColor Gray
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_TEST_NAME;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create database $DB_TEST_NAME" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Databases created successfully" -ForegroundColor Green
Write-Host ""

# Run schema initialization
Write-Host "[5/6] Initializing database schema..." -ForegroundColor Yellow
$schemaFile = Join-Path $PSScriptRoot ".." "backend" "database" "schema.sql"
if (Test-Path $schemaFile) {
    Write-Host "  Loading schema from: $schemaFile" -ForegroundColor Gray
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $schemaFile 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to load schema" -ForegroundColor Red
        exit 1
    }
    
    # Also load schema to test database
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_TEST_NAME -f $schemaFile 2>&1 | Out-Null
    Write-Host "✓ Schema loaded successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: Schema file not found at: $schemaFile" -ForegroundColor Yellow
}
Write-Host ""

# Run seed data
Write-Host "[6/6] Loading seed data..." -ForegroundColor Yellow
$seedFile = Join-Path $PSScriptRoot ".." "backend" "database" "seed.sql"
if (Test-Path $seedFile) {
    Write-Host "  Loading seed data from: $seedFile" -ForegroundColor Gray
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $seedFile 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Seed data loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Some seed data may have failed to load" -ForegroundColor Yellow
    }
} else {
    Write-Host "INFO: No seed data file found (optional)" -ForegroundColor Gray
}
Write-Host ""

# Verify setup
Write-Host "Verifying setup..." -ForegroundColor Yellow
$tableCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
Write-Host "  Tables created: $($tableCount.Trim())" -ForegroundColor Gray

$issueTypesCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM issue_types;" 2>&1
Write-Host "  Issue types: $($issueTypesCount.Trim())" -ForegroundColor Gray

$wardsCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM wards;" 2>&1
Write-Host "  Wards: $($wardsCount.Trim())" -ForegroundColor Gray

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ Database Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database Credentials:" -ForegroundColor Cyan
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  Test Database: $DB_TEST_NAME" -ForegroundColor White
Write-Host "  Username: $DB_USER" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Update .env file with database credentials" -ForegroundColor White
Write-Host "  2. Run 'cd backend && npm install && npm start'" -ForegroundColor White
Write-Host "  3. Run 'cd ai-service && pip install -r requirements.txt && python app.py'" -ForegroundColor White
Write-Host "  4. Run 'cd frontend && npm install && npm run dev'" -ForegroundColor White
Write-Host ""
