# Test Deployment Script
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT HEALTH CHECK" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

$services = @(
    @{ Name = "Frontend"; URL = "https://ai-based-civic-issue-monitoring-system.onrender.com"; Method = "GET" }
    @{ Name = "Backend Health"; URL = "https://civic-issue-backend-ndmh.onrender.com/health"; Method = "GET" }
    @{ Name = "AI Service Health"; URL = "https://ai-civic-ms-dockerimg.onrender.com/health"; Method = "GET" }
)

foreach ($service in $services) {
    Write-Host "Testing $($service.Name)..." -ForegroundColor Yellow
    Write-Host "  URL: $($service.URL)" -ForegroundColor Gray
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $service.URL -Method $service.Method -TimeoutSec 60 -ErrorAction Stop
        $stopwatch.Stop()
        
        Write-Host "  ✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  ⏱ Response Time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
        
        if ($response.Content.Length -lt 500) {
            Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
        } else {
            Write-Host "  Response: [Large content - $($response.Content.Length) bytes]" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            Write-Host "  Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Test Login Endpoint
Write-Host "`n--- Testing Backend Login Endpoint ---" -ForegroundColor Magenta
$loginBody = @{
    email = "admin@vmc.com"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "Attempting login with admin@vmc.com..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://civic-issue-backend-ndmh.onrender.com/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 60 `
        -ErrorAction Stop
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Gray
    $jsonResponse = $response.Content | ConvertFrom-Json
    Write-Host "Token received: $($jsonResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Error Message: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    # Check specific error codes
    switch ($statusCode) {
        401 { Write-Host "ℹ Invalid credentials (endpoint working)" -ForegroundColor Cyan }
        404 { Write-Host "⚠ Route not found - Check backend deployment" -ForegroundColor Magenta }
        500 { Write-Host "⚠ Server error - Check backend logs" -ForegroundColor Magenta }
        default { Write-Host "⚠ Unknown error" -ForegroundColor Magenta }
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   ENVIRONMENT CHECK" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "✓ Frontend should use: VITE_API_URL=https://civic-issue-backend-ndmh.onrender.com/api" -ForegroundColor Yellow
Write-Host "✓ Backend should use: AI_SERVICE_URL=https://ai-civic-ms-dockerimg.onrender.com" -ForegroundColor Yellow
Write-Host "`nℹ If login fails with 404, verify backend is deployed with correct routes." -ForegroundColor Cyan
Write-Host "ℹ If login fails with 401, database credentials may need seeding." -ForegroundColor Cyan
