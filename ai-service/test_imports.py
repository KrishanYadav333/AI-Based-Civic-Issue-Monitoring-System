"""
Test script to verify all imports work correctly
"""
import sys
import os

# Add src to path for testing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    print("Testing imports...")
    
    # Test config
    from src.config import config
    print("✓ config imported successfully")
    
    # Test model
    from src.model import get_model_handler
    print("✓ model imported successfully")
    
    # Test classifier
    from src.classifier import get_classification_service
    print("✓ classifier imported successfully")
    
    # Test cache
    from src.cache import get_cache_service
    print("✓ cache imported successfully")
    
    # Test main
    from src.main import app
    print("✓ main imported successfully")
    
    print("\n✅ All imports successful!")
    print(f"App title: {app.title}")
    print(f"App version: {app.version}")
    
except Exception as e:
    print(f"\n❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
