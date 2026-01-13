# AI Service for Civic Issue Detection

This service provides AI-powered image classification to detect civic issues from photographs.

## Features
- Image classification for 6 types of civic issues
- Confidence scoring
- Priority assignment
- REST API interface

## Issue Types
1. **Pothole** - High priority
2. **Garbage** - Medium priority
3. **Debris** - Medium priority
4. **Stray Cattle** - Low priority
5. **Broken Road** - High priority
6. **Open Manhole** - High priority

## Setup

### Installation
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your settings
```

### Run
```bash
python app.py
```

## API Endpoints

### POST /api/detect
Detect issue from image

**Request:**
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "issueType": "pothole",
  "confidence": 0.95,
  "priority": "high"
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "ok",
  "service": "AI Issue Detection"
}
```

### GET /api/model/info
Get model information

**Response:**
```json
{
  "model": "Civic Issue Classifier v1.0",
  "issueTypes": ["pothole", "garbage", "debris", "stray_cattle", "broken_road", "open_manhole"],
  "status": "active"
}
```

## Model Training

To train a custom model:

1. Collect and label training data
2. Organize images into folders by issue type
3. Run training script:
```bash
python train_model.py --data ./training_data --epochs 50
```

4. Model will be saved to `models/civic_issue_model.h5`

## Current Implementation

Currently using a rule-based classifier for demonstration. For production:

1. Collect labeled dataset of civic issues
2. Train CNN model (ResNet50, MobileNet, or custom architecture)
3. Replace `ml_classifier` function with trained model inference
4. Fine-tune model with Vadodara-specific data

## Dependencies
- Flask - Web framework
- TensorFlow/Keras - Deep learning
- Pillow - Image processing
- NumPy - Numerical operations
