"""
YOLOv8 Custom Training for Civic Issue Detection
Train YOLOv8 on civic issue dataset for improved accuracy
"""

import os
import yaml
import shutil
from pathlib import Path
try:
    from ultralytics import YOLO
except ImportError:
    from ultralytics.models.yolo import YOLO
import cv2
import numpy as np
from PIL import Image
import json
from datetime import datetime
import torch

print("=" * 80)
print("YOLOv8 CIVIC ISSUE DETECTION - CUSTOM TRAINING")
print("=" * 80)

# Auto-detect GPU
if torch.cuda.is_available():
    DEVICE = 'cuda'
    print(f"\n✓ GPU DETECTED: {torch.cuda.get_device_name(0)}")
    print(f"  GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    BATCH_SIZE = 32  # Increase batch size for GPU
elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
    DEVICE = 'mps'  # Apple Silicon
    print(f"\n✓ Apple Silicon GPU detected, using MPS")
    BATCH_SIZE = 32
else:
    DEVICE = 'cpu'
    BATCH_SIZE = 16
    print("\n⚠ No GPU detected, using CPU (training will be slower)")

# Configuration
TRAINING_DATA_DIR = Path('training_data')
DATASET_DIR = Path('dataset_yolo')
MODEL_SIZE = 'n'  # n (nano), s (small), m (medium), l (large), x (xlarge)
EPOCHS = 100
IMG_SIZE = 640

# Issue type classes
ISSUE_CLASSES = {
    0: 'pothole',
    1: 'garbage',
    2: 'debris',
    3: 'stray_cattle',
    4: 'broken_road',
    5: 'open_manhole'
}

print(f"\nConfiguration:")
print(f"  Model Size: YOLOv8{MODEL_SIZE}")
print(f"  Epochs: {EPOCHS}")
print(f"  Batch Size: {BATCH_SIZE}")
print(f"  Image Size: {IMG_SIZE}")
print(f"  Device: {DEVICE}")
print(f"  Classes: {list(ISSUE_CLASSES.values())}")
print("=" * 80)

# Step 1: Prepare dataset in YOLO format
print("\n[1/6] Preparing dataset in YOLO format...")

def prepare_yolo_dataset():
    """Convert training data to YOLO format"""
    
    # Create directory structure
    for split in ['train', 'val']:
        (DATASET_DIR / split / 'images').mkdir(parents=True, exist_ok=True)
        (DATASET_DIR / split / 'labels').mkdir(parents=True, exist_ok=True)
    
    # Process each class
    image_count = {'train': 0, 'val': 0}
    
    for class_id, class_name in ISSUE_CLASSES.items():
        class_dir = TRAINING_DATA_DIR / class_name
        
        if not class_dir.exists():
            print(f"  Warning: {class_name} directory not found")
            continue
        
        images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        print(f"  Processing {class_name}: {len(images)} images")
        
        # Split 80-20 train-val
        split_idx = int(len(images) * 0.8)
        train_images = images[:split_idx]
        val_images = images[split_idx:]
        
        # Process train images
        for img_path in train_images:
            # Copy image
            dest_img = DATASET_DIR / 'train' / 'images' / f"{class_name}_{img_path.name}"
            shutil.copy(img_path, dest_img)
            
            # Create label file (full image is the object)
            img = Image.open(img_path)
            width, height = img.size
            
            # YOLO format: class_id x_center y_center width height (normalized)
            # For full image classification, bbox is entire image
            label_content = f"{class_id} 0.5 0.5 1.0 1.0\n"
            
            label_path = DATASET_DIR / 'train' / 'labels' / f"{class_name}_{img_path.stem}.txt"
            with open(label_path, 'w') as f:
                f.write(label_content)
            
            image_count['train'] += 1
        
        # Process val images
        for img_path in val_images:
            dest_img = DATASET_DIR / 'val' / 'images' / f"{class_name}_{img_path.name}"
            shutil.copy(img_path, dest_img)
            
            img = Image.open(img_path)
            width, height = img.size
            
            label_content = f"{class_id} 0.5 0.5 1.0 1.0\n"
            
            label_path = DATASET_DIR / 'val' / 'labels' / f"{class_name}_{img_path.stem}.txt"
            with open(label_path, 'w') as f:
                f.write(label_content)
            
            image_count['val'] += 1
    
    print(f"\n✓ Dataset prepared:")
    print(f"    Train: {image_count['train']} images")
    print(f"    Val: {image_count['val']} images")
    
    return image_count

image_counts = prepare_yolo_dataset()

# Step 2: Create data.yaml file
print("\n[2/6] Creating data.yaml configuration...")

data_yaml = {
    'path': str(DATASET_DIR.absolute()),
    'train': 'train/images',
    'val': 'val/images',
    'nc': len(ISSUE_CLASSES),
    'names': list(ISSUE_CLASSES.values())
}

yaml_path = DATASET_DIR / 'data.yaml'
with open(yaml_path, 'w') as f:
    yaml.dump(data_yaml, f)

print(f"✓ Configuration saved to {yaml_path}")

# Step 3: Initialize YOLOv8 model
print(f"\n[3/6] Initializing YOLOv8{MODEL_SIZE} model...")

model = YOLO(f'yolov8{MODEL_SIZE}.pt')
print(f"✓ Model loaded: YOLOv8{MODEL_SIZE}")

# Step 4: Train the model
print(f"\n[4/6] Training YOLOv8 on civic issue dataset...")
print("-" * 80)

results = model.train(
    data=str(yaml_path),
    epochs=EPOCHS,
    imgsz=IMG_SIZE,
    batch=BATCH_SIZE,
    device=DEVICE,
    patience=20,  # Early stopping patience
    save=True,
    save_period=10,  # Save checkpoint every 10 epochs
    cache=False,  # Don't cache images (memory intensive)
    project='runs/civic_issues',
    name='yolov8_training',
    exist_ok=True,
    pretrained=True,
    optimizer='Adam',
    verbose=True,
    seed=42,
    deterministic=True,
    single_cls=False,
    rect=False,
    cos_lr=True,  # Cosine learning rate scheduler
    lr0=0.01,  # Initial learning rate
    lrf=0.01,  # Final learning rate
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    warmup_momentum=0.8,
    box=7.5,  # Box loss gain
    cls=0.5,  # Classification loss gain
    dfl=1.5,  # DFL loss gain
    plots=True,  # Generate training plots
    val=True  # Validate during training
)

print("\n✓ Training complete!")

# Step 5: Validate model
print("\n[5/6] Validating trained model...")
print("-" * 80)

# Load best model
best_model_path = Path('runs/civic_issues/yolov8_training/weights/best.pt')
if best_model_path.exists():
    best_model = YOLO(best_model_path)
    
    # Validate
    metrics = best_model.val(data=str(yaml_path))
    
    print("\n" + "=" * 80)
    print("VALIDATION METRICS")
    print("=" * 80)
    print(f"mAP50:         {metrics.box.map50:.4f}")
    print(f"mAP50-95:      {metrics.box.map:.4f}")
    print(f"Precision:     {metrics.box.mp:.4f}")
    print(f"Recall:        {metrics.box.mr:.4f}")
    print("=" * 80)
    
    # Save to models directory
    final_model_path = Path('models/yolov8_civic_custom.pt')
    final_model_path.parent.mkdir(exist_ok=True)
    shutil.copy(best_model_path, final_model_path)
    print(f"\n✓ Best model saved to {final_model_path}")
else:
    print("Warning: Best model not found!")
    best_model = model

# Step 6: Test on sample images
print("\n[6/6] Testing on sample validation images...")
print("-" * 80)

# Get some validation images
val_images = list((DATASET_DIR / 'val' / 'images').glob('*.jpg'))[:10]

if val_images:
    print(f"\nTesting on {len(val_images)} sample images:")
    
    correct = 0
    total = 0
    
    for img_path in val_images:
        # Get true class from filename
        true_class = img_path.name.split('_')[0]
        
        # Predict
        results = best_model(img_path, verbose=False)
        
        if results and len(results) > 0 and len(results[0].boxes) > 0:
            # Get top prediction
            top_box = results[0].boxes[0]
            pred_class_id = int(top_box.cls[0])
            pred_class = ISSUE_CLASSES[pred_class_id]
            confidence = float(top_box.conf[0])
            
            is_correct = pred_class == true_class
            correct += int(is_correct)
            total += 1
            
            status = "✓" if is_correct else "✗"
            print(f"  {status} {img_path.name[:40]:40s} | True: {true_class:15s} | Pred: {pred_class:15s} | Conf: {confidence:.2f}")
        else:
            print(f"  ✗ {img_path.name[:40]:40s} | No detection")
            total += 1
    
    if total > 0:
        accuracy = (correct / total) * 100
        print(f"\n✓ Sample Accuracy: {correct}/{total} = {accuracy:.2f}%")
else:
    print("No validation images found for testing")

# Generate training summary
print("\n" + "=" * 80)
print("TRAINING SUMMARY")
print("=" * 80)

summary = {
    'model': f'YOLOv8{MODEL_SIZE}',
    'dataset': {
        'train_images': image_counts['train'],
        'val_images': image_counts['val'],
        'classes': list(ISSUE_CLASSES.values())
    },
    'training': {
        'epochs': EPOCHS,
        'batch_size': BATCH_SIZE,
        'img_size': IMG_SIZE,
        'device': DEVICE
    },
    'metrics': {
        'mAP50': float(metrics.box.map50) if 'metrics' in locals() else 0,
        'mAP50-95': float(metrics.box.map) if 'metrics' in locals() else 0,
        'precision': float(metrics.box.mp) if 'metrics' in locals() else 0,
        'recall': float(metrics.box.mr) if 'metrics' in locals() else 0
    },
    'timestamp': datetime.now().isoformat()
}

summary_path = 'runs/civic_issues/yolov8_training/training_summary.json'
os.makedirs(os.path.dirname(summary_path), exist_ok=True)
with open(summary_path, 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\nTraining Summary:")
print(f"  Model: YOLOv8{MODEL_SIZE}")
print(f"  Training Images: {image_counts['train']}")
print(f"  Validation Images: {image_counts['val']}")
print(f"  Final Model: models/yolov8_civic_custom.pt")
print(f"  Training Logs: runs/civic_issues/yolov8_training/")
print(f"  Summary: {summary_path}")
print("\n" + "=" * 80)
print("TRAINING COMPLETE!")
print("=" * 80)
print("\nNext steps:")
print("1. Review training plots in runs/civic_issues/yolov8_training/")
print("2. Test the model: python test_yolov8_model.py")
print("3. Update MODEL_PATH in .env to use custom model")
print("=" * 80)
