# Docker cleanup and build helper script

Write-Host "`n🧹 Docker Cleanup & Build Helper`n" -ForegroundColor Cyan

# Check Docker status
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Show current disk usage
Write-Host "`n📊 Current Docker disk usage:" -ForegroundColor Yellow
docker system df

# Ask if user wants to clean up
Write-Host "`n🗑️  Cleanup Options:" -ForegroundColor Cyan
Write-Host "1. Remove dangling images (recommended)"
Write-Host "2. Remove all unused images"
Write-Host "3. Full cleanup (containers, images, cache)"
Write-Host "4. Skip cleanup and build"
$choice = Read-Host "`nSelect option (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nRemoving dangling images..." -ForegroundColor Yellow
        docker image prune -f
    }
    "2" {
        Write-Host "`nRemoving unused images..." -ForegroundColor Yellow
        docker image prune -a -f
    }
    "3" {
        Write-Host "`nFull cleanup (this may take a moment)..." -ForegroundColor Yellow
        docker system prune -a --volumes -f
    }
    "4" {
        Write-Host "`nSkipping cleanup..." -ForegroundColor Yellow
    }
    default {
        Write-Host "Invalid option, skipping cleanup..." -ForegroundColor Yellow
    }
}

# Show disk usage after cleanup
Write-Host "`n📊 Disk usage after cleanup:" -ForegroundColor Yellow
docker system df

# Build the image
Write-Host "`n🔨 Building Docker image..." -ForegroundColor Cyan
Write-Host "Using cache layers to speed up build...`n" -ForegroundColor Yellow

$buildStart = Get-Date
docker build -t ai-civic-local . --progress=plain

if ($LASTEXITCODE -eq 0) {
    $buildTime = (Get-Date) - $buildStart
    Write-Host "`n✅ Build successful! Time: $($buildTime.TotalSeconds.ToString('F1'))s" -ForegroundColor Green
    
    # Ask if user wants to run the container
    $run = Read-Host "`n🚀 Run the container now? (y/n)"
    if ($run -eq 'y') {
        Write-Host "`nStarting container on port 5000..." -ForegroundColor Cyan
        docker run -d -p 5000:5000 --name ai-civic-test ai-civic-local
        Write-Host "✅ Container started!" -ForegroundColor Green
        Write-Host "Test: http://localhost:5000/health" -ForegroundColor Cyan
        Write-Host "`nView logs: docker logs ai-civic-test" -ForegroundColor Yellow
        Write-Host "Stop: docker stop ai-civic-test && docker rm ai-civic-test" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}
