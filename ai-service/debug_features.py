"""Debug script to analyze features for each test image"""
from test_enhanced import *
from app_enhanced import enhanced_classifier

test_images = {
    'pothole': create_pothole_image(),
    'garbage': create_garbage_image(),
    'broken_road': create_broken_road_image(),
    'manhole': create_manhole_image(),
    'debris': create_debris_image()
}

print("\n" + "="*80)
print("DETAILED FEATURE ANALYSIS")
print("="*80)

for name, img in test_images.items():
    img_bytes = img_to_bytes(img)
    result = enhanced_classifier(img_bytes)
    
    print(f"\n{name.upper()}:")
    print(f"  Detected: {result['issueType']} (conf: {result['confidence']})")
    print(f"  Priority: {result['priority']}")
    if 'features' in result:
        print(f"  Color: dark={result['features']['color']['is_dark']}, "
              f"gray={result['features']['color']['is_gray']}, "
              f"brown={result['features']['color']['is_brown']}, "
              f"brightness={result['features']['color']['brightness']:.2f}")
        print(f"  Texture: variance={result['features']['texture']['texture_variance']:.1f}, "
              f"edges={result['features']['texture']['edge_intensity']:.2f}")
        print(f"  Shapes: circular={result['features']['shapes']['circular_shapes']}, "
              f"irregular={result['features']['shapes']['irregular_shapes']}")
        print(f"  Spatial: centered={result['features']['spatial']['is_centered']}, "
              f"scattered={result['features']['spatial']['is_scattered']}")

print("\n" + "="*80)
