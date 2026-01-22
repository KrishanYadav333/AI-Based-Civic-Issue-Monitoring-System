import numpy as np
import tensorflow as tf
from tensorflow import keras  # type: ignore
from tensorflow.keras import layers  # type: ignore
from tensorflow.keras.applications import MobileNetV2  # type: ignore
from tensorflow.keras.preprocessing.image import ImageDataGenerator  # type: ignore
import os
import json
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Issue type categories
ISSUE_CATEGORIES = [
    'pothole',
    'garbage_overflow',
    'street_light',
    'drainage',
    'water_supply',
    'road_damage',
    'illegal_dumping',
    'other'
]

def create_model(num_classes=len(ISSUE_CATEGORIES), input_shape=(224, 224, 3)):
    """
    Create transfer learning model using MobileNetV2
    """
    # Load pre-trained MobileNetV2 without top layers
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Add custom classification layers
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def fine_tune_model(model, base_model_layers=100):
    """
    Unfreeze top layers of base model for fine-tuning
    """
    base_model = model.layers[0]
    base_model.trainable = True
    
    # Freeze all layers except the last N
    for layer in base_model.layers[:-base_model_layers]:
        layer.trainable = False
    
    return model

def prepare_data_generators(data_dir, batch_size=32, img_size=(224, 224)):
    """
    Prepare data generators with augmentation
    """
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )
    
    # Validation data (only rescaling)
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training'
    )
    
    validation_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation'
    )
    
    return train_generator, validation_generator

def train_model(
    data_dir,
    model_save_path='models/civic_issue_classifier.h5',
    epochs_initial=10,
    epochs_fine_tune=10,
    batch_size=32
):
    """
    Train the civic issue classification model
    """
    logger.info("Starting model training...")
    
    # Create model
    model = create_model()
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    # Prepare data
    train_gen, val_gen = prepare_data_generators(data_dir, batch_size)
    
    # Save class indices
    class_indices = train_gen.class_indices
    with open('models/class_indices.json', 'w') as f:
        json.dump(class_indices, f)
    logger.info(f"Class indices saved: {class_indices}")
    
    # Callbacks
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            model_save_path,
            save_best_only=True,
            monitor='val_accuracy',
            mode='max'
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7
        ),
        keras.callbacks.TensorBoard(
            log_dir='logs',
            histogram_freq=1
        )
    ]
    
    # Initial training (frozen base)
    logger.info("Phase 1: Training with frozen base model...")
    history_initial = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs_initial,
        callbacks=callbacks
    )
    
    # Fine-tuning (unfreeze top layers)
    logger.info("Phase 2: Fine-tuning with unfrozen layers...")
    model = fine_tune_model(model)
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),  # Lower learning rate
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    history_fine_tune = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs_fine_tune,
        callbacks=callbacks
    )
    
    # Save final model
    model.save(model_save_path)
    logger.info(f"Model saved to {model_save_path}")
    
    # Evaluate model
    logger.info("Evaluating final model...")
    test_loss, test_acc, test_top3 = model.evaluate(val_gen)
    logger.info(f"Test accuracy: {test_acc:.4f}")
    logger.info(f"Test top-3 accuracy: {test_top3:.4f}")
    
    return model, history_initial, history_fine_tune

def create_priority_model(model_path='models/civic_issue_classifier.h5'):
    """
    Create a separate model branch for priority prediction
    """
    # Load base model
    base_model = keras.models.load_model(model_path)
    
    # Get feature extractor (remove classification head)
    feature_extractor = keras.Model(
        inputs=base_model.input,
        outputs=base_model.layers[-4].output  # Before final dense layers
    )
    
    # Add priority classification head
    priority_model = keras.Sequential([
        feature_extractor,
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(3, activation='softmax', name='priority')  # high, medium, low
    ])
    
    return priority_model

def export_model_for_inference(model_path, export_dir='models/exported'):
    """
    Export model in TensorFlow SavedModel format for production
    """
    model = keras.models.load_model(model_path)
    
    # Create export directory
    os.makedirs(export_dir, exist_ok=True)
    
    # Export in SavedModel format
    model.export(os.path.join(export_dir, 'civic_classifier'))
    logger.info(f"Model exported to {export_dir}")
    
    # Export to TFLite for mobile
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]  # type: ignore
    tflite_model = converter.convert()
    
    tflite_path = os.path.join(export_dir, 'civic_classifier.tflite')
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)  # type: ignore
    logger.info(f"TFLite model exported to {tflite_path}")

def evaluate_model_performance(model_path, test_data_dir):
    """
    Comprehensive model evaluation with metrics
    """
    from sklearn.metrics import classification_report, confusion_matrix  # type: ignore
    import seaborn as sns  # type: ignore
    import matplotlib.pyplot as plt  # type: ignore
    
    model = keras.models.load_model(model_path)
    
    # Load test data
    test_datagen = ImageDataGenerator(rescale=1./255)
    test_generator = test_datagen.flow_from_directory(
        test_data_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='categorical',
        shuffle=False
    )
    
    # Predictions
    predictions = model.predict(test_generator)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_generator.classes
    
    # Classification report
    class_names = list(test_generator.class_indices.keys())
    report = classification_report(y_true, y_pred, target_names=class_names)
    logger.info(f"Classification Report:\n{report}")
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('models/confusion_matrix.png')
    logger.info("Confusion matrix saved to models/confusion_matrix.png")
    
    return report, cm

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Train civic issue classifier')
    parser.add_argument('--data-dir', type=str, required=True, help='Path to training data directory')
    parser.add_argument('--epochs-initial', type=int, default=10, help='Initial training epochs')
    parser.add_argument('--epochs-fine-tune', type=int, default=10, help='Fine-tuning epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--model-path', type=str, default='models/civic_issue_classifier.h5', help='Model save path')
    
    args = parser.parse_args()
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    # Train model
    model, hist1, hist2 = train_model(
        data_dir=args.data_dir,
        model_save_path=args.model_path,
        epochs_initial=args.epochs_initial,
        epochs_fine_tune=args.epochs_fine_tune,
        batch_size=args.batch_size
    )
    
    # Export model
    export_model_for_inference(args.model_path)
    
    logger.info("Training complete!")
