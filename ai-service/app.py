from flask import Flask, request, jsonify
import os
import numpy as np
from PIL import Image
import io
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Issue types and their characteristics
ISSUE_TYPES = {
    'pothole': {'priority': 'high', 'keywords': ['road', 'crater', 'hole']},
    'garbage': {'priority': 'medium', 'keywords': ['trash', 'waste', 'litter']},
    'debris': {'priority': 'medium', 'keywords': ['rubble', 'construction', 'material']},
    'stray_cattle': {'priority': 'low', 'keywords': ['animal', 'cow', 'cattle']},
    'broken_road': {'priority': 'high', 'keywords': ['road', 'crack', 'damage']},
    'open_manhole': {'priority': 'high', 'keywords': ['manhole', 'cover', 'opening']}
}

# Simple rule-based classifier (to be replaced with actual ML model)
def simple_classifier(image_data):
    """
    Improved feature-based classifier using color and texture analysis.
    """
    import numpy as np
    from PIL import Image
    import io
    
    # Load image
    if isinstance(image_data, str):
        img = Image.open(image_data)
    else:
        img = Image.open(io.BytesIO(image_data))
    
    img = img.convert('RGB')
    img_array = np.array(img)
    
    # Calculate features
    brightness = np.mean(img_array) / 255.0
    color_std = np.std(img_array) / 255.0
    
    # RGB channel analysis
    r_mean = np.mean(img_array[:,:,0]) / 255.0
    g_mean = np.mean(img_array[:,:,1]) / 255.0
    b_mean = np.mean(img_array[:,:,2]) / 255.0
    
    # Determine issue type based on features
    scores = {}
    
    # Calculate additional features
    gray_level = abs(r_mean - g_mean) + abs(g_mean - b_mean) + abs(r_mean - b_mean)
    brown_score = (r_mean * 0.6 + g_mean * 0.3 + b_mean * 0.1)
    
    # Pothole: Very dark, very uniform color (asphalt)
    if brightness < 0.25 and color_std < 0.05:
        scores['pothole'] = 0.80 + (0.25 - brightness) * 0.6
    
    # Garbage: Medium-high color variation, bright (colorful trash)
    if color_std > 0.07 and brightness > 0.60:
        scores['garbage'] = 0.80 + color_std * 0.7
    
    # Broken road: Medium-low brightness, very uniform (damaged asphalt)
    if 0.30 < brightness < 0.45 and color_std < 0.04:
        scores['broken_road'] = 0.78 + (0.45 - brightness) * 0.4
    
    # Manhole: Grayish, medium brightness, medium variation
    if gray_level < 0.15 and 0.35 < brightness < 0.50 and color_std > 0.08:
        scores['open_manhole'] = 0.75 + (0.15 - gray_level) * 1.0
    
    # Debris: Medium variation, medium-high brightness (scattered objects)
    if color_std > 0.08 and 0.43 < brightness < 0.60:
        scores['debris'] = 0.76 + color_std * 0.5
    
    # Stray cattle: Brown tones, low variation (exclude debris brightness range)
    if 0.3 < brown_score < 0.6 and 0.25 < brightness < 0.42 and color_std < 0.12:
        scores['stray_cattle'] = 0.65 + brown_score * 0.35
    
    # Get best match or default to other
    if scores:
        issue_type = max(scores.keys(), key=lambda k: scores[k])
        confidence = round(min(scores[issue_type], 0.95), 2)
    else:
        issue_type = 'broken_road'  # Default fallback
        confidence = 0.60
    
    priority = ISSUE_TYPES[issue_type]['priority']
    
    return {
        'success': True,
        'issue_type': issue_type,
        'confidence': confidence,
        'priority': priority,
        'ai_class': issue_type,
        'features': {
            'brightness': round(brightness, 2),
            'color_variation': round(color_std, 2)
        },
        'message': f'Detected {issue_type} with {confidence:.1%} confidence'
    }

# Advanced ML classifier (placeholder for future implementation)
def ml_classifier(image_data):
    """
    Machine learning-based classifier using CNN.
    This is a placeholder for the actual implementation.
    
    Steps for implementation:
    1. Load pre-trained model or train custom model
    2. Preprocess image (resize, normalize)
    3. Run inference
    4. Post-process results
    5. Return classification with confidence
    """
    try:
        # Preprocess image
        img = Image.open(io.BytesIO(image_data))
        img = img.resize((224, 224))  # Standard size for CNNs
        img_array = np.array(img) / 255.0  # Normalize
        
        # TODO: Load and use actual trained model
        # model = load_model('civic_issue_model.h5')
        # predictions = model.predict(np.expand_dims(img_array, axis=0))
        
        # For now, use simple classifier
        return simple_classifier(image_data)
        
    except Exception as e:
        logger.error(f"Error in ML classifier: {str(e)}")
        return simple_classifier(image_data)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'AI Issue Detection'}), 200

@app.route('/api/detect', methods=['POST'])
def detect_issue():
    """
    Detect civic issue from uploaded image
    
    Expected input: multipart/form-data with 'image' file
    Returns: JSON with issueType, confidence, and priority
    """
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Validate image
        try:
            img = Image.open(io.BytesIO(image_data))
            img.verify()
        except Exception:
            return jsonify({'error': 'Invalid image file'}), 400
        
        # Classify image
        result = ml_classifier(image_data)
        
        logger.info(f"Issue detected: {result['issueType']} (confidence: {result['confidence']})")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the ML model"""
    return jsonify({
        'model': 'Civic Issue Classifier v1.0',
        'issueTypes': list(ISSUE_TYPES.keys()),
        'status': 'active',
        'note': 'Currently using rule-based classifier. ML model to be integrated.'
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
