# Seed MongoDB Atlas with Plain Text Passwords
# Get MONGODB_URI from Render dashboard and seed users

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   MONGODB ATLAS - MANUAL SEEDING" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "⚠️  This script requires your MongoDB Atlas connection string`n" -ForegroundColor Yellow

Write-Host "📋 How to get your MongoDB Atlas URI:" -ForegroundColor Cyan
Write-Host "   1. Go to https://dashboard.render.com" -ForegroundColor Gray
Write-Host "   2. Select your Backend service" -ForegroundColor Gray
Write-Host "   3. Click 'Environment' tab" -ForegroundColor Gray
Write-Host "   4. Find MONGODB_URI variable" -ForegroundColor Gray
Write-Host "   5. Copy the value`n" -ForegroundColor Gray

Write-Host "Example format:" -ForegroundColor White
Write-Host "   mongodb+srv://username:password@cluster.mongodb.net/civic_issues`n" -ForegroundColor Gray

$mongoUri = Read-Host "Paste your MongoDB Atlas URI here"

if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    Write-Host "`n❌ No URI provided. Exiting." -ForegroundColor Red
    exit 1
}

if ($mongoUri.Contains("localhost")) {
    Write-Host "`n❌ This is a localhost URI. We need MongoDB Atlas URI!" -ForegroundColor Red
    Write-Host "   MongoDB Atlas URIs start with: mongodb+srv://" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🚀 Starting seeding process...`n" -ForegroundColor Green

Push-Location ..\backend
node scripts/seed-atlas-users.js "$mongoUri"
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Host "`n✅ SUCCESS! Users seeded to MongoDB Atlas`n" -ForegroundColor Green
    Write-Host "Now test login at:" -ForegroundColor Cyan
    Write-Host "   https://civic-issue-backend-ndmh.onrender.com/api/auth/login`n" -ForegroundColor White
    
    Write-Host "Test credentials:" -ForegroundColor Cyan
    Write-Host "   { `"username`": `"admin`", `"password`": `"Admin@123`" }" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Seeding failed. Check error messages above.`n" -ForegroundColor Red
}
