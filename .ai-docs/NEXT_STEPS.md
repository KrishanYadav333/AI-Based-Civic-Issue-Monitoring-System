# 🎯 NEXT STEPS - Virtual Environment & Training Setup

## Current Status

### ✅ Completed
1. **Old virtual environment deleted**
2. **Fresh `.venv` created** at project root
3. **Core tools installed**: pip 25.3, setuptools 80.10.1, wheel 0.46.3
4. **Training data generator created**: `ai-service/generate_training_data.py`
5. **Comprehensive requirements.txt**: Root and ai-service specific
6. **Setup scripts created**:
   - `scripts/setup_fresh.ps1` (Windows)
   - `scripts/setup_fresh.sh` (Mac/Linux)
7. **Documentation updated**: SETUP_INSTRUCTIONS.md

### ⚠️ Issue: PyTorch Installation Failing
**Problem**: Network connection dropping during PyTorch download (114MB file)
**Attempts**: 3 failed downloads at ~10-40MB (connection reset by remote host)
**Impact**: Cannot train model on Windows CPU without PyTorch

---

## 🚀 RECOMMENDED PATH: Mac M4 GPU Training

**Why Mac M4 is Better:**
- ✅ 10-20x faster training (GPU vs CPU)
- ✅ Larger batch sizes (32 vs 16)
- ✅ Training time: 10 min vs 75 min
- ✅ Better network connection (typically)
- ✅ Professional results faster

### Quick Mac M4 Setup (3 Commands)

```bash
# 1. Transfer project
git push  # From Windows
git pull  # On Mac M4

# 2. Run automated setup
chmod +x scripts/setup_fresh.sh
./scripts/setup_fresh.sh

# 3. Generate training data & train
source .venv/bin/activate
python ai-service/generate_training_data.py
python ai-service/train_yolov8_custom.py
```

**Done in ~20 minutes total!**

---

## 📦 Files Ready for Use

### 1. Training Data Generator
**Location**: `ai-service/generate_training_data.py`

**What it does**:
- Takes your current 300 images (50 per class)
- Generates 250 images per class using augmentation
- Total output: 1500 images (5x expansion)

**Augmentation techniques**:
- Brightness/contrast adjustments
- Rotation (-30° to +30°)
- Zoom & crop variations
- Blur & noise addition
- Horizontal flips
- Color jitter

**Usage**:
```bash
python ai-service/generate_training_data.py
```

**Customization**:
```python
# Edit line 23 in generate_training_data.py
TARGET_IMAGES_PER_CLASS = 250  # Change to 200, 500, etc.
```

### 2. Comprehensive Requirements
**Location**: `requirements.txt` (root)

**Includes**:
- PyTorch & TorchVision (with CPU/GPU/MPS support notes)
- Ultralytics YOLOv8 (8.0.217+)
- OpenCV (4.8.1+) - image processing
- FastAPI & Uvicorn - AI service API
- Scientific stack: NumPy, Matplotlib, Seaborn, scikit-learn
- Testing: pytest, pytest-cov, black, flake8
- Database: psycopg2, SQLAlchemy, GeoAlchemy2
- Security: bcrypt, cryptography, PyJWT
- Development: IPython, Jupyter, Notebook

**Total**: 50+ packages organized by category

### 3. Automated Setup Scripts

#### Windows: `scripts/setup_fresh.ps1`
- Checks Python 3.8+
- Creates fresh venv
- Upgrades pip
- Installs all dependencies
- Verifies GPU support (CUDA/MPS/CPU)
- Shows next steps

#### Mac/Linux: `scripts/setup_fresh.sh`
- Same functionality as Windows
- Optimized for Mac M4 (MPS support)
- Color-coded output
- Error handling

### 4. Setup Instructions
**Location**: `SETUP_INSTRUCTIONS.md`

**Contents**:
- 3 setup options (Mac M4, Windows, Global packages)
- Troubleshooting guide
- Network issue workarounds
- Quick start paths
- Documentation links

---

## 🔧 Windows Setup Options (If Not Using Mac)

### Option A: Retry PyTorch Installation

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Try with increased timeout
pip install --timeout 300 torch torchvision

# Or use alternative mirror
pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision

# Or download manually from: https://pytorch.org/get-started/locally/
# Then: pip install path\to\downloaded.whl
```

### Option B: Install Packages Individually

```powershell
.\.venv\Scripts\Activate.ps1

# Small packages first
pip install numpy pillow opencv-python matplotlib seaborn
pip install scikit-learn scipy tqdm colorama python-dotenv pyyaml

# PyTorch separately (retry if needed)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# YOLOv8 and utilities
pip install ultralytics fastapi uvicorn redis requests

# Development tools
pip install pytest pytest-cov black flake8
```

### Option C: Use Global Packages Temporarily

If packages already installed globally:

```powershell
# Check global packages
python -m pip list | Select-String "torch|ultralytics|opencv"

