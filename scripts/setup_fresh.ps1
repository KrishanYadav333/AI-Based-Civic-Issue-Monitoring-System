# ============================================================================
# Fresh Virtual Environment Setup Script - Windows PowerShell
# ============================================================================
# Purpose: Clean setup of Python virtual environment with all dependencies
# Usage: .\scripts\setup_fresh.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host " FRESH VIRTUAL ENVIRONMENT SETUP " -ForegroundColor Cyan
Write-Host "============================================================================`n" -ForegroundColor Cyan

# Get project root
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "Project Root: $PROJECT_ROOT`n" -ForegroundColor Yellow

# Step 1: Check Python installation
Write-Host "[1/7] Checking Python installation..." -ForegroundColor Green
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Python version (need 3.8+)
$versionMatch = $pythonVersion -match "Python (\d+)\.(\d+)\.(\d+)"
if ($versionMatch) {
    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 8)) {
        Write-Host "  ✗ Python 3.8+ required. Found: $pythonVersion" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Remove old virtual environment if exists
Write-Host "`n[2/7] Cleaning old virtual environment..." -ForegroundColor Green
$venvPath = Join-Path $PROJECT_ROOT ".venv"
if (Test-Path $venvPath) {
    Write-Host "  → Removing old .venv directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $venvPath
    Write-Host "  ✓ Old virtual environment removed" -ForegroundColor Green
} else {
    Write-Host "  ✓ No old virtual environment found" -ForegroundColor Green
}

# Step 3: Create fresh virtual environment
Write-Host "`n[3/7] Creating fresh virtual environment..." -ForegroundColor Green
try {
    Set-Location $PROJECT_ROOT
    python -m venv .venv
    Write-Host "  ✓ Virtual environment created at: $venvPath" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to create virtual environment: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Activate virtual environment
Write-Host "`n[4/7] Activating virtual environment..." -ForegroundColor Green
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
    Write-Host "  ✓ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "  ✗ Activation script not found: $activateScript" -ForegroundColor Red
    exit 1
}

# Step 5: Upgrade pip
Write-Host "`n[5/7] Upgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip
if ($LASTEXITCODE -eq 0) {
    $pipVersion = pip --version
    Write-Host "  ✓ $pipVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to upgrade pip" -ForegroundColor Red
    exit 1
}

# Step 6: Install project dependencies
Write-Host "`n[6/7] Installing project dependencies..." -ForegroundColor Green
Write-Host "  → This may take 5-10 minutes (downloading PyTorch, YOLOv8, etc.)" -ForegroundColor Yellow

$requirementsFile = Join-Path $PROJECT_ROOT "requirements.txt"
if (Test-Path $requirementsFile) {
    Write-Host "  → Installing from: requirements.txt" -ForegroundColor Yellow
    pip install -r $requirementsFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ requirements.txt not found at: $requirementsFile" -ForegroundColor Red
    exit 1
}

# Install ai-service specific requirements
$aiRequirements = Join-Path $PROJECT_ROOT "ai-service\requirements.txt"
if (Test-Path $aiRequirements) {
    Write-Host "`n  → Installing ai-service requirements..." -ForegroundColor Yellow
    pip install -r $aiRequirements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ AI service dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: Some ai-service dependencies failed" -ForegroundColor Yellow
    }
}

# Step 7: Verify installation
Write-Host "`n[7/7] Verifying installation..." -ForegroundColor Green

# Check PyTorch
try {
    $torchVersion = python -c "import torch; print(torch.__version__)" 2>&1
    Write-Host "  ✓ PyTorch: $torchVersion" -ForegroundColor Green
    
    # Check GPU support
    $hasCUDA = python -c "import torch; print(torch.cuda.is_available())" 2>&1
    $hasMPS = python -c "import torch; print(hasattr(torch.backends, 'mps') and torch.backends.mps.is_available())" 2>&1
    
    if ($hasCUDA -eq "True") {
        Write-Host "  ✓ CUDA GPU support: AVAILABLE" -ForegroundColor Green
    } elseif ($hasMPS -eq "True") {
        Write-Host "  ✓ MPS (Apple Silicon) GPU support: AVAILABLE" -ForegroundColor Green
    } else {
        Write-Host "  ℹ GPU support: Not available (CPU only)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ✗ PyTorch import failed: $_" -ForegroundColor Red
}

# Check Ultralytics (YOLOv8)
try {
    $yoloVersion = python -c "import ultralytics; print(ultralytics.__version__)" 2>&1
    Write-Host "  ✓ Ultralytics (YOLOv8): $yoloVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Ultralytics import failed: $_" -ForegroundColor Red
}

# Check OpenCV
try {
    $cvVersion = python -c "import cv2; print(cv2.__version__)" 2>&1
    Write-Host "  ✓ OpenCV: $cvVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ OpenCV import failed: $_" -ForegroundColor Red
}

# Check FastAPI
try {
    $fastapiVersion = python -c "import fastapi; print(fastapi.__version__)" 2>&1
    Write-Host "  ✓ FastAPI: $fastapiVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ FastAPI import failed (optional): $_" -ForegroundColor Yellow
}

# Show installed packages count
$packageCount = pip list | Measure-Object -Line | Select-Object -ExpandProperty Lines
$packageCount = $packageCount - 2  # Subtract header lines
Write-Host "`n  ✓ Total packages installed: $packageCount" -ForegroundColor Green

# Summary
Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host " SETUP COMPLETE! " -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

Write-Host "`nVirtual environment is ready at: .venv" -ForegroundColor Green
Write-Host "`nTo activate manually:" -ForegroundColor Yellow
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Generate training data:" -ForegroundColor White
Write-Host "     python ai-service\generate_training_data.py" -ForegroundColor Cyan
Write-Host "`n  2. Train YOLOv8 model:" -ForegroundColor White
Write-Host "     python ai-service\train_yolov8_custom.py" -ForegroundColor Cyan
Write-Host "`n  3. Test trained model:" -ForegroundColor White
Write-Host "     python ai-service\test_yolov8_model.py" -ForegroundColor Cyan

Write-Host "`n  For Mac M4 GPU training:" -ForegroundColor White
Write-Host "     See MAC_M4_TRAINING_GUIDE.md" -ForegroundColor Cyan

Write-Host "`n============================================================================`n" -ForegroundColor Cyan
