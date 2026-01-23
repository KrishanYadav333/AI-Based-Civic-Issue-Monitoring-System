# AI Models

## Trained Models in Repository

### YOLOv8 Civic Issue Detection Model

**Location**: `runs/detect/runs/civic_issues/yolov8_training/weights/best.pt`

**Model Details**:
- **Base Model**: YOLOv8n (nano - lightweight for fast inference)
- **Training Dataset**: Civic issues (potholes, garbage, debris, stray cattle, broken roads, open manholes)
- **Format**: PyTorch (.pt)
- **Size**: ~6.5 MB (YOLOv8n base model is efficient)

**Usage in AI Service**:
```python
from ultralytics import YOLO

# Load the trained model
model = YOLO('runs/detect/runs/civic_issues/yolov8_training/weights/best.pt')

# Run inference
results = model(image_path)
```

## Model Files Structure

```
ai-service/
├── yolov8n.pt                    # Base pretrained YOLOv8n model (6.5 MB) ✅ Tracked
└── models/
    └── .gitkeep

runs/
└── detect/
    └── runs/
        └── civic_issues/
            └── yolov8_training/
                └── weights/
                    └── best.pt   # Final trained model ✅ Tracked in Git
```

## Why Only `best.pt` is Tracked

The training process generates many checkpoint files (epoch0.pt, epoch10.pt, etc.), but we only track:
- **best.pt**: The best-performing model based on validation metrics
- **yolov8n.pt**: Base pretrained model for retraining

This keeps the repository size manageable while preserving essential models.

## Model Size Considerations

- **YOLOv8n base**: ~6.5 MB
- **Trained best.pt**: ~6-8 MB (similar to base since we fine-tuned)
- **Total**: <15 MB (well within GitHub limits)

GitHub allows files up to 100 MB, and total repo size up to 1 GB for free accounts.

## Retraining the Model

If you need to retrain:

1. **Training data** is in `ai-service/training_data/` (tracked in repo for M4 training)
2. **Training script**: `ai-service/train_yolov8_custom.py`
3. **Resume training**: `ai-service/resume_training.py`

See `.ai-docs/MAC_M4_TRAINING_GUIDE.md` for Mac M4 GPU training instructions.

## Using the Model in Production

The AI service (`ai-service/app.py`) automatically loads the trained model:

```python
# In app.py
MODEL_PATH = 'runs/detect/runs/civic_issues/yolov8_training/weights/best.pt'

if os.path.exists(MODEL_PATH):
    model = YOLO(MODEL_PATH)
else:
    # Fallback to base model
    model = YOLO('yolov8n.pt')
```

## Model Performance

The trained model detects:
- Potholes
- Garbage accumulation
- Road debris
- Stray cattle
- Broken roads
- Open manholes

With confidence scores and bounding boxes for each detection.

---

**Note**: Training artifacts (dataset_yolo/, ai-service/runs/, epoch checkpoints) are gitignored to keep the repo clean. Only essential models are tracked.
