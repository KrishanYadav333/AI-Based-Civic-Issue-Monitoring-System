# Setup Instructions - Virtual Environment & Training Data

## 🚨 Current Situation

**Virtual Environment**: Fresh `.venv` created but PyTorch installation failing due to network issues (114MB download keeps disconnecting).

**Solution Options**:
1. **RECOMMENDED**: Skip Windows setup, transfer to Mac M4 for GPU training (see below)
2. Install packages individually with retries (slower)
3. Use pre-installed global packages temporarily

---

## Option 1: Mac M4 GPU Training (RECOMMENDED - 10x Faster)

### Step 1: Transfer Project to Mac M4

#### Via Git (Recommended)
```bash
# On Windows: Commit current work
git add .
git commit -m "Ready for Mac M4 training with expanded dataset"
git push origin main  # or your branch name

# On Mac M4: Clone/Pull
git clone <your-repo-url>
cd "AI civic issue monitor"
git pull origin main
```

#### Alternative: Direct Transfer
```powershell
# On Windows: Create transfer package (excluding node_modules, venv)
Compress-Archive -Path ai-service,backend,scripts,requirements.txt,MAC_M4_TRAINING_GUIDE.md -DestinationPath mac-transfer.zip

# Transfer mac-transfer.zip to Mac via:
# - AirDrop
# - USB drive
# - Cloud storage (Google Drive, Dropbox)
```

### Step 2: Run Mac M4 Setup Script

```bash
# On Mac M4
cd "AI civic issue monitor"
chmod +x scripts/setup_fresh.sh
./scripts/setup_fresh.sh
```

This will:
- Create fresh virtual environment with MPS (GPU) support
- Install PyTorch with Apple Silicon optimization
- Install all dependencies (ultralytics, opencv, etc.)
- Verify GPU detection

### Step 3: Generate Expanded Training Data

```bash
source .venv/bin/activate
cd ai-service
python generate_training_data.py
```

**Output**: Expands from 50 to 250 images per class (1500 total) using augmentation.

### Step 4: Train YOLOv8 on Mac M4 GPU

```bash
python train_yolov8_custom.py
```

**Expected**:
- Device: `mps` (Apple Silicon GPU)
- Batch Size: 32 (vs 16 on CPU)
- Training Time: ~10 minutes (vs 75 minutes on CPU)
- Expected Accuracy: 85-95% with 250 images/class

---

## Option 2: Windows Setup with Retries

If you need to train on Windows, install packages individually to handle network issues:

### Step 1: Activate Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### Step 2: Install Core Packages (Small Downloads)

```powershell
pip install numpy pillow opencv-python matplotlib seaborn scikit-learn scipy
```

### Step 3: Install PyTorch (Large Download - May Need Retries)

```powershell
# Try multiple times if connection drops
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# If still failing, download manually:
# Visit: https://pytorch.org/get-started/locally/
# Download torch-2.10.0-cp313-cp313-win_amd64.whl
# Install: pip install path\to\torch-2.10.0-cp313-cp313-win_amd64.whl
```

### Step 4: Install YOLOv8 and Remaining Packages

```powershell
pip install ultralytics fastapi uvicorn redis requests
pip install python-dotenv pyyaml tqdm colorama
pip install pytest pytest-cov black flake8
```

### Step 5: Verify Installation

```powershell
python -c "import torch; print('PyTorch:', torch.__version__)"
python -c "import ultralytics; print('YOLOv8:', ultralytics.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
```

---

## Option 3: Use Global Packages Temporarily

If venv setup keeps failing, you can use globally installed packages:

### Check What's Already Installed

```powershell
pip list | Select-String "torch|ultralytics|opencv|numpy"
```

### If Packages Exist Globally

```powershell
# Use Python with global packages directly
python ai-service\generate_training_data.py
python ai-service\train_yolov8_custom.py
```

**Note**: This is temporary. For production, use virtual environment.

---

