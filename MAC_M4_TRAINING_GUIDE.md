# YOLOv8 Training on Mac M4 - GPU Accelerated Setup

## 🚀 Mac M4 Setup (Metal Performance Shaders - 10x Faster!)

Your Mac M4 has excellent GPU support via Apple's MPS (Metal Performance Shaders). This will train **10-20x faster** than CPU!

---

## Step 1: Setup on Mac M4

### 1.1 Install Python & Dependencies
```bash
# On your Mac M4:
cd ai-service

# Create virtual environment
python3 -m venv venv_m4
source venv_m4/bin/activate

# Install PyTorch with MPS support (Apple Silicon GPU)
pip install --upgrade pip
pip install torch torchvision torchaudio

# Install YOLOv8 and dependencies
pip install -r requirements.txt

# Verify GPU detection
python -c "import torch; print('MPS Available:', torch.backends.mps.is_available()); print('MPS Built:', torch.backends.mps.is_built())"
```

Expected output:
```
MPS Available: True
MPS Built: True
```

---

## Step 2: Transfer Training Data to Mac

### Option A: Git (If data is small)
```bash
# On Windows, commit training data
git add ai-service/training_data/
git commit -m "Add civic issue training dataset"
git push origin dev-anuj

# On Mac, pull
git pull origin dev-anuj
```

### Option B: Direct Transfer (Recommended for large datasets)
```bash
# Using SCP (from Windows to Mac)
scp -r "d:\Hackathon\AI civic issue monitor\ai-service\training_data" user@mac-ip:~/project/ai-service/

# Or use AirDrop, USB drive, cloud storage
```

### Option C: Use existing data
If data already on Mac, just ensure it's in `ai-service/training_data/` with 6 subdirectories:
- broken_road/ (50 images)
- debris/ (50 images)
- garbage/ (50 images)
- open_manhole/ (50 images)
- pothole/ (50 images)
- stray_cattle/ (50 images)

---

## Step 3: Run Training on Mac M4

```bash
# Activate virtual environment
cd ~/project/ai-service
source venv_m4/bin/activate

# Run training (GPU will auto-detect)
python train_yolov8_custom.py
```

### What to Expect:
```
================================================================================
YOLOv8 CIVIC ISSUE DETECTION - CUSTOM TRAINING
================================================================================

✓ Apple Silicon GPU detected, using MPS

Configuration:
  Model Size: YOLOv8n
  Epochs: 100
  Batch Size: 32  # Increased from 16 for GPU
  Image Size: 640
  Device: mps
  Classes: ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
```

### Training Speed Comparison:
| Device | Time per Epoch | Total Time (100 epochs) |
|--------|---------------|-------------------------|
| CPU (Windows) | ~45s | ~75 minutes |
| **Mac M4 GPU** | **~5-10s** | **~8-15 minutes** ⚡ |
| Google Colab (T4) | ~3-5s | ~5-8 minutes |

---

## Step 4: Monitor Training

Training will show progress like:
```
      Epoch    GPU_mem   box_loss   cls_loss   dfl_loss  Instances       Size
      1/100      0.5G     0.6008      2.529      1.281         40        640
      ...
     50/100      0.5G     0.3421      0.534      0.892         48        640
     ...
    100/100      0.5G     0.2105      0.312      0.745         52        640

✓ Training complete!
✓ Best model saved: models/yolov8_civic_custom.pt
```

---

## Step 5: Transfer Model Back to Windows

### Option A: Git
```bash
# On Mac, commit trained model
git add ai-service/models/yolov8_civic_custom.pt
git add ai-service/training_summary.json
git commit -m "Add trained YOLOv8 civic issue model"
git push origin dev-anuj

# On Windows, pull
git pull origin dev-anuj
```

### Option B: Direct Transfer
```bash
# SCP from Mac to Windows
scp ~/project/ai-service/models/yolov8_civic_custom.pt user@windows-ip:"d:\Hackathon\AI civic issue monitor\ai-service\models\"
```

---

## Step 6: Test Model on Windows

