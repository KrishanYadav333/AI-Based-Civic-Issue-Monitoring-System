"""
Integration tests for data augmentation pipeline
Tests the generate_training_data.py script
"""

import pytest
from pathlib import Path
import shutil
from PIL import Image


class TestDataAugmentation:
    """Test cases for training data augmentation"""
    
    @pytest.fixture
    def temp_training_dir(self, tmp_path):
        """Create temporary training data directory"""
        training_dir = tmp_path / "training_data"
        
        # Create class directories
        classes = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
        for class_name in classes:
            class_dir = training_dir / class_name
            class_dir.mkdir(parents=True)
            
            # Create 5 dummy images per class
            for i in range(5):
                img = Image.new('RGB', (640, 640), color='gray')
                img.save(class_dir / f"{class_name}_{i:04d}.png")
        
        return training_dir
    
    def test_training_data_structure_exists(self):
        """Test that training data directory has correct structure"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        expected_classes = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
        
        for class_name in expected_classes:
            class_dir = training_dir / class_name
            assert class_dir.exists(), f"Class directory {class_name} not found"
            assert class_dir.is_dir(), f"{class_name} should be a directory"
    
    def test_training_data_has_images(self):
        """Test that training data directories contain images"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        classes = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
        
        for class_name in classes:
            class_dir = training_dir / class_name
            if class_dir.exists():
                images = list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg'))
                assert len(images) > 0, f"No images found in {class_name} directory"
    
    def test_augmented_images_count(self):
        """Test that augmentation generated expected number of images"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        expected_count = 250  # Target from augmentation script
        classes = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
        
        for class_name in classes:
            class_dir = training_dir / class_name
            if class_dir.exists():
                images = list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg'))
                # Allow some tolerance (240-260 images)
                assert 240 <= len(images) <= 260, f"{class_name} has {len(images)} images, expected ~{expected_count}"
    
    def test_image_format_validity(self):
        """Test that all training images are valid and can be loaded"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        classes = ['pothole', 'garbage']  # Test first 2 classes for speed
        errors = []
        
        for class_name in classes:
            class_dir = training_dir / class_name
            if class_dir.exists():
                images = list(class_dir.glob('*.png'))[:10]  # Test first 10 images
                
                for img_path in images:
                    try:
                        img = Image.open(img_path)
                        img.verify()  # Check image integrity
                    except Exception as e:
                        errors.append(f"{img_path.name}: {str(e)}")
        
        assert len(errors) == 0, f"Invalid images found: {errors}"
    
    def test_image_dimensions(self):
        """Test that images have reasonable dimensions"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        class_dir = training_dir / "pothole"
        if not class_dir.exists():
            pytest.skip("Pothole class directory not found")
        
        images = list(class_dir.glob('*.png'))[:5]  # Test first 5 images
        
        for img_path in images:
            img = Image.open(img_path)
            width, height = img.size
            
            # Images should be reasonably sized (not too small, not huge)
            assert 200 <= width <= 2000, f"{img_path.name} width {width} outside reasonable range"
            assert 200 <= height <= 2000, f"{img_path.name} height {height} outside reasonable range"
    
    def test_class_balance(self):
        """Test that all classes have similar number of images (balanced dataset)"""
        training_dir = Path(__file__).parent.parent / "training_data"
        
        if not training_dir.exists():
            pytest.skip("Training data directory not found")
        
        classes = ['pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole']
        class_counts = {}
        
        for class_name in classes:
            class_dir = training_dir / class_name
            if class_dir.exists():
                images = list(class_dir.glob('*.png')) + list(class_dir.glob('*.jpg'))
                class_counts[class_name] = len(images)
        
        if len(class_counts) == 0:
            pytest.skip("No class data found")
        
        # All classes should have similar counts (within 10% of mean)
        counts = list(class_counts.values())
        mean_count = sum(counts) / len(counts)
        
        for class_name, count in class_counts.items():
            variance = abs(count - mean_count) / mean_count
            assert variance <= 0.10, f"{class_name} count {count} deviates more than 10% from mean {mean_count:.0f}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
