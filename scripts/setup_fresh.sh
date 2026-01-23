#!/bin/bash
# ============================================================================
# Fresh Virtual Environment Setup Script - Linux/Mac
# ============================================================================
# Purpose: Clean setup of Python virtual environment with all dependencies
# Usage: ./scripts/setup_fresh.sh
# ============================================================================

set -e  # Exit on error

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}============================================================================${NC}"
echo -e "${CYAN} FRESH VIRTUAL ENVIRONMENT SETUP ${NC}"
echo -e "${CYAN}============================================================================${NC}\n"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}\n"

# Step 1: Check Python installation
echo -e "${GREEN}[1/7] Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo -e "${RED}  ✗ Python not found! Please install Python 3.8+${NC}"
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo -e "${GREEN}  ✓ Found: $PYTHON_VERSION${NC}"

# Check Python version (need 3.8+)
MAJOR_VERSION=$($PYTHON_CMD -c "import sys; print(sys.version_info.major)")
MINOR_VERSION=$($PYTHON_CMD -c "import sys; print(sys.version_info.minor)")

if [ "$MAJOR_VERSION" -lt 3 ] || ([ "$MAJOR_VERSION" -eq 3 ] && [ "$MINOR_VERSION" -lt 8 ]); then
    echo -e "${RED}  ✗ Python 3.8+ required. Found: $PYTHON_VERSION${NC}"
    exit 1
fi

# Step 2: Remove old virtual environment if exists
echo -e "\n${GREEN}[2/7] Cleaning old virtual environment...${NC}"
VENV_PATH="$PROJECT_ROOT/.venv"
if [ -d "$VENV_PATH" ]; then
    echo -e "${YELLOW}  → Removing old .venv directory...${NC}"
    rm -rf "$VENV_PATH"
    echo -e "${GREEN}  ✓ Old virtual environment removed${NC}"
else
    echo -e "${GREEN}  ✓ No old virtual environment found${NC}"
fi

# Step 3: Create fresh virtual environment
echo -e "\n${GREEN}[3/7] Creating fresh virtual environment...${NC}"
cd "$PROJECT_ROOT"
$PYTHON_CMD -m venv .venv
echo -e "${GREEN}  ✓ Virtual environment created at: $VENV_PATH${NC}"

# Step 4: Activate virtual environment
echo -e "\n${GREEN}[4/7] Activating virtual environment...${NC}"
source .venv/bin/activate
echo -e "${GREEN}  ✓ Virtual environment activated${NC}"

# Step 5: Upgrade pip
echo -e "\n${GREEN}[5/7] Upgrading pip...${NC}"
python -m pip install --upgrade pip
PIP_VERSION=$(pip --version)
echo -e "${GREEN}  ✓ $PIP_VERSION${NC}"

# Step 6: Install project dependencies
echo -e "\n${GREEN}[6/7] Installing project dependencies...${NC}"
echo -e "${YELLOW}  → This may take 5-10 minutes (downloading PyTorch, YOLOv8, etc.)${NC}"

REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"
if [ -f "$REQUIREMENTS_FILE" ]; then
    echo -e "${YELLOW}  → Installing from: requirements.txt${NC}"
    pip install -r "$REQUIREMENTS_FILE"
    echo -e "${GREEN}  ✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}  ✗ requirements.txt not found at: $REQUIREMENTS_FILE${NC}"
    exit 1
fi

# Install ai-service specific requirements
AI_REQUIREMENTS="$PROJECT_ROOT/ai-service/requirements.txt"
if [ -f "$AI_REQUIREMENTS" ]; then
    echo -e "\n${YELLOW}  → Installing ai-service requirements...${NC}"
    pip install -r "$AI_REQUIREMENTS" || echo -e "${YELLOW}  ⚠ Warning: Some ai-service dependencies failed${NC}"
    echo -e "${GREEN}  ✓ AI service dependencies installed${NC}"
fi

# Step 7: Verify installation
echo -e "\n${GREEN}[7/7] Verifying installation...${NC}"

# Check PyTorch
if python -c "import torch; print(torch.__version__)" 2>&1; then
    TORCH_VERSION=$(python -c "import torch; print(torch.__version__)")
    echo -e "${GREEN}  ✓ PyTorch: $TORCH_VERSION${NC}"
    
    # Check GPU support
    HAS_CUDA=$(python -c "import torch; print(torch.cuda.is_available())" 2>&1)
    HAS_MPS=$(python -c "import torch; print(hasattr(torch.backends, 'mps') and torch.backends.mps.is_available())" 2>&1)
    
    if [ "$HAS_CUDA" = "True" ]; then
        echo -e "${GREEN}  ✓ CUDA GPU support: AVAILABLE${NC}"
    elif [ "$HAS_MPS" = "True" ]; then
        echo -e "${GREEN}  ✓ MPS (Apple Silicon) GPU support: AVAILABLE${NC}"
    else
        echo -e "${YELLOW}  ℹ GPU support: Not available (CPU only)${NC}"
    fi
else
    echo -e "${RED}  ✗ PyTorch import failed${NC}"
fi

# Check Ultralytics (YOLOv8)
if python -c "import ultralytics; print(ultralytics.__version__)" 2>&1; then
    YOLO_VERSION=$(python -c "import ultralytics; print(ultralytics.__version__)")
    echo -e "${GREEN}  ✓ Ultralytics (YOLOv8): $YOLO_VERSION${NC}"
else
    echo -e "${RED}  ✗ Ultralytics import failed${NC}"
fi

# Check OpenCV
if python -c "import cv2; print(cv2.__version__)" 2>&1; then
    CV_VERSION=$(python -c "import cv2; print(cv2.__version__)")
    echo -e "${GREEN}  ✓ OpenCV: $CV_VERSION${NC}"
else
    echo -e "${RED}  ✗ OpenCV import failed${NC}"
fi

# Check FastAPI
if python -c "import fastapi; print(fastapi.__version__)" 2>&1; then
    FASTAPI_VERSION=$(python -c "import fastapi; print(fastapi.__version__)")
    echo -e "${GREEN}  ✓ FastAPI: $FASTAPI_VERSION${NC}"
else
    echo -e "${YELLOW}  ⚠ FastAPI import failed (optional)${NC}"
fi

# Show installed packages count
PACKAGE_COUNT=$(pip list | wc -l)
PACKAGE_COUNT=$((PACKAGE_COUNT - 2))  # Subtract header lines
echo -e "\n${GREEN}  ✓ Total packages installed: $PACKAGE_COUNT${NC}"

# Summary
echo -e "\n${CYAN}============================================================================${NC}"
echo -e "${CYAN} SETUP COMPLETE! ${NC}"
echo -e "${CYAN}============================================================================${NC}"

echo -e "\n${GREEN}Virtual environment is ready at: .venv${NC}"
echo -e "\n${YELLOW}To activate manually:${NC}"
echo -e "${NC}  source .venv/bin/activate${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "${NC}  1. Generate training data:${NC}"
echo -e "${CYAN}     python ai-service/generate_training_data.py${NC}"
echo -e "\n${NC}  2. Train YOLOv8 model:${NC}"
echo -e "${CYAN}     python ai-service/train_yolov8_custom.py${NC}"
echo -e "\n${NC}  3. Test trained model:${NC}"
echo -e "${CYAN}     python ai-service/test_yolov8_model.py${NC}"

echo -e "\n${NC}  For Mac M4 GPU training:${NC}"
echo -e "${CYAN}     See MAC_M4_TRAINING_GUIDE.md${NC}"

echo -e "\n${CYAN}============================================================================${NC}\n"
