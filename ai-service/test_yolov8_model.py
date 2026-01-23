"""
YOLOv8 Model Testing & Evaluation
Comprehensive testing of trained YOLOv8 civic issue detector
"""

import os
from pathlib import Path
try:
    from ultralytics.yolo.engine.model import YOLO
except ImportError:
    from ultralytics.yolo.engine.model import YOLO
import cv2
import numpy as np
from PIL import Image
import json
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from collections import defaultdict

print("=" * 80)
print("YOLOv8 CIVIC ISSUE DETECTOR - COMPREHENSIVE TESTING")
print("=" * 80)

# Configuration
MODEL_PATH = 'models/yolov8_civic_custom.pt'  # Custom trained model
FALLBACK_MODEL = 'models/yolov8n.pt'  # Pretrained fallback
TEST_DATA_DIR = Path('training_data')  # Using training data for testing
CONFIDENCE_THRESHOLD = 0.25
DEVICE = 'cpu'

# Issue classes
ISSUE_CLASSES = {
    0: 'pothole',
    1: 'garbage',
    2: 'debris',
    3: 'stray_cattle',
    4: 'broken_road',
    5: 'open_manhole'
}

CLASS_TO_ID = {v: k for k, v in ISSUE_CLASSES.items()}

print(f"\nConfiguration:")
print(f"  Model: {MODEL_PATH}")
print(f"  Confidence Threshold: {CONFIDENCE_THRESHOLD}")
print(f"  Device: {DEVICE}")
print(f"  Classes: {list(ISSUE_CLASSES.values())}")
print("=" * 80)

# Load model
print("\n[1/5] Loading model...")
if Path(MODEL_PATH).exists():
    model = YOLO(MODEL_PATH)
    print(f"✓ Loaded custom model: {MODEL_PATH}")
elif Path(FALLBACK_MODEL).exists():
    model = YOLO(FALLBACK_MODEL)
    print(f"⚠ Custom model not found, using pretrained: {FALLBACK_MODEL}")
else:
    print("✗ No model found! Please train the model first.")
    exit(1)

# Collect test images
print("\n[2/5] Collecting test images...")
test_images = {}
total_images = 0

for class_name in ISSUE_CLASSES.values():
    class_dir = TEST_DATA_DIR / class_name
    if class_dir.exists():
        images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        # Use last 20% as test set
        test_split = int(len(images) * 0.8)
        test_images[class_name] = images[test_split:]
        total_images += len(test_images[class_name])
        print(f"  {class_name:20s}: {len(test_images[class_name])} images")
    else:
        print(f"  {class_name:20s}: Directory not found!")
        test_images[class_name] = []

print(f"\n✓ Total test images: {total_images}")

# Run predictions
print("\n[3/5] Running predictions...")
print("-" * 80)

predictions = []
ground_truth = []
detailed_results = []

