"""
Resume YOLOv8 Training from Last Checkpoint
Use this if training was interrupted
"""

import os
from pathlib import Path
from ultralytics import YOLO
import torch

print("=" * 80)
print("YOLOv8 TRAINING RESUME")
print("=" * 80)

# Auto-detect device
if torch.cuda.is_available():
    DEVICE = 'cuda'
    print(f"\n✓ GPU (CUDA): {torch.cuda.get_device_name(0)}")
elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
    DEVICE = 'mps'
    print("\n✓ Apple Silicon GPU (MPS)")
else:
    DEVICE = 'cpu'
    print("\n⚠ CPU (slower)")

# Find last checkpoint
checkpoint_dir = Path('runs/civic_issues/yolov8_training/weights')
last_checkpoint = checkpoint_dir / 'last.pt'

if last_checkpoint.exists():
    print(f"\n✓ Found checkpoint: {last_checkpoint}")
    print("\nResuming training from last checkpoint...")
    print("-" * 80)
    
    # Resume training
    model = YOLO(str(last_checkpoint))
    results = model.train(
        resume=True,  # Resume from checkpoint
        device=DEVICE
    )
    
    print("\n" + "=" * 80)
    print("TRAINING RESUMED AND COMPLETED!")
    print("=" * 80)
    print(f"\n✓ Best model: runs/civic_issues/yolov8_training/weights/best.pt")
    print(f"✓ Copy to: models/yolov8_civic_custom.pt")
    
    # Copy best model to models directory
    import shutil
    best_model = checkpoint_dir / 'best.pt'
    if best_model.exists():
        shutil.copy(best_model, 'models/yolov8_civic_custom.pt')
        print(f"\n✓ Model copied to: models/yolov8_civic_custom.pt")
else:
    print(f"\n✗ No checkpoint found at: {last_checkpoint}")
    print("\nPlease run the full training:")
    print("  python train_yolov8_custom.py")
