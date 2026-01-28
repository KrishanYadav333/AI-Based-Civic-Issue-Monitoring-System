# Render API Helper Script
# Get your API key from: https://dashboard.render.com/u/settings/api-keys

param(
    [string]$ApiKey = $env:RENDER_API_KEY,
    [string]$Action = "list"
)

$RENDER_API_BASE = "https://api.render.com/v1"

if (-not $ApiKey) {
    Write-Host "❌ Error: RENDER_API_KEY not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Get your API key from: https://dashboard.render.com/u/settings/api-keys" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  1. Set environment variable: `$env:RENDER_API_KEY='your-api-key'" -ForegroundColor White
    Write-Host "  2. Run: .\scripts\render-cli.ps1 -Action list" -ForegroundColor White
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Accept" = "application/json"
}

function Get-Services {
    Write-Host "🔍 Fetching your Render services..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services" -Headers $headers -Method Get
        
        Write-Host ""
        Write-Host "📊 Your Deployed Services:" -ForegroundColor Green
        Write-Host "=" * 80
        
        foreach ($service in $response) {
            Write-Host ""
            Write-Host "Service: $($service.name)" -ForegroundColor Yellow
            Write-Host "  Type: $($service.type)"
            Write-Host "  URL: $($service.serviceDetails.url)"
            Write-Host "  Status: $($service.suspended ? '🔴 Suspended' : '✅ Active')"
            Write-Host "  Created: $($service.createdAt)"
            Write-Host "  Updated: $($service.updatedAt)"
        }
        
        return $response
    } catch {
        Write-Host "❌ Error fetching services: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-ServiceDetails {
    param([string]$ServiceId)
    
    Write-Host "🔍 Fetching details for service: $ServiceId" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services/$ServiceId" -Headers $headers -Method Get
        Write-Host ($response | ConvertTo-Json -Depth 10)
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-ServiceLogs {
    param([string]$ServiceId, [int]$Limit = 100)
    
    Write-Host "📋 Fetching logs for service: $ServiceId" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services/$ServiceId/logs?limit=$Limit" -Headers $headers -Method Get
        
        foreach ($log in $response) {
            $timestamp = [DateTime]$log.timestamp
            Write-Host "[$($timestamp.ToString('yyyy-MM-dd HH:mm:ss'))] $($log.message)"
        }
        
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-Deploys {
    param([string]$ServiceId)
    
    Write-Host "🚀 Fetching deploys for service: $ServiceId" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services/$ServiceId/deploys" -Headers $headers -Method Get
        
        Write-Host ""
        Write-Host "Recent Deploys:" -ForegroundColor Green
        Write-Host "=" * 80
        
        foreach ($deploy in $response | Select-Object -First 5) {
            $status_color = switch ($deploy.status) {
                "live" { "Green" }
                "build_failed" { "Red" }
                "canceled" { "Yellow" }
                default { "White" }
            }
            
            Write-Host ""
            Write-Host "Deploy ID: $($deploy.id)" -ForegroundColor Cyan
            Write-Host "  Status: $($deploy.status)" -ForegroundColor $status_color
            Write-Host "  Commit: $($deploy.commit.message)"
            Write-Host "  Created: $($deploy.createdAt)"
            Write-Host "  Finished: $($deploy.finishedAt)"
        }
        
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Trigger-Deploy {
    param([string]$ServiceId)
    
    Write-Host "🚀 Triggering deploy for service: $ServiceId" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services/$ServiceId/deploys" -Headers $headers -Method Post
        Write-Host "✅ Deploy triggered successfully!" -ForegroundColor Green
        Write-Host "Deploy ID: $($response.id)"
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-EnvVars {
    param([string]$ServiceId)
    
    Write-Host "🔐 Fetching environment variables for service: $ServiceId" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_API_BASE/services/$ServiceId/env-vars" -Headers $headers -Method Get
        
        Write-Host ""
        Write-Host "Environment Variables:" -ForegroundColor Green
        Write-Host "=" * 80
        
        foreach ($env in $response) {
            Write-Host "$($env.key) = $($env.value ? '***' : '[not set]')"
        }
        
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host ""
Write-Host "🎯 Render CLI Helper" -ForegroundColor Magenta
Write-Host "=" * 80
Write-Host ""

switch ($Action.ToLower()) {
    "list" {
        Get-Services
    }
    "services" {
        Get-Services
    }
    "help" {
        Write-Host "Available actions:" -ForegroundColor Cyan
        Write-Host "  list       - List all services"
        Write-Host "  services   - List all services"
        Write-Host ""
        Write-Host "Advanced usage (requires service ID):" -ForegroundColor Yellow
        Write-Host "  In PowerShell, you can call functions directly:"
        Write-Host "  `$services = .\scripts\render-cli.ps1 -Action list"
        Write-Host "  Get-ServiceDetails -ServiceId 'srv-xxx'"
        Write-Host "  Get-ServiceLogs -ServiceId 'srv-xxx'"
        Write-Host "  Get-Deploys -ServiceId 'srv-xxx'"
        Write-Host "  Trigger-Deploy -ServiceId 'srv-xxx'"
        Write-Host "  Get-EnvVars -ServiceId 'srv-xxx'"
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Run: .\scripts\render-cli.ps1 -Action help" -ForegroundColor Yellow
    }
}