for class_name, images in test_images.items():
    print(f"\nTesting {class_name} ({len(images)} images):")
    
    for img_path in images:
        # Run inference
        results = model(str(img_path), conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        true_label = class_name
        ground_truth.append(CLASS_TO_ID[true_label])
        
        if results and len(results) > 0 and len(results[0].boxes) > 0:
            # Get top prediction
            top_box = results[0].boxes[0]
            pred_class_id = int(top_box.cls[0])
            pred_class = ISSUE_CLASSES.get(pred_class_id, 'unknown')
            confidence = float(top_box.conf[0])
            
            predictions.append(pred_class_id)
            
            is_correct = pred_class == true_label
            status = "✓" if is_correct else "✗"
            
            detailed_results.append({
                'image': img_path.name,
                'true_class': true_label,
                'pred_class': pred_class,
                'confidence': confidence,
                'correct': is_correct
            })
            
            print(f"  {status} {img_path.name[:30]:30s} → {pred_class:15s} ({confidence:.2f})")
        else:
            # No detection
            predictions.append(-1)  # No prediction
            detailed_results.append({
                'image': img_path.name,
                'true_class': true_label,
                'pred_class': 'no_detection',
                'confidence': 0.0,
                'correct': False
            })
            print(f"  ✗ {img_path.name[:30]:30s} → NO DETECTION")

# Calculate metrics
print("\n[4/5] Calculating metrics...")
print("=" * 80)

# Filter out no-detections for sklearn metrics
valid_indices = [i for i, pred in enumerate(predictions) if pred != -1]
valid_predictions = [predictions[i] for i in valid_indices]
valid_ground_truth = [ground_truth[i] for i in valid_indices]

if len(valid_predictions) > 0:
    accuracy = accuracy_score(valid_ground_truth, valid_predictions)
    
    print("\nOVERALL METRICS")
    print("-" * 80)
    print(f"Total Images:        {len(predictions)}")
    print(f"Detected:            {len(valid_predictions)} ({len(valid_predictions)/len(predictions)*100:.1f}%)")
    print(f"No Detection:        {len(predictions) - len(valid_predictions)}")
    print(f"Accuracy (detected): {accuracy * 100:.2f}%")
    print(f"Accuracy (all):      {sum([1 for r in detailed_results if r['correct']])/len(detailed_results)*100:.2f}%")
    
    # Per-class metrics
    print("\nPER-CLASS METRICS")
    print("-" * 80)
    
    class_correct = defaultdict(int)
    class_total = defaultdict(int)
    
    for result in detailed_results:
        class_total[result['true_class']] += 1
        if result['correct']:
            class_correct[result['true_class']] += 1
    
    for class_name in ISSUE_CLASSES.values():
        total = class_total[class_name]
        correct = class_correct[class_name]
        acc = (correct / total * 100) if total > 0 else 0
        print(f"  {class_name:20s}: {correct:3d}/{total:3d} = {acc:6.2f}%")
    
    # Classification report
    if len(set(valid_ground_truth)) > 1:  # Need at least 2 classes
        print("\nDETAILED CLASSIFICATION REPORT")
        print("-" * 80)
        target_names = [ISSUE_CLASSES[i] for i in sorted(set(valid_ground_truth))]
        print(classification_report(valid_ground_truth, valid_predictions, 
                                   target_names=target_names, zero_division=0))
    
    # Confusion Matrix
    print("\nGenerating confusion matrix...")
    cm = confusion_matrix(valid_ground_truth, valid_predictions)
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=[ISSUE_CLASSES[i] for i in sorted(set(valid_predictions))],
        yticklabels=[ISSUE_CLASSES[i] for i in sorted(set(valid_ground_truth))],
        cbar_kws={'label': 'Count'}
    )
    plt.title('Confusion Matrix - YOLOv8 Civic Issue Detector', fontsize=16, fontweight='bold')
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    output_dir = Path('test_results')
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
    print(f"✓ Confusion matrix saved to {output_dir / 'confusion_matrix.png'}")
    
    # Confidence distribution
    plt.figure(figsize=(12, 6))
    
    correct_confs = [r['confidence'] for r in detailed_results if r['correct'] and r['confidence'] > 0]
    incorrect_confs = [r['confidence'] for r in detailed_results if not r['correct'] and r['confidence'] > 0]
    
    plt.subplot(1, 2, 1)
    plt.hist(correct_confs, bins=20, alpha=0.7, label='Correct', color='green')
    plt.hist(incorrect_confs, bins=20, alpha=0.7, label='Incorrect', color='red')
    plt.xlabel('Confidence Score')
    plt.ylabel('Frequency')
    plt.title('Confidence Distribution')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Per-class confidence
    plt.subplot(1, 2, 2)
    class_confs = defaultdict(list)
    for result in detailed_results:
        if result['confidence'] > 0:
            class_confs[result['true_class']].append(result['confidence'])
    
    positions = []
    data = []
    labels = []
    for i, class_name in enumerate(ISSUE_CLASSES.values()):
        if class_name in class_confs and class_confs[class_name]:
            positions.append(i)
            data.append(class_confs[class_name])
            labels.append(class_name)
    
    bp = plt.boxplot(data, positions=positions)
    plt.xticks(positions, labels)
    plt.xlabel('Issue Type')
    plt.ylabel('Confidence Score')
    plt.title('Confidence by Issue Type')
    plt.xticks(rotation=45, ha='right')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'confidence_analysis.png', dpi=300, bbox_inches='tight')
    print(f"✓ Confidence analysis saved to {output_dir / 'confidence_analysis.png'}")
    
