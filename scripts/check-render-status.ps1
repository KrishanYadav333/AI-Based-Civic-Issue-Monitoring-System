# Quick Render Status Check (No API Key Required)
# Checks the health of all deployed Render services

Write-Host ""
Write-Host "🔍 Checking Render Deployment Status..." -ForegroundColor Cyan
Write-Host "=" * 80
Write-Host ""

$services = @(
    @{
        Name = "Frontend"
        URL = "https://ai-based-civic-issue-monitoring-system.onrender.com"
        HealthEndpoint = "/"
    },
    @{
        Name = "Backend"
        URL = "https://civic-issue-backend-ndmh.onrender.com"
        HealthEndpoint = "/health"
    },
    @{
        Name = "AI Service"
        URL = "https://ai-civic-ms-dockerimg.onrender.com"
        HealthEndpoint = "/health"
    }
)

foreach ($service in $services) {
    Write-Host "Testing: $($service.Name)" -ForegroundColor Yellow
    Write-Host "  URL: $($service.URL)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$($service.URL)$($service.HealthEndpoint)" -Method Get -UseBasicParsing -TimeoutSec 30
        $content = $response.Content
        
        Write-Host "  Status: ✅ $($response.StatusCode) OK" -ForegroundColor Green
        
        # Parse JSON if possible
        try {
            $json = $content | ConvertFrom-Json
            Write-Host "  Response:" -ForegroundColor Cyan
            
            # Display key fields
            if ($json.status) { Write-Host "    Status: $($json.status)" }
            if ($json.service) { Write-Host "    Service: $($json.service)" }
            if ($json.version) { Write-Host "    Version: $($json.version)" }
            if ($json.database) { Write-Host "    Database: $($json.database)" }
            if ($json.timestamp) { Write-Host "    Timestamp: $($json.timestamp)" }
            if ($json.model) { 
                Write-Host "    Model Loaded: $($json.model.loaded)" 
                Write-Host "    Device: $($json.model.device)"
            }
        } catch {
            # Not JSON, just show first 200 chars
            $preview = $content.Substring(0, [Math]::Min(200, $content.Length))
            Write-Host "  Response: $preview..." -ForegroundColor Gray
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "  Status: ⚠️  $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "  Status: ❌ Unreachable" -ForegroundColor Red
        }
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test login endpoint
Write-Host "Testing: Backend Login Endpoint" -ForegroundColor Yellow
Write-Host "  URL: https://civic-issue-backend-ndmh.onrender.com/api/auth/login" -ForegroundColor Gray

try {
    $body = @{username='test'; password='test'} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri 'https://civic-issue-backend-ndmh.onrender.com/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30
    Write-Host "  Status: ✅ $($response.StatusCode) OK" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  Status: ✅ 401 Unauthorized (Correct!)" -ForegroundColor Green
        Write-Host "  Message: Login route is working correctly" -ForegroundColor Cyan
    } else {
        Write-Host "  Status: ❌ $statusCode" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=" * 80
Write-Host "✅ Status check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "For API key-based management, get your key from:" -ForegroundColor Yellow
Write-Host "https://dashboard.render.com/u/settings/api-keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then run: .\scripts\render-cli.ps1 -Action list" -ForegroundColor White
