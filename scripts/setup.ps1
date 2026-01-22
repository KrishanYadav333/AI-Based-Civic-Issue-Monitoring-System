# Setup Script for Windows
# PowerShell version of setup.sh

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Civic Issue Monitoring System" -ForegroundColor Cyan
Write-Host "Automated Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version
        Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
        exit 1
    }
    
    # Check Python
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $pythonVersion = python --version
        Write-Host "✓ $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Python is not installed. Please install Python 3.8+ first." -ForegroundColor Red
        exit 1
    }
    
    # Check PostgreSQL
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Write-Host "✓ PostgreSQL installed" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not installed. Please install PostgreSQL 12+ with PostGIS." -ForegroundColor Red
        exit 1
    }
    
    # Check Docker (optional)
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $dockerVersion = docker --version
        Write-Host "✓ $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ Docker not found (optional)" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Setup environment files
function Setup-Environment {
    Write-Host "Setting up environment variables..." -ForegroundColor Yellow
    
    # Generate random secrets
    $JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $DB_PASSWORD = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})
    
    # Backend .env
    if (-not (Test-Path "backend\.env")) {
        Copy-Item "backend\.env.example" "backend\.env"
        (Get-Content "backend\.env") -replace 'your_password_here', $DB_PASSWORD | Set-Content "backend\.env"
        (Get-Content "backend\.env") -replace 'your_super_secret_jwt_key_change_this_in_production', $JWT_SECRET | Set-Content "backend\.env"
        Write-Host "✓ Backend .env created" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend .env already exists, skipping" -ForegroundColor Yellow
    }
    
    # AI Service .env
    if (-not (Test-Path "ai-service\.env")) {
        Copy-Item "ai-service\.env.example" "ai-service\.env"
        Write-Host "✓ AI Service .env created" -ForegroundColor Green
    } else {
        Write-Host "⚠ AI Service .env already exists, skipping" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Create necessary directories
function New-Directories {
    Write-Host "Creating necessary directories..." -ForegroundColor Yellow
    
    New-Item -ItemType Directory -Force -Path "backend\uploads" | Out-Null
    New-Item -ItemType Directory -Force -Path "backend\logs" | Out-Null
    New-Item -ItemType Directory -Force -Path "ai-service\models" | Out-Null
    New-Item -ItemType Directory -Force -Path "backups" | Out-Null
    
    Write-Host "✓ Directories created" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    # Backend
    Write-Host "Installing backend dependencies..."
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    
    # Frontend
    Write-Host "Installing frontend dependencies..."
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    
    # Mobile App
    Write-Host "Installing mobile app dependencies..."
    Set-Location mobile-app
    npm install
    Set-Location ..
    Write-Host "✓ Mobile app dependencies installed" -ForegroundColor Green
    
    # AI Service
    Write-Host "Installing AI service dependencies..."
    Set-Location ai-service
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    deactivate
    Set-Location ..
    Write-Host "✓ AI service dependencies installed" -ForegroundColor Green
    
    Write-Host ""
}

# Setup database
function Initialize-Database {
    Write-Host "Setting up database..." -ForegroundColor Yellow
    
    $DB_USER = Read-Host "Enter PostgreSQL username [postgres]"
    if ([string]::IsNullOrWhiteSpace($DB_USER)) {
        $DB_USER = "postgres"
    }
    
    $DB_PASS = Read-Host "Enter PostgreSQL password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASS)
    $PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $env:PGPASSWORD = $PlainPassword
    
    # Create database
    Write-Host "Creating database..."
    psql -U $DB_USER -h localhost -c "CREATE DATABASE civic_issues;" 2>$null
    
    # Enable PostGIS
    psql -U $DB_USER -h localhost -d civic_issues -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    
    # Run schema
    Write-Host "Creating database schema..."
    psql -U $DB_USER -h localhost -d civic_issues -f database\schema.sql
    
    # Run seed data
    Write-Host "Inserting seed data..."
    psql -U $DB_USER -h localhost -d civic_issues -f database\seed_data.sql
    
    Write-Host "✓ Database setup completed" -ForegroundColor Green
    Write-Host ""
}

# Setup complete message
function Setup-Complete {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Setup completed successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start the backend server:"
    Write-Host "   cd backend; npm run dev"
    Write-Host ""
    Write-Host "2. Start the AI service:"
    Write-Host "   cd ai-service; .\venv\Scripts\Activate.ps1; python app.py"
    Write-Host ""
    Write-Host "3. Start the frontend:"
    Write-Host "   cd frontend; npm run dev"
    Write-Host ""
    Write-Host "4. Start the mobile app:"
    Write-Host "   cd mobile-app; npx expo start"
    Write-Host ""
    Write-Host "Or use Docker:"
    Write-Host "   docker-compose up -d"
    Write-Host ""
    Write-Host "Access the application:" -ForegroundColor Yellow
    Write-Host "- Frontend: http://localhost:3001"
    Write-Host "- Backend API: http://localhost:3000"
    Write-Host "- API Documentation: http://localhost:3000/api-docs"
    Write-Host "- AI Service: http://localhost:5000"
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
}

# Main execution
Check-Prerequisites
Setup-Environment
Create-Directories
Install-Dependencies

$setupDB = Read-Host "Do you want to setup the database now? (yes/no)"
if ($setupDB -eq "yes") {
    Setup-Database
}

Setup-Complete
