#!/usr/bin/env pwsh
# Complete Deployment Script for Windows
# Deploys the entire Civic Issue Monitoring System

param(
    [string]$Environment = "production",
    [switch]$SkipDatabase = $false,
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Civic Issue Monitoring System - Deployment" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# Change to project root
Set-Location $PROJECT_ROOT

# Check required tools
Write-Host "[1/10] Checking required tools..." -ForegroundColor Yellow
$tools = @("node", "npm", "python", "pip", "psql")
$missing = @()
foreach ($tool in $tools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        $missing += $tool
    }
}
if ($missing.Count -gt 0) {
    Write-Host "ERROR: Missing required tools: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "✓ All required tools found" -ForegroundColor Green
Write-Host ""

# Check .env files
Write-Host "[2/10] Checking environment files..." -ForegroundColor Yellow
$envFiles = @{
    "backend/.env" = "backend/.env.example"
    "ai-service/.env" = "ai-service/.env.example"
    "frontend/.env" = "frontend/.env.example"
}

foreach ($envFile in $envFiles.Keys) {
    $fullPath = Join-Path $PROJECT_ROOT $envFile
    $examplePath = Join-Path $PROJECT_ROOT $envFiles[$envFile]
    
    if (-not (Test-Path $fullPath)) {
        if (Test-Path $examplePath) {
            Write-Host "  Creating $envFile from example..." -ForegroundColor Gray
            Copy-Item $examplePath $fullPath
        } else {
            Write-Host "WARNING: $envFile not found and no example available" -ForegroundColor Yellow
        }
    }
}
Write-Host "✓ Environment files checked" -ForegroundColor Green
Write-Host ""

# Setup database
if (-not $SkipDatabase) {
    Write-Host "[3/10] Setting up database..." -ForegroundColor Yellow
    $dbScript = Join-Path $SCRIPT_DIR "setup-database.ps1"
    if (Test-Path $dbScript) {
        & $dbScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Database setup failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "WARNING: Database setup script not found" -ForegroundColor Yellow
    }
    Write-Host ""
} else {
    Write-Host "[3/10] Skipping database setup" -ForegroundColor Gray
    Write-Host ""
}

# Install backend dependencies
Write-Host "[4/10] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $PROJECT_ROOT "backend")
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Install AI service dependencies
Write-Host "[5/10] Installing AI service dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $PROJECT_ROOT "ai-service")
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: AI service dependency installation failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ AI service dependencies installed" -ForegroundColor Green
Write-Host ""

# Install frontend dependencies
Write-Host "[6/10] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $PROJECT_ROOT "frontend")
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Run tests
if (-not $SkipTests) {
    Write-Host "[7/10] Running tests..." -ForegroundColor Yellow
    
    # Backend tests
    Write-Host "  Running backend tests..." -ForegroundColor Gray
    Set-Location (Join-Path $PROJECT_ROOT "backend")
    npm test -- --passWithNoTests --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend tests passed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Backend tests failed" -ForegroundColor Yellow
    }
    
    # AI service tests
    Write-Host "  Running AI service tests..." -ForegroundColor Gray
    Set-Location (Join-Path $PROJECT_ROOT "ai-service")
    if (Test-Path "tests") {
        pytest --quiet 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ AI service tests passed" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ AI service tests failed" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✓ Tests completed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[7/10] Skipping tests" -ForegroundColor Gray
    Write-Host ""
}

# Build frontend
if (-not $SkipBuild) {
    Write-Host "[8/10] Building frontend..." -ForegroundColor Yellow
    Set-Location (Join-Path $PROJECT_ROOT "frontend")
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[8/10] Skipping frontend build" -ForegroundColor Gray
    Write-Host ""
}

# Create uploads directories
Write-Host "[9/10] Creating upload directories..." -ForegroundColor Yellow
$uploadDirs = @(
    "backend/uploads",
    "ai-service/uploads"
)
foreach ($dir in $uploadDirs) {
    $fullPath = Join-Path $PROJECT_ROOT $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}
Write-Host "✓ Upload directories ready" -ForegroundColor Green
Write-Host ""

# Final verification
Write-Host "[10/10] Verifying deployment..." -ForegroundColor Yellow
$checks = @{
    "Backend package.json" = "backend/package.json"
    "Backend index.js" = "backend/src/index.js"
    "AI service app.py" = "ai-service/app.py"
    "Frontend index.html" = "frontend/index.html"
}

$allGood = $true
foreach ($check in $checks.Keys) {
    $path = Join-Path $PROJECT_ROOT $checks[$check]
    if (Test-Path $path) {
        Write-Host "  ✓ $check" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $check missing" -ForegroundColor Red
        $allGood = $false
    }
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "ERROR: Deployment verification failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Print deployment summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Backend API:     http://localhost:3000" -ForegroundColor White
Write-Host "  AI Service:      http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "To start services:" -ForegroundColor Cyan
Write-Host "  Backend:  cd backend && npm start" -ForegroundColor White
Write-Host "  AI:       cd ai-service && python app.py" -ForegroundColor White
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or use Docker Compose:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "API Documentation: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "Health Check:      http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
