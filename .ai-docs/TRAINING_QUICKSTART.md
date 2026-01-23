# YOLOv8 Training - Quick Start Guide

## 📌 Current Status
- Training interrupted at **Epoch 15/100** on Windows CPU
- Dataset prepared: 240 train, 60 val images (6 classes)
- Model showing progress: mAP50 = 0.431 (43% accuracy)

---

## 🚀 Option 1: Mac M4 (RECOMMENDED - 10x Faster!)

### Transfer & Train on Mac M4
```bash
# 1. On Mac, clone/pull repository
git clone https://github.com/KrishanYadav333/AI-Based-Civic-Issue-Monitoring-System.git
cd AI-Based-Civic-Issue-Monitoring-System
git checkout dev-anuj

# 2. Setup environment
bash scripts/setup_mac_m4.sh

# 3. Activate environment
cd ai-service
source venv_m4/bin/activate

# 4. Verify GPU
python -c "import torch; print('MPS Available:', torch.backends.mps.is_available())"
# Expected: MPS Available: True

# 5. Run training (8-15 minutes)
python train_yolov8_custom.py

# 6. Test model
python test_yolov8_model.py

# 7. Commit trained model
git add models/yolov8_civic_custom.pt
git commit -m "Add trained YOLOv8 model"
git push origin dev-anuj
```

### Back on Windows
```bash
git pull origin dev-anuj
# Now you have the trained model!
```

**Time**: ~15 minutes total (setup + training + testing)

---

## 💻 Option 2: Windows CPU (Continue Current Training)

### Resume from checkpoint
```bash
cd "d:\Hackathon\AI civic issue monitor\ai-service"
python resume_training.py
```

**Time**: ~60 minutes remaining (85 epochs left)

---

## ☁️ Option 3: Google Colab (Free Tesla T4 GPU)

### 1. Prepare Data
```bash
# On Windows, zip training data
cd "d:\Hackathon\AI civic issue monitor\ai-service"
Compress-Archive -Path training_data -DestinationPath training_data.zip
```

### 2. Open Colab
- Go to https://colab.research.google.com/
- File → New Notebook
- Runtime → Change runtime type → GPU (T4) → Save

### 3. Setup & Upload
```python
# Install packages
!pip install ultralytics opencv-python pillow matplotlib seaborn scikit-learn

# Upload files
from google.colab import files
uploaded = files.upload()  # Upload: training_data.zip, train_yolov8_custom.py

# Extract data
!unzip training_data.zip
```

### 4. Train
```python
!python train_yolov8_custom.py
```

### 5. Download Model
```python
files.download('models/yolov8_civic_custom.pt')
```

**Time**: ~10 minutes (upload + training + download)

---

## 🎯 Recommendation

**Use Mac M4** if available:
- ✅ Fastest setup (one-time)
- ✅ 10x faster than Windows CPU
- ✅ No file size limits
- ✅ Full control
- ✅ Reusable environment

**Use Google Colab** if Mac unavailable:
- ✅ Free Tesla T4 GPU
- ✅ No local setup needed
- ⚠️ File upload/download required
- ⚠️ Session timeout (12 hours)

**Continue Windows CPU** only if:
- ❌ No other option available
- ⏳ 60 more minutes of training

---

## 📊 After Training

### 1. Test Model
```bash
python test_yolov8_model.py
```

Check output:
- `test_results/test_summary.json` - Accuracy metrics
- `test_results/confusion_matrix.png` - Visualization
- `test_results/confidence_analysis.png` - Confidence scores

### 2. Update Config
```python
# ai-service/src/config.py
MODEL_PATH = './models/yolov8_civic_custom.pt'  # Use custom model
```

Or use environment variable:
```bash
# .env
MODEL_PATH=./models/yolov8_civic_custom.pt
```

### 3. Test Integration
```bash
# Start AI service
cd ai-service
python src/main.py

# In another terminal, test endpoint
curl -X POST "http://localhost:8000/classify" \
  -F "file=@test_image.jpg"
```

### 4. Deploy
```bash
# Commit changes
git add models/yolov8_civic_custom.pt
git add src/config.py
git commit -m "Deploy trained YOLOv8 model"
git push origin dev-anuj

# Merge to main
git checkout main
git merge dev-anuj
git push origin main
```

---

## 🔧 Troubleshooting

### Import Errors in VS Code
These are just linting errors - code runs fine. To fix:
1. Open VS Code Command Palette (Ctrl+Shift+P)
2. "Python: Select Interpreter"
3. Choose: `Python 3.13.5 ('.venv': venv)`

Or reload VS Code after training completes.

### Training Interrupted
```bash
# Resume from last checkpoint
python resume_training.py
```

### Out of Memory
```python
# In train_yolov8_custom.py, reduce batch size
BATCH_SIZE = 8  # Instead of 16 or 32
```

### Model Not Found
```bash
# Check if training completed
ls models/yolov8_civic_custom.pt

# If not, check runs folder
ls runs/civic_issues/yolov8_training/weights/best.pt

# Copy manually if needed
cp runs/civic_issues/yolov8_training/weights/best.pt models/yolov8_civic_custom.pt
```

---

## 📁 Files Reference

```
ai-service/
├── train_yolov8_custom.py         # Main training script
├── resume_training.py              # Resume after interruption
├── test_yolov8_model.py            # Comprehensive testing
├── training_data/                  # Source images (6 classes × 50)
├── dataset_yolo/                   # YOLO format (auto-generated)
├── models/
│   └── yolov8_civic_custom.pt     # Trained model (6MB) ✅
├── runs/                           # Training logs & checkpoints
└── test_results/                   # Test outputs & visualizations
```

---

## ⏱️ Time Estimates

| Task | Mac M4 | Windows CPU | Colab T4 |
|------|--------|-------------|----------|
| Setup | 5 min | 0 min | 5 min |
| Training (100 epochs) | 10 min | 75 min | 8 min |
| Testing | 2 min | 2 min | 2 min |
| **Total** | **17 min** | **77 min** | **15 min** |

---

**Next Action**: Choose your preferred option and follow the steps above!

See `MAC_M4_TRAINING_GUIDE.md` for detailed Mac M4 instructions.
