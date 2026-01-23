#!/bin/bash
# Mac M4 Setup Script for YOLOv8 Training
# Run: bash setup_mac_m4.sh

echo "========================================"
echo "Mac M4 YOLOv8 Training Setup"
echo "========================================"

# Check if running on Mac
if [[ "$(uname)" != "Darwin" ]]; then
    echo "❌ This script is for macOS only!"
    exit 1
fi

# Check Apple Silicon
if [[ "$(uname -m)" != "arm64" ]]; then
    echo "⚠️  Warning: Not running on Apple Silicon (arm64)"
fi

cd ai-service || exit 1

echo ""
echo "[1/5] Creating virtual environment..."
python3 -m venv venv_m4
source venv_m4/bin/activate

echo ""
echo "[2/5] Upgrading pip..."
pip install --upgrade pip

echo ""
echo "[3/5] Installing PyTorch with MPS support..."
pip install torch torchvision torchaudio

echo ""
echo "[4/5] Installing YOLOv8 and dependencies..."
pip install -r requirements.txt

echo ""
echo "[5/5] Verifying GPU detection..."
python -c "
import torch
print('✓ PyTorch Version:', torch.__version__)
print('✓ MPS Available:', torch.backends.mps.is_available())
print('✓ MPS Built:', torch.backends.mps.is_built())
if torch.backends.mps.is_available():
    print('\n🎉 GPU Ready! Training will use Apple Silicon GPU')
else:
    print('\n⚠️  MPS not available, will use CPU')
"

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Activate environment: source ai-service/venv_m4/bin/activate"
echo "2. Run training: python train_yolov8_custom.py"
echo "3. Monitor progress (8-15 minutes on M4)"
echo ""
echo "Training data required:"
echo "  - ai-service/training_data/pothole/ (50 images)"
echo "  - ai-service/training_data/garbage/ (50 images)"
echo "  - ai-service/training_data/debris/ (50 images)"
echo "  - ai-service/training_data/stray_cattle/ (50 images)"
echo "  - ai-service/training_data/broken_road/ (50 images)"
echo "  - ai-service/training_data/open_manhole/ (50 images)"
echo ""