# If found, use directly (no venv)
python ai-service\generate_training_data.py
python ai-service\train_yolov8_custom.py
```

---

## 📊 Training Dataset Details

### Current State
```
training_data/
├── pothole/          50 images
├── garbage/          50 images
├── debris/           50 images
├── stray_cattle/     50 images
├── broken_road/      50 images
└── open_manhole/     50 images
Total: 300 images
```

### After Generation (Target: 250/class)
```
training_data/
├── pothole/          250 images (200 generated)
├── garbage/          250 images (200 generated)
├── debris/           250 images (200 generated)
├── stray_cattle/     250 images (200 generated)
├── broken_road/      250 images (200 generated)
└── open_manhole/     250 images (200 generated)
Total: 1500 images (1200 generated)
```

### Expected Accuracy Improvement
- **Current (50/class)**: ~60-70% accuracy
- **After (250/class)**: ~85-95% accuracy
- **Recommended for production**: 500+ images/class

---

## 🎓 Training Process Overview

### 1. Data Generation
```bash
python ai-service/generate_training_data.py
```
**Output**: Expanded dataset in `training_data/`

### 2. Training
```bash
python ai-service/train_yolov8_custom.py
```

**What happens**:
- Converts images to YOLO format → `dataset_yolo/`
- Creates data configuration → `data.yaml`
- Auto-detects device (GPU/CPU)
- Trains for 100 epochs
- Saves best model → `models/yolov8_civic_custom.pt`
- Generates training summary

**Training time**:
- Mac M4 GPU: ~10 minutes
- Windows CPU: ~75 minutes

### 3. Testing
```bash
python ai-service/test_yolov8_model.py
```

**Output**:
- Per-class accuracy
- Confusion matrix
- Confidence distribution plots
- Classification report
- Saved to `test_results/`

### 4. Deployment
- Update `ai-service/config.py`:
  ```python
  MODEL_PATH = './models/yolov8_civic_custom.pt'
  ```
- Test AI service: `python ai-service/src/main.py`
- Verify endpoints: `/classify`, `/model-info`, `/health`
- Commit and deploy

---

## 📝 What to Do Next

### Immediate (Choose One):

#### Path A: Mac M4 Training (RECOMMENDED)
```bash
# 1. Push current work
git add .
git commit -m "Ready for Mac M4 training"
git push

# 2. On Mac M4: Pull and setup
git pull
./scripts/setup_fresh.sh

# 3. Generate data and train
python ai-service/generate_training_data.py
python ai-service/train_yolov8_custom.py
```

#### Path B: Windows Training
```powershell
# 1. Retry PyTorch installation
.\.venv\Scripts\Activate.ps1
pip install --timeout 300 torch torchvision

# 2. Complete setup
.\scripts\setup_fresh.ps1

# 3. Generate and train
python ai-service\generate_training_data.py
python ai-service\train_yolov8_custom.py
```

#### Path C: Resume Previous Training
If you have checkpoint from earlier (Epoch 15/100):
```bash
python ai-service/resume_training.py
```

---

## 🔗 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | This guide - setup paths |
| [MAC_M4_TRAINING_GUIDE.md](MAC_M4_TRAINING_GUIDE.md) | Complete Mac M4 GPU setup |
| [TRAINING_QUICKSTART.md](TRAINING_QUICKSTART.md) | Quick training reference |
| [AI_MODEL_TRAINING_YOLOV8.md](AI_MODEL_TRAINING_YOLOV8.md) | Detailed training docs |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment |
| [QUICKSTART.md](QUICKSTART.md) | Project quick start |

---

## 💡 Pro Tips

1. **Best Results**: Train on Mac M4 with 500+ images per class
2. **Quick Test**: Use 100 images/class for fast testing
3. **Production**: Generate 500-1000 images/class for 95%+ accuracy
4. **Checkpoint**: Resume training anytime with `resume_training.py`
5. **Testing**: Always test trained model before deploying

---

## ❓ Troubleshooting

### "Connection reset" errors during pip install
- **Fix**: Use `--timeout 300` and `--retries 10`
- **Alternative**: Download `.whl` files manually
- **Best**: Switch to Mac M4 with better network

### VS Code shows import errors
- **Fix**: Select Python interpreter → `.venv/Scripts/python.exe`
- **Command**: Ctrl+Shift+P → "Python: Select Interpreter"

### "No module named 'ultralytics'"
- **Check**: `pip list | Select-String ultralytics`
- **Fix**: `pip install ultralytics`

### Mac M4 GPU not detected
- **Check**: `python -c "import torch; print(torch.backends.mps.is_available())"`
- **Fix**: Reinstall PyTorch with MPS support

---

## 📊 Summary

**Ready to use**:
✅ Fresh virtual environment (`.venv`)  
✅ Training data generator script  
✅ Comprehensive requirements file  
✅ Automated setup scripts (Windows & Mac)  
✅ Complete documentation  

**Next action**:
🎯 **Choose setup path** (Mac M4 recommended)  
🎯 **Generate expanded training data** (50 → 250 images/class)  
🎯 **Train YOLOv8 model** (100 epochs, ~10-75 min)  
🎯 **Test and deploy** to production  

**Estimated time to trained model**:
- Mac M4: 30 minutes (setup + generation + training)
- Windows: 2 hours (including retries)

---

**Last Updated**: 2025-01-26  
**Status**: Ready for training data generation and model training
