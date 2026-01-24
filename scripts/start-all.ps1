#!/usr/bin/env pwsh
# Start All Services Script (Windows PowerShell)
# Starts MongoDB, Backend, AI Service, and Frontend

Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "  Starting Civic Issue Monitoring System`n" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.adminCommand('ping')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        throw "MongoDB not responding"
    }
} catch {
    Write-Host "✗ MongoDB is not running!" -ForegroundColor Red
    Write-Host "`nStarting MongoDB..." -ForegroundColor Yellow
    
    # Try to start MongoDB service
    try {
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ MongoDB service started" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not start MongoDB service automatically" -ForegroundColor Yellow
        Write-Host "Please start MongoDB manually:" -ForegroundColor Yellow
        Write-Host "  - Windows Service: net start MongoDB" -ForegroundColor Gray
        Write-Host "  - Or run: mongod" -ForegroundColor Gray
        Write-Host "`nPress Enter after starting MongoDB..." -ForegroundColor Yellow
        Read-Host
    }
}

# Test MongoDB connection
Write-Host "`nVerifying MongoDB connection..." -ForegroundColor Yellow
$mongoTest = mongosh --eval "db.adminCommand('ping')" --quiet 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Cannot connect to MongoDB. Exiting." -ForegroundColor Red
    exit 1
}
Write-Host "✓ MongoDB connection verified" -ForegroundColor Green

# Start Backend
Write-Host "`n----------------------------------------------" -ForegroundColor Cyan
Write-Host "Starting Backend Server (Port 3000)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Cyan

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; Write-Host '=== BACKEND SERVER ===' -ForegroundColor Green; npm start" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend
$backendReady = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend is ready!" -ForegroundColor Green
            $backendReady = $true
            break
        }
    } catch {
        Write-Host "  Attempt $i/10: Waiting for backend..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "⚠ Backend may not be ready yet. Check the backend window." -ForegroundColor Yellow
}

# Start AI Service
Write-Host "`n----------------------------------------------" -ForegroundColor Cyan
Write-Host "Starting AI Service (Port 5000)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Cyan

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\ai-service'; Write-Host '=== AI SERVICE ===' -ForegroundColor Green; python app.py" -WindowStyle Normal

Write-Host "Waiting for AI service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test AI service
$aiReady = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 2 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ AI Service is ready!" -ForegroundColor Green
            $aiReady = $true
            break
        }
    } catch {
        Write-Host "  Attempt $i/5: Waiting for AI service..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $aiReady) {
    Write-Host "⚠ AI Service may not be ready yet. Check the AI service window." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "`n----------------------------------------------" -ForegroundColor Cyan
Write-Host "Starting Frontend (Port 3001)..." -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Cyan

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; Write-Host '=== FRONTEND ===' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host "`nWaiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Summary
Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "  All Services Started!`n" -ForegroundColor Green
Write-Host "==============================================`n" -ForegroundColor Cyan

Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  • Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "  • Backend:   http://localhost:3000" -ForegroundColor White
Write-Host "  • AI Service: http://localhost:5000" -ForegroundColor White
Write-Host "  • Health:    http://localhost:3000/health" -ForegroundColor White

Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "  • Admin:    admin@civic.com / admin123" -ForegroundColor White
Write-Host "  • Engineer: engineer1@civic.com / admin123" -ForegroundColor White
Write-Host "  • Surveyor: surveyor1@civic.com / admin123" -ForegroundColor White

Write-Host "`nNote: If database is empty, run seed script:" -ForegroundColor Yellow
Write-Host "  node scripts/seed-mongodb.js`n" -ForegroundColor Gray

Write-Host "Press any key to test connections..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Run connection test
Write-Host "`nRunning connection tests...`n" -ForegroundColor Yellow
node "$PSScriptRoot\test-connection.js"
