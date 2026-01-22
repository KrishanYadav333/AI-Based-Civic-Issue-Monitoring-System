"""
Improved ML Training Pipeline for Civic Issue Classification
Uses CNN with transfer learning (MobileNetV2) for real image classification
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import os
import json
from pathlib import Path
import logging
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Issue type categories matching our system
ISSUE_CATEGORIES = [
    'pothole',
    'garbage',
    'broken_road',
    'open_manhole',
    'debris',
    'stray_cattle'
]

class CivicIssueTrainer:
    def __init__(self, data_dir='training_data', model_dir='models', img_size=(224, 224)):
        self.data_dir = Path(data_dir)
        self.model_dir = Path(model_dir)
        self.img_size = img_size
        self.num_classes = len(ISSUE_CATEGORIES)
        self.model = None
        self.history = None
        
        # Create directories
        self.data_dir.mkdir(exist_ok=True)
        self.model_dir.mkdir(exist_ok=True)
        
        logger.info(f"Initialized trainer with {self.num_classes} classes")
        logger.info(f"Categories: {ISSUE_CATEGORIES}")
    
    def create_dataset_structure(self):
        """Create directory structure for training data"""
        for category in ISSUE_CATEGORIES:
            (self.data_dir / category).mkdir(exist_ok=True)
        
        logger.info(f"Created dataset structure at {self.data_dir}")
        logger.info("Please add images to respective category folders")
        
    def check_dataset(self):
        """Check dataset and return statistics"""
        stats = {}
        total_images = 0
        
        for category in ISSUE_CATEGORIES:
            category_path = self.data_dir / category
            if category_path.exists():
                images = list(category_path.glob('*.jpg')) + list(category_path.glob('*.png'))
                count = len(images)
                stats[category] = count
                total_images += count
            else:
                stats[category] = 0
        
        logger.info(f"\n{'='*60}")
        logger.info("DATASET STATISTICS")
        logger.info(f"{'='*60}")
        for category, count in stats.items():
            logger.info(f"  {category:20s}: {count:4d} images")
        logger.info(f"{'='*60}")
        logger.info(f"  TOTAL:                {total_images:4d} images")
        logger.info(f"{'='*60}\n")
        
        return stats, total_images
    
    def create_synthetic_dataset(self, images_per_class=100):
        """Create synthetic dataset for testing (uses test_enhanced generators)"""
        from test_enhanced import (
            create_pothole_image, create_garbage_image, create_broken_road_image,
            create_manhole_image, create_debris_image
        )
        
        logger.info(f"Creating synthetic dataset with {images_per_class} images per class")
        
        generators = {
            'pothole': create_pothole_image,
            'garbage': create_garbage_image,
            'broken_road': create_broken_road_image,
            'open_manhole': create_manhole_image,
            'debris': create_debris_image
        }
        
        for category, generator in generators.items():
            category_path = self.data_dir / category
            category_path.mkdir(exist_ok=True)
            
            logger.info(f"  Generating {category}...")
            for i in range(images_per_class):
                img = generator()
                img_path = category_path / f"synthetic_{i:03d}.png"
                img.save(img_path)
                
                if (i + 1) % 50 == 0:
                    logger.info(f"    Generated {i+1}/{images_per_class} images")
            
            logger.info(f"  Created {images_per_class} images for {category}")
        
        # Create stray_cattle images (brown-toned) - optimized
        category_path = self.data_dir / 'stray_cattle'
        category_path.mkdir(exist_ok=True)
        logger.info(f"  Generating stray_cattle...")
        
        for i in range(images_per_class):
            # Create brown-toned image using numpy
            img_array = np.random.randint(60, 140, (256, 256, 3), dtype=np.uint8)
            # Make it brownish (reduce blue channel)
            img_array[:, :, 2] = img_array[:, :, 2] // 2
            img = Image.fromarray(img_array)
            img_path = category_path / f"synthetic_{i:03d}.png"
            img.save(img_path)
            
            if (i + 1) % 50 == 0:
                logger.info(f"    Generated {i+1}/{images_per_class} images")
        
        logger.info(f"  Created {images_per_class} images for stray_cattle")
        logger.info(f"\nSynthetic dataset created successfully!")
        
        self.check_dataset()
    
    def create_model(self):
        """Create CNN model with transfer learning"""
        logger.info("Creating model architecture...")
        
        # Load pre-trained MobileNetV2 without top layers
        base_model = MobileNetV2(
            input_shape=(*self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model layers initially
        base_model.trainable = False
        
        # Add custom classification layers
        model = keras.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dropout(0.4),
            layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
            layers.Dropout(0.2),
            layers.Dense(self.num_classes, activation='softmax')
        ], name='civic_issue_classifier')
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        self.model = model
        logger.info(f"Model created with {model.count_params():,} parameters")
        return model
    
    def prepare_data(self, validation_split=0.2, test_split=0.1):
        """Prepare data generators for training"""
        logger.info("Preparing data generators...")
        
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=validation_split + test_split
        )
        
        # No augmentation for validation/test
        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=validation_split + test_split
        )
        
        # Training generator
        train_generator = train_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=32,
            class_mode='categorical',
            subset='training',
            shuffle=True
        )
        
        # Validation generator
        val_generator = val_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=32,
            class_mode='categorical',
            subset='validation',
            shuffle=False
        )
        
        logger.info(f"Training samples: {train_generator.samples}")
        logger.info(f"Validation samples: {val_generator.samples}")
        logger.info(f"Classes: {train_generator.class_indices}")
        
        # Save class indices for inference
        class_indices_path = self.model_dir / 'class_indices.json'
        with open(class_indices_path, 'w') as f:
            json.dump(train_generator.class_indices, f)
        
        return train_generator, val_generator
    
    def train(self, epochs=30, patience=5):
        """Train the model"""
        if self.model is None:
            self.create_model()
        
        logger.info(f"\n{'='*60}")
        logger.info("STARTING TRAINING")
        logger.info(f"{'='*60}\n")
        
        # Prepare data
        train_gen, val_gen = self.prepare_data()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=patience,
                restore_best_weights=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3,
                min_lr=1e-7,
                verbose=1
            ),
            keras.callbacks.ModelCheckpoint(
                str(self.model_dir / 'best_model.keras'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            keras.callbacks.TensorBoard(
                log_dir=f'logs/{datetime.now().strftime("%Y%m%d-%H%M%S")}',
                histogram_freq=1
            )
        ]
        
        # Train model
        history = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        self.history = history
        
        # Fine-tuning: Unfreeze top layers
        logger.info("\n" + "="*60)
        logger.info("FINE-TUNING: Unfreezing top layers")
        logger.info("="*60 + "\n")
        
        base_model = self.model.layers[0]
        base_model.trainable = True
        
        # Freeze all but the last 20 layers
        for layer in base_model.layers[:-20]:
            layer.trainable = False
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=1e-5),
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        # Continue training
        history_fine = self.model.fit(
            train_gen,
            epochs=10,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        # Combine histories
        for key in history.history.keys():
            history.history[key].extend(history_fine.history[key])
        
        logger.info("\nTraining completed!")
        return history
    
    def evaluate(self):
        """Evaluate model performance"""
        if self.model is None:
            logger.error("No model to evaluate!")
            return
        
        logger.info("\n" + "="*60)
        logger.info("EVALUATING MODEL")
        logger.info("="*60 + "\n")
        
        # Prepare test data
        test_datagen = ImageDataGenerator(rescale=1./255)
        test_gen = test_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=32,
            class_mode='categorical',
            shuffle=False
        )
        
        # Get predictions
        predictions = self.model.predict(test_gen, verbose=1)
        y_pred = np.argmax(predictions, axis=1)
        y_true = test_gen.classes
        
        # Classification report
        class_names = list(test_gen.class_indices.keys())
        report = classification_report(y_true, y_pred, target_names=class_names)
        
        logger.info("\nCLASSIFICATION REPORT:")
        logger.info("\n" + report)
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=class_names, yticklabels=class_names)
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(self.model_dir / 'confusion_matrix.png')
        logger.info(f"\nConfusion matrix saved to {self.model_dir / 'confusion_matrix.png'}")
        
        # Calculate accuracy
        accuracy = np.sum(y_pred == y_true) / len(y_true)
        logger.info(f"\nOverall Accuracy: {accuracy:.2%}")
        
        return accuracy, report
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            logger.error("No training history to plot!")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # Accuracy plot
        axes[0].plot(self.history.history['accuracy'], label='Train Accuracy')
        axes[0].plot(self.history.history['val_accuracy'], label='Val Accuracy')
        axes[0].set_title('Model Accuracy')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Accuracy')
        axes[0].legend()
        axes[0].grid(True)
        
        # Loss plot
        axes[1].plot(self.history.history['loss'], label='Train Loss')
        axes[1].plot(self.history.history['val_loss'], label='Val Loss')
        axes[1].set_title('Model Loss')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Loss')
        axes[1].legend()
        axes[1].grid(True)
        
        plt.tight_layout()
        plt.savefig(self.model_dir / 'training_history.png')
        logger.info(f"Training history saved to {self.model_dir / 'training_history.png'}")
        plt.close()
    
    def save_model(self, filename='civic_issue_model.keras'):
        """Save trained model"""
        if self.model is None:
            logger.error("No model to save!")
            return
        
        model_path = self.model_dir / filename
        self.model.save(model_path)
        logger.info(f"\nModel saved to {model_path}")
        
        # Save metadata
        metadata = {
            'categories': ISSUE_CATEGORIES,
            'num_classes': self.num_classes,
            'img_size': self.img_size,
            'trained_at': datetime.now().isoformat()
        }
        
        metadata_path = self.model_dir / 'model_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Metadata saved to {metadata_path}")
    
    def load_model(self, filename='civic_issue_model.keras'):
        """Load trained model"""
        model_path = self.model_dir / filename
        if not model_path.exists():
            logger.error(f"Model not found at {model_path}")
            return None
        
        self.model = keras.models.load_model(model_path)
        logger.info(f"Model loaded from {model_path}")
        return self.model


def main():
    """Main training pipeline"""
    print("\n" + "="*80)
    print("CIVIC ISSUE CLASSIFICATION - ML TRAINING PIPELINE")
    print("="*80 + "\n")
    
    # Initialize trainer
    trainer = CivicIssueTrainer()
    
    # Check for existing dataset
    stats, total = trainer.check_dataset()
    
    if total < 100:
        print("\n[WARNING] Insufficient training data detected!")
        print("Creating synthetic dataset for demonstration...")
        trainer.create_synthetic_dataset(images_per_class=50)  # Reduced for faster training
    
    # Create and train model
    print("\n[INFO] Creating model...")
    trainer.create_model()
    
    # Display model architecture
    print("\n" + "="*80)
    print("MODEL ARCHITECTURE")
    print("="*80)
    trainer.model.summary()
    
    # Train model
    print("\n[INFO] Starting training...")
    history = trainer.train(epochs=15, patience=4)  # Reduced epochs for faster training
    
    # Plot training history
    print("\n[INFO] Plotting training history...")
    trainer.plot_training_history()
    
    # Evaluate model
    print("\n[INFO] Evaluating model...")
    accuracy, report = trainer.evaluate()
    
    # Save model
    print("\n[INFO] Saving model...")
    trainer.save_model()
    
    print("\n" + "="*80)
    print(f"[SUCCESS] TRAINING COMPLETED SUCCESSFULLY!")
    print(f"Final Accuracy: {accuracy:.2%}")
    print(f"Model saved to: {trainer.model_dir / 'civic_issue_model.keras'}")
    print("="*80 + "\n")


if __name__ == '__main__':
    main()
