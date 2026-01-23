"""
Enhanced AI Model Training Script
Improves accuracy with advanced techniques
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import json
from datetime import datetime

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
TRAIN_DIR = 'training_data'
MODEL_SAVE_PATH = 'models/best_model_enhanced.keras'
LOG_DIR = f'logs/training_{datetime.now().strftime("%Y%m%d_%H%M%S")}'

# Issue types
ISSUE_TYPES = ['broken_road', 'debris', 'garbage', 'open_manhole', 'pothole', 'stray_cattle']

print("=" * 80)
print("ENHANCED AI MODEL TRAINING - CIVIC ISSUE CLASSIFICATION")
print("=" * 80)
print(f"Image Size: {IMG_SIZE}x{IMG_SIZE}")
print(f"Batch Size: {BATCH_SIZE}")
print(f"Max Epochs: {EPOCHS}")
print(f"Learning Rate: {LEARNING_RATE}")
print(f"Issue Types: {', '.join(ISSUE_TYPES)}")
print("=" * 80)

# Advanced Data Augmentation
print("\n[1/8] Setting up data augmentation...")
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=40,  # Increased from 30
    width_shift_range=0.3,  # Increased from 0.2
    height_shift_range=0.3,  # Increased from 0.2
    shear_range=0.3,  # Increased from 0.2
    zoom_range=0.3,  # Increased from 0.2
    horizontal_flip=True,
    vertical_flip=True,  # NEW: Added vertical flip
    brightness_range=[0.7, 1.3],  # NEW: Brightness variation
    fill_mode='nearest',
    validation_split=0.2  # 80-20 split
)

# Validation data (no augmentation except rescaling)
validation_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

print("✓ Data augmentation configured")

# Load training data
print("\n[2/8] Loading training data...")
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True,
    seed=42
)

validation_generator = validation_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False,
    seed=42
)

print(f"✓ Training samples: {train_generator.samples}")
print(f"✓ Validation samples: {validation_generator.samples}")
print(f"✓ Classes: {train_generator.class_indices}")

# Save class indices
class_indices = {v: k for k, v in train_generator.class_indices.items()}
with open('models/class_indices_enhanced.json', 'w') as f:
    json.dump(class_indices, f, indent=2)
print("✓ Class indices saved")

# Build Enhanced Model with EfficientNetB3
print("\n[3/8] Building enhanced model...")
def create_enhanced_model():
    """Create model with EfficientNetB3 backbone"""
    
    # Input layer
    inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    
    # Data preprocessing
    x = layers.Rescaling(1./255)(inputs)
    
    # Base model: EfficientNetB3 (better than MobileNetV2)
    base_model = EfficientNetB3(
        include_top=False,
        weights='imagenet',
        input_tensor=x,
        pooling='avg'
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Get base model output
    x = base_model.output
    
    # Add regularization and dense layers
    x = layers.Dropout(0.3)(x)  # Increased dropout
    x = layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    # Output layer
    outputs = layers.Dense(len(ISSUE_TYPES), activation='softmax', name='predictions')(x)
    
    # Create model
    model = keras.Model(inputs=inputs, outputs=outputs, name='civic_issue_classifier_enhanced')
    
    return model, base_model

model, base_model = create_enhanced_model()

print("✓ Model architecture created")
print(f"✓ Total parameters: {model.count_params():,}")
print(f"✓ Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")

# Compile model
print("\n[4/8] Compiling model...")
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=[
        'accuracy',
        keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy'),
        keras.metrics.Precision(name='precision'),
        keras.metrics.Recall(name='recall')
    ]
)
print("✓ Model compiled")

# Callbacks
print("\n[5/8] Setting up callbacks...")
callbacks = [
    ModelCheckpoint(
        MODEL_SAVE_PATH,
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    ),
    TensorBoard(
        log_dir=LOG_DIR,
        histogram_freq=1
    )
]
print("✓ Callbacks configured")

# Phase 1: Train with frozen base model
print("\n[6/8] Phase 1: Training with frozen base model...")
print("-" * 80)
history_phase1 = model.fit(
    train_generator,
    epochs=20,  # First 20 epochs
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1
)
print("✓ Phase 1 training complete")

# Phase 2: Fine-tune with unfrozen layers
print("\n[7/8] Phase 2: Fine-tuning with unfrozen layers...")
print("-" * 80)

# Unfreeze the last 50 layers of base model
base_model.trainable = True
for layer in base_model.layers[:-50]:
    layer.trainable = False

print(f"✓ Unfrozen last 50 layers")
print(f"✓ New trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")

# Recompile with lower learning rate
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
    loss='categorical_crossentropy',
    metrics=[
        'accuracy',
        keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy'),
        keras.metrics.Precision(name='precision'),
        keras.metrics.Recall(name='recall')
    ]
)

# Continue training
history_phase2 = model.fit(
    train_generator,
    epochs=30,  # Additional 30 epochs
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1,
    initial_epoch=history_phase1.epoch[-1]
)
print("✓ Phase 2 fine-tuning complete")

# Evaluation
print("\n[8/8] Evaluating final model...")
print("-" * 80)

# Load best model
best_model = keras.models.load_model(MODEL_SAVE_PATH)

# Evaluate on validation set
val_loss, val_accuracy, val_top2_acc, val_precision, val_recall = best_model.evaluate(
    validation_generator,
    verbose=0
)

print(f"\n{'='*80}")
print("FINAL MODEL PERFORMANCE")
print(f"{'='*80}")
print(f"Validation Loss:        {val_loss:.4f}")
print(f"Validation Accuracy:    {val_accuracy * 100:.2f}%")
print(f"Top-2 Accuracy:         {val_top2_acc * 100:.2f}%")
print(f"Precision:              {val_precision:.4f}")
print(f"Recall:                 {val_recall:.4f}")
print(f"F1-Score:               {2 * (val_precision * val_recall) / (val_precision + val_recall):.4f}")
print(f"{'='*80}")

# Generate predictions for confusion matrix
print("\nGenerating detailed classification report...")
validation_generator.reset()
y_pred = best_model.predict(validation_generator, verbose=1)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = validation_generator.classes

# Classification report
print("\nClassification Report:")
print("-" * 80)
report = classification_report(
    y_true,
    y_pred_classes,
    target_names=ISSUE_TYPES,
    digits=4
)
print(report)

# Confusion Matrix
print("\nGenerating confusion matrix...")
cm = confusion_matrix(y_true, y_pred_classes)

plt.figure(figsize=(12, 10))
sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=ISSUE_TYPES,
    yticklabels=ISSUE_TYPES,
    cbar_kws={'label': 'Count'}
)
plt.title('Confusion Matrix - Enhanced Model', fontsize=16, fontweight='bold')
plt.ylabel('True Label', fontsize=12)
plt.xlabel('Predicted Label', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(f'{LOG_DIR}/confusion_matrix.png', dpi=300, bbox_inches='tight')
print(f"✓ Confusion matrix saved to {LOG_DIR}/confusion_matrix.png")

# Plot training history
print("\nGenerating training history plots...")
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Combine both phases
all_history = {
    'accuracy': history_phase1.history['accuracy'] + history_phase2.history['accuracy'],
    'val_accuracy': history_phase1.history['val_accuracy'] + history_phase2.history['val_accuracy'],
    'loss': history_phase1.history['loss'] + history_phase2.history['loss'],
    'val_loss': history_phase1.history['val_loss'] + history_phase2.history['val_loss'],
}

# Accuracy plot
axes[0, 0].plot(all_history['accuracy'], label='Training Accuracy', linewidth=2)
axes[0, 0].plot(all_history['val_accuracy'], label='Validation Accuracy', linewidth=2)
axes[0, 0].axvline(x=20, color='r', linestyle='--', label='Fine-tuning Start')
axes[0, 0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
axes[0, 0].set_xlabel('Epoch')
axes[0, 0].set_ylabel('Accuracy')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Loss plot
axes[0, 1].plot(all_history['loss'], label='Training Loss', linewidth=2)
axes[0, 1].plot(all_history['val_loss'], label='Validation Loss', linewidth=2)
axes[0, 1].axvline(x=20, color='r', linestyle='--', label='Fine-tuning Start')
axes[0, 1].set_title('Model Loss', fontsize=14, fontweight='bold')
axes[0, 1].set_xlabel('Epoch')
axes[0, 1].set_ylabel('Loss')
axes[0, 1].legend()
axes[0, 1].grid(True, alpha=0.3)

# Per-class accuracy
class_accuracies = []
for i, issue_type in enumerate(ISSUE_TYPES):
    mask = y_true == i
    if mask.sum() > 0:
        acc = (y_pred_classes[mask] == i).sum() / mask.sum()
        class_accuracies.append(acc)
    else:
        class_accuracies.append(0)

axes[1, 0].bar(range(len(ISSUE_TYPES)), class_accuracies, color='skyblue', edgecolor='navy')
axes[1, 0].set_title('Per-Class Accuracy', fontsize=14, fontweight='bold')
axes[1, 0].set_xlabel('Issue Type')
axes[1, 0].set_ylabel('Accuracy')
axes[1, 0].set_xticks(range(len(ISSUE_TYPES)))
axes[1, 0].set_xticklabels(ISSUE_TYPES, rotation=45, ha='right')
axes[1, 0].set_ylim([0, 1])
axes[1, 0].grid(True, axis='y', alpha=0.3)

# Add accuracy values on bars
for i, acc in enumerate(class_accuracies):
    axes[1, 0].text(i, acc + 0.02, f'{acc*100:.1f}%', ha='center', fontweight='bold')

# Learning rate schedule
if 'lr' in history_phase1.history:
    all_lr = history_phase1.history['lr'] + history_phase2.history['lr']
    axes[1, 1].plot(all_lr, linewidth=2, color='green')
    axes[1, 1].axvline(x=20, color='r', linestyle='--', label='Fine-tuning Start')
    axes[1, 1].set_title('Learning Rate Schedule', fontsize=14, fontweight='bold')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Learning Rate')
    axes[1, 1].set_yscale('log')
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)
else:
    axes[1, 1].text(0.5, 0.5, 'Learning rate history\nnot available', 
                    ha='center', va='center', fontsize=12)
    axes[1, 1].set_title('Learning Rate Schedule', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig(f'{LOG_DIR}/training_history.png', dpi=300, bbox_inches='tight')
print(f"✓ Training history saved to {LOG_DIR}/training_history.png")

# Save training summary
print("\nSaving training summary...")
summary = {
    'model_name': 'civic_issue_classifier_enhanced',
    'backbone': 'EfficientNetB3',
    'image_size': IMG_SIZE,
    'batch_size': BATCH_SIZE,
    'total_epochs': len(all_history['accuracy']),
    'phase1_epochs': 20,
    'phase2_epochs': 30,
    'initial_learning_rate': LEARNING_RATE,
    'final_learning_rate': LEARNING_RATE / 10,
    'training_samples': train_generator.samples,
    'validation_samples': validation_generator.samples,
    'final_metrics': {
        'val_loss': float(val_loss),
        'val_accuracy': float(val_accuracy),
        'top_2_accuracy': float(val_top2_acc),
        'precision': float(val_precision),
        'recall': float(val_recall),
        'f1_score': float(2 * (val_precision * val_recall) / (val_precision + val_recall))
    },
    'per_class_accuracy': {
        ISSUE_TYPES[i]: float(class_accuracies[i]) 
        for i in range(len(ISSUE_TYPES))
    },
    'timestamp': datetime.now().isoformat()
}

with open(f'{LOG_DIR}/training_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)
print(f"✓ Summary saved to {LOG_DIR}/training_summary.json")

print("\n" + "=" * 80)
print("TRAINING COMPLETE!")
print("=" * 80)
print(f"Best model saved at: {MODEL_SAVE_PATH}")
print(f"Logs and visualizations: {LOG_DIR}")
print(f"Final validation accuracy: {val_accuracy * 100:.2f}%")
print("=" * 80)