```bash
# On Windows
cd "d:\Hackathon\AI civic issue monitor\ai-service"
python test_yolov8_model.py
```

---

## Alternative: Google Colab (Free Tesla T4 GPU)

If Mac is unavailable, use Google Colab:

### 1. Open Colab Notebook
Go to: https://colab.research.google.com/

### 2. Enable GPU
- Runtime → Change runtime type → GPU → T4 GPU → Save

### 3. Setup Environment
```python
# Install dependencies
!pip install ultralytics opencv-python pillow matplotlib seaborn scikit-learn

# Upload training data (or mount Google Drive)
from google.colab import files
import zipfile

# Option A: Upload zip
uploaded = files.upload()  # Upload training_data.zip
!unzip training_data.zip

# Option B: Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')
```

### 4. Upload Training Script
```python
# Upload train_yolov8_custom.py or copy-paste code
from google.colab import files
uploaded = files.upload()
```

### 5. Run Training
```python
!python train_yolov8_custom.py
```

### 6. Download Model
```python
from google.colab import files
files.download('models/yolov8_civic_custom.pt')
```

---

## Troubleshooting

### Mac M4: MPS Not Available
```bash
# Check PyTorch version (need 2.0+)
python -c "import torch; print(torch.__version__)"

# Reinstall if needed
pip uninstall torch torchvision
pip install torch torchvision
```

### Mac M4: Out of Memory
```python
# In train_yolov8_custom.py, reduce batch size
BATCH_SIZE = 16  # Instead of 32
```

### Training Interrupted (KeyboardInterrupt)
The training was manually stopped (Ctrl+C). The script auto-detected GPU as MPS. Simply restart:
```bash
python train_yolov8_custom.py
```

YOLOv8 will resume from the last checkpoint if `resume=True` is set.

---

## Performance Expectations

### With 300 Images (50 per class):
- **Training Time**: 8-15 minutes on Mac M4
- **Expected Accuracy**: 75-85%
- **Model Size**: ~6MB
- **Production Ready**: Yes for MVP/Demo

### Recommended for Production:
- **Dataset Size**: 200-500 images per class
- **Expected Accuracy**: 90-95%
- **Retraining Time**: 30-60 minutes on Mac M4

---

## Current Training Status (Windows CPU)

Your Windows CPU training was at **Epoch 15/100** with:
- mAP50: 0.431 (43.1% accuracy)
- Precision: 0.737
- Recall: 0.3

**Next Steps**:
1. ✅ Transfer to Mac M4 for GPU acceleration
2. ⏩ Complete 100 epochs (~10 minutes on M4)
3. 🧪 Test model with test_yolov8_model.py
4. 🚀 Deploy trained model to production

---

## Files Generated

```
ai-service/
├── models/
│   └── yolov8_civic_custom.pt        # 6MB trained model ✅
├── dataset_yolo/                      # YOLO format data (git ignored)
├── runs/                              # Training logs (git ignored)
│   └── civic_issues/
│       └── yolov8_training/
│           ├── weights/
│           │   ├── best.pt
│           │   └── last.pt
│           ├── results.png           # Training curves
│           ├── confusion_matrix.png
│           └── *.csv                 # Metrics
├── training_summary.json             # Training results ✅
└── test_results/                     # Test outputs
    ├── confusion_matrix.png
    ├── confidence_analysis.png
    └── test_summary.json
```

---

## Quick Commands Reference

### Mac M4
```bash
# Setup
python3 -m venv venv_m4 && source venv_m4/bin/activate
pip install -r requirements.txt

# Train
python train_yolov8_custom.py

# Test
python test_yolov8_model.py

# Check GPU
python -c "import torch; print('MPS:', torch.backends.mps.is_available())"
```

### Windows
```bash
# Test trained model
python test_yolov8_model.py

# Update config to use custom model
# Edit: ai-service/src/config.py
# MODEL_PATH = './models/yolov8_civic_custom.pt'

# Start AI service
python src/main.py
```

---

**Recommendation**: Use **Mac M4** for 10x faster training! 🚀

Transfer training_data/ to Mac, run training (~10 mins), transfer model back to Windows for testing and deployment.
