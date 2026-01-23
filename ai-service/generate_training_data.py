"""
Generate Enhanced Training Dataset for YOLOv8 Civic Issue Classification
Expands dataset from 50 to 200-500 images per class using data augmentation.

Classes: pothole, garbage, debris, stray_cattle, broken_road, open_manhole
"""

import os
import random
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import numpy as np

# Configuration
BASE_DIR = Path(__file__).parent / 'training_data'
TARGET_IMAGES_PER_CLASS = 250  # Target: 250 images per class (1500 total)
AUGMENTATION_TECHNIQUES = [
    'brightness', 'contrast', 'rotation', 'flip', 
    'blur', 'noise', 'zoom', 'crop'
]

CLASSES = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']


def apply_brightness(img, factor=None):
    """Adjust image brightness (0.6 to 1.4)"""
    factor = factor or random.uniform(0.6, 1.4)
    enhancer = ImageEnhance.Brightness(img)
    return enhancer.enhance(factor)


def apply_contrast(img, factor=None):
    """Adjust image contrast (0.7 to 1.5)"""
    factor = factor or random.uniform(0.7, 1.5)
    enhancer = ImageEnhance.Contrast(img)
    return enhancer.enhance(factor)


def apply_rotation(img, angle=None):
    """Rotate image (-30 to 30 degrees)"""
    angle = angle or random.uniform(-30, 30)
    return img.rotate(angle, fillcolor=(128, 128, 128), expand=False)


def apply_flip(img):
    """Horizontal flip"""
    try:
        return img.transpose(Image.FLIP_LEFT_RIGHT)
    except AttributeError:
        return img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def apply_blur(img, radius=None):
    """Apply Gaussian blur (radius 0.5 to 2.0)"""
    radius = radius or random.uniform(0.5, 2.0)
    return img.filter(ImageFilter.GaussianBlur(radius))


def apply_noise(img, intensity=None):
    """Add random noise to image"""
    intensity = intensity or random.randint(5, 20)
    np_img = np.array(img)
    noise = np.random.randint(-intensity, intensity, np_img.shape, dtype='int16')
    np_img = np.clip(np_img.astype('int16') + noise, 0, 255).astype('uint8')
    return Image.fromarray(np_img)


def apply_zoom(img, zoom_factor=None):
    """Zoom in (1.1x to 1.3x) by cropping and resizing"""
    zoom_factor = zoom_factor or random.uniform(1.1, 1.3)
    width, height = img.size
    new_width = int(width / zoom_factor)
    new_height = int(height / zoom_factor)
    
    left = (width - new_width) // 2
    top = (height - new_height) // 2
    right = left + new_width
    bottom = top + new_height
    
    cropped = img.crop((left, top, right, bottom))
    try:
        return cropped.resize((width, height), Image.LANCZOS)
    except AttributeError:
        return cropped.resize((width, height), Image.Resampling.LANCZOS)


def apply_crop(img, crop_factor=None):
    """Zoom out (0.8x to 0.95x) by resizing and padding"""
    crop_factor = crop_factor or random.uniform(0.8, 0.95)
    width, height = img.size
    new_width = int(width * crop_factor)
    new_height = int(height * crop_factor)
    
    try:
        resized = img.resize((new_width, new_height), Image.LANCZOS)
    except AttributeError:
        resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Create new image with padding
    new_img = Image.new('RGB', (width, height), (128, 128, 128))
    paste_x = (width - new_width) // 2
    paste_y = (height - new_height) // 2
    new_img.paste(resized, (paste_x, paste_y))
    
    return new_img


def apply_color_jitter(img):
    """Apply random color variations"""
    enhancer = ImageEnhance.Color(img)
    factor = random.uniform(0.8, 1.2)
    return enhancer.enhance(factor)


def apply_sharpness(img):
    """Apply sharpness adjustment"""
    enhancer = ImageEnhance.Sharpness(img)
    factor = random.uniform(0.5, 2.0)
    return enhancer.enhance(factor)


def augment_image(img, num_augmentations=3):
    """Apply multiple random augmentations to an image"""
    techniques = {
        'brightness': apply_brightness,
        'contrast': apply_contrast,
        'rotation': apply_rotation,
        'flip': apply_flip,
        'blur': apply_blur,
        'noise': apply_noise,
        'zoom': apply_zoom,
        'crop': apply_crop,
        'color': apply_color_jitter,
        'sharpness': apply_sharpness,
    }
    
    # Randomly select augmentations
    selected = random.sample(list(techniques.keys()), min(num_augmentations, len(techniques)))
    
    augmented = img.copy()
    for technique in selected:
        try:
            augmented = techniques[technique](augmented)
        except Exception as e:
            print(f"  ⚠ Failed to apply {technique}: {e}")
            continue
    
    return augmented


