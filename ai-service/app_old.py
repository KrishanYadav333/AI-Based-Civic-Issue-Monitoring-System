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
    Simple rule-based classifier for demonstration.
    In production, this should be replaced with a trained CNN model.
    """
    # For now, return a random classification with confidence
    # This is a placeholder implementation
    import random
    
    issue_type = random.choice(list(ISSUE_TYPES.keys()))
    confidence = round(random.uniform(0.75, 0.98), 2)
    priority = ISSUE_TYPES[issue_type]['priority']
    
    return {
        'issueType': issue_type,
        'confidence': confidence,
        'priority': priority
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
