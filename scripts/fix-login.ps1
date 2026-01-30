# Fix Login - Create Test User on Render
Write-Host "`n=== CREATING TEST USER ON RENDER ===" -ForegroundColor Cyan

$registerBody = @{
    username = "testuser"
    email = "test@vmc.com"
    password = "Test@123456"
    full_name = "Test User"
    role = "surveyor"
} | ConvertTo-Json

Write-Host "`nRegistering new user..." -ForegroundColor Yellow
Write-Host "Username: testuser" -ForegroundColor Gray
Write-Host "Email: test@vmc.com" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://civic-issue-backend-ndmh.onrender.com/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "✓ User created successfully!" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "User ID: $($json.data.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    if ($_.ErrorDetails.Message) {
        Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Now try to login
Write-Host "`n=== TESTING LOGIN ===" -ForegroundColor Cyan

$loginBody = @{
    username = "testuser"
    password = "Test@123456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://civic-issue-backend-ndmh.onrender.com/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "✓ LOGIN SUCCESSFUL!" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Token: $($json.data.token.Substring(0,40))..." -ForegroundColor Gray
    Write-Host "User: $($json.data.user.username) ($($json.data.user.role))" -ForegroundColor Gray
    Write-Host "`n✓ BACKEND LOGIN IS WORKING!" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    if ($_.ErrorDetails.Message) {
        Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Frontend URL: https://ai-based-civic-issue-monitoring-system.onrender.com" -ForegroundColor White
Write-Host "Backend API: https://civic-issue-backend-ndmh.onrender.com/api" -ForegroundColor White
Write-Host "Login endpoint expects: { username, password } (not email!)" -ForegroundColor Yellow
Write-Host "`nTest credentials:" -ForegroundColor White
Write-Host "  Username: testuser" -ForegroundColor Gray
Write-Host "  Password: Test@123456" -ForegroundColor Gray