else:
    print("✗ No valid predictions to analyze!")

# Save detailed results
print("\n[5/5] Saving test results...")

output_dir = Path('test_results')
output_dir.mkdir(exist_ok=True)

test_summary = {
    'model': MODEL_PATH,
    'confidence_threshold': CONFIDENCE_THRESHOLD,
    'total_images': len(predictions),
    'detected_images': len(valid_predictions),
    'no_detection': len(predictions) - len(valid_predictions),
    'accuracy_detected': float(accuracy) if len(valid_predictions) > 0 else 0,
    'accuracy_all': sum([1 for r in detailed_results if r['correct']])/len(detailed_results) if detailed_results else 0,
    'per_class_accuracy': {
        class_name: float(class_correct[class_name] / class_total[class_name]) if class_total[class_name] > 0 else 0
        for class_name in ISSUE_CLASSES.values()
    },
    'detailed_results': detailed_results,
    'timestamp': datetime.now().isoformat()
}

with open(output_dir / 'test_summary.json', 'w') as f:
    json.dump(test_summary, f, indent=2)

print(f"✓ Test summary saved to {output_dir / 'test_summary.json'}")

# Performance recommendations
print("\n" + "=" * 80)
print("PERFORMANCE ANALYSIS & RECOMMENDATIONS")
print("=" * 80)

if test_summary['accuracy_all'] >= 0.90:
    print("\n✓ EXCELLENT: Model performance is excellent (90%+ accuracy)")
elif test_summary['accuracy_all'] >= 0.75:
    print("\n⚠ GOOD: Model performance is good (75-90% accuracy)")
    print("  Recommendations:")
    print("  - Collect more training data for low-performing classes")
    print("  - Increase training epochs (current: 100)")
    print("  - Try larger model (YOLOv8m or YOLOv8l)")
else:
    print("\n✗ NEEDS IMPROVEMENT: Model performance needs improvement (<75% accuracy)")
    print("  Critical Recommendations:")
    print("  - Collect significantly more training data (100+ images per class)")
    print("  - Ensure diverse lighting and angles in training data")
    print("  - Increase model size (YOLOv8m or YOLOv8l)")
    print("  - Increase training epochs (200+)")
    print("  - Check data quality and labeling accuracy")

# Low confidence warnings
low_conf_threshold = 0.5
low_conf_count = sum([1 for r in detailed_results if 0 < r['confidence'] < low_conf_threshold])
if low_conf_count > 0:
    print(f"\n⚠ Warning: {low_conf_count} predictions have confidence < {low_conf_threshold}")
    print(f"  Consider increasing CONFIDENCE_THRESHOLD to {low_conf_threshold} in production")

# No detection warnings
no_detect_count = len(predictions) - len(valid_predictions)
if no_detect_count > len(predictions) * 0.1:
    print(f"\n⚠ Warning: {no_detect_count} images had no detections ({no_detect_count/len(predictions)*100:.1f}%)")
    print("  This may indicate:")
    print("  - Model not trained on these types of images")
    print("  - Confidence threshold too high")
    print("  - Training data doesn't match test data characteristics")

print("\n" + "=" * 80)
print("TESTING COMPLETE!")
print("=" * 80)
print(f"\nResults saved to: {output_dir}")
print("\nNext steps:")
print("1. Review test_summary.json for detailed results")
print("2. Check confusion_matrix.png and confidence_analysis.png")
print("3. If performance is good, update .env MODEL_PATH to use this model")
print("4. If performance needs improvement, retrain with more data or larger model")
print("=" * 80)