## Training Data Generation (All Platforms)

### Current Dataset
- 300 images (50 per class × 6 classes)
- Classes: pothole, garbage, debris, stray_cattle, broken_road, open_manhole

### Generate Expanded Dataset

```bash
# Generates 250 images per class = 1500 total
python ai-service/generate_training_data.py
```

**Augmentation Techniques Applied**:
- Brightness adjustment (0.6x - 1.4x)
- Contrast variation (0.7x - 1.5x)
- Rotation (-30° to +30°)
- Horizontal flip
- Gaussian blur (radius 0.5-2.0)
- Random noise injection
- Zoom (1.1x - 1.3x)
- Crop/padding (0.8x - 0.95x)
- Color jitter
- Sharpness adjustment

**Customization**:
Edit `ai-service/generate_training_data.py`:
```python
TARGET_IMAGES_PER_CLASS = 250  # Change to 200, 500, etc.
```

---

## Quick Start Guide

### Fastest Path to Training:

1. **Transfer to Mac M4** (if available)
   ```bash
   git push  # Windows
   git pull  # Mac M4
   ./scripts/setup_fresh.sh  # Mac M4
   ```

2. **Generate Training Data**
   ```bash
   python ai-service/generate_training_data.py
   ```

3. **Train Model**
   ```bash
   python ai-service/train_yolov8_custom.py
   ```

4. **Test Model**
   ```bash
   python ai-service/test_yolov8_model.py
   ```

5. **Deploy**
   - Update [ai-service/config.py](ai-service/config.py): `MODEL_PATH = './models/yolov8_civic_custom.pt'`
   - Test: `python ai-service/src/main.py`
   - Production: Merge to main branch

---

## Troubleshooting

### Network Issues During pip Install
```powershell
# Increase timeout
pip install --timeout 300 torch torchvision

# Use different mirror
pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple torch

# Download manually and install locally
pip download torch torchvision
pip install ./torch-*.whl ./torchvision-*.whl
```

### VS Code Import Errors
Update [.vscode/settings.json](.vscode/settings.json):
```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/Scripts/python.exe"
}
```
Then: `Ctrl+Shift+P` → "Python: Select Interpreter" → Choose `.venv`

### Mac M4 GPU Not Detected
```bash
python -c "import torch; print('MPS Available:', torch.backends.mps.is_available())"

# If False, reinstall PyTorch:
pip uninstall torch torchvision
pip install --pre torch torchvision --index-url https://download.pytorch.org/whl/nightly/cpu
```

### Out of Memory During Training
Edit `train_yolov8_custom.py`:
```python
BATCH_SIZE = 8  # Reduce from 16/32
```

---

## Next Steps

✅ **Completed**:
- Fresh virtual environment created
- Training data generation script ready
- Setup scripts for Windows and Mac
- Comprehensive requirements.txt

⏳ **Pending**:
- Complete package installation (retrying or on Mac M4)
- Generate expanded training dataset (50 → 250 images/class)
- Train YOLOv8 model on GPU
- Test trained model
- Deploy to production

📝 **Documentation Available**:
- [MAC_M4_TRAINING_GUIDE.md](MAC_M4_TRAINING_GUIDE.md) - Complete Mac M4 setup
- [TRAINING_QUICKSTART.md](TRAINING_QUICKSTART.md) - Quick reference for training
- [AI_MODEL_TRAINING_YOLOV8.md](AI_MODEL_TRAINING_YOLOV8.md) - Detailed training documentation
- [QUICKSTART.md](QUICKSTART.md) - Project quick start
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment

---

## Support & Resources

- **YOLOv8 Documentation**: https://docs.ultralytics.com/
- **PyTorch Installation**: https://pytorch.org/get-started/locally/
- **Issue Tracker**: Report problems in project GitHub issues
- **Mac M4 Reference**: [MAC_M4_TRAINING_GUIDE.md](MAC_M4_TRAINING_GUIDE.md)