def generate_class_images(class_name, target_count=TARGET_IMAGES_PER_CLASS):
    """Generate augmented images for a specific class"""
    class_dir = BASE_DIR / class_name
    
    if not class_dir.exists():
        print(f"❌ Class directory not found: {class_dir}")
        return 0
    
    # Get existing images
    existing_images = list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg'))
    current_count = len(existing_images)
    
    if current_count >= target_count:
        print(f"✓ {class_name}: Already has {current_count} images (target: {target_count})")
        return current_count
    
    print(f"\n{'='*60}")
    print(f"Generating images for: {class_name}")
    print(f"Current: {current_count} | Target: {target_count} | To generate: {target_count - current_count}")
    print(f"{'='*60}")
    
    images_to_generate = target_count - current_count
    generated = 0
    
    while generated < images_to_generate:
        # Pick a random source image
        source_img_path = random.choice(existing_images)
        
        try:
            img = Image.open(source_img_path).convert('RGB')
            
            # Apply augmentations (3-5 techniques per image)
            num_augmentations = random.randint(3, 5)
            augmented = augment_image(img, num_augmentations)
            
            # Save with unique filename
            new_filename = f"{class_name}_aug_{current_count + generated + 1:04d}.png"
            save_path = class_dir / new_filename
            augmented.save(save_path, 'PNG')
            
            generated += 1
            
            if generated % 20 == 0:
                progress = (generated / images_to_generate) * 100
                print(f"  Progress: {generated}/{images_to_generate} ({progress:.1f}%)")
        
        except Exception as e:
            print(f"  ⚠ Error generating from {source_img_path.name}: {e}")
            continue
    
    final_count = len(list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg')))
    print(f"✓ {class_name}: Generated {generated} new images (Total: {final_count})")
    
    return final_count


def verify_dataset():
    """Verify dataset quality and distribution"""
    print("\n" + "="*60)
    print("DATASET VERIFICATION")
    print("="*60)
    
    total_images = 0
    class_counts = {}
    
    for class_name in CLASSES:
        class_dir = BASE_DIR / class_name
        if class_dir.exists():
            images = list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg'))
            count = len(images)
            class_counts[class_name] = count
            total_images += count
            print(f"{class_name:15s}: {count:4d} images")
        else:
            print(f"{class_name:15s}: DIRECTORY NOT FOUND")
            class_counts[class_name] = 0
    
    print("="*60)
    print(f"Total images: {total_images}")
    print(f"Average per class: {total_images / len(CLASSES):.1f}")
    
    # Check balance
    if class_counts:
        min_count = min(class_counts.values())
        max_count = max(class_counts.values())
        imbalance = max_count - min_count
        
        if imbalance > 50:
            print(f"⚠ Dataset imbalance detected: {imbalance} images difference")
        else:
            print("✓ Dataset is well balanced")
    
    print("="*60)
    
    return total_images


def main():
    """Main execution"""
    print("\n" + "="*70)
    print(" YOLOv8 CIVIC ISSUE DATASET GENERATOR ".center(70, "="))
    print("="*70)
    print(f"\nBase directory: {BASE_DIR}")
    print(f"Target images per class: {TARGET_IMAGES_PER_CLASS}")
    print(f"Expected total: {TARGET_IMAGES_PER_CLASS * len(CLASSES)} images")
    
    # Verify base directory exists
    if not BASE_DIR.exists():
        print(f"\n❌ Training data directory not found: {BASE_DIR}")
        print("Please ensure training_data/ exists with subdirectories for each class.")
        return
    
    # Show current state
    print("\nCurrent dataset state:")
    verify_dataset()
    
    # Confirm generation
    print("\n" + "="*70)
    response = input("Start generating augmented images? (y/n): ").strip().lower()
    
    if response != 'y':
        print("Generation cancelled.")
        return
    
    # Generate for each class
    print("\n" + "="*70)
    print("STARTING AUGMENTATION")
    print("="*70)
    
    results = {}
    for class_name in CLASSES:
        count = generate_class_images(class_name, TARGET_IMAGES_PER_CLASS)
        results[class_name] = count
    
    # Final verification
    total = verify_dataset()
    
    # Summary
    print("\n" + "="*70)
    print(" GENERATION COMPLETE ".center(70, "="))
    print("="*70)
    print(f"\nTotal images generated: {total}")
    print(f"Dataset ready for YOLOv8 training!")
    print("\nNext steps:")
    print("1. Review generated images in training_data/")
    print("2. Run: python train_yolov8_custom.py")
    print("3. Monitor training progress")
    print("="*70)


if __name__ == '__main__':
    main()
