# AI Service - Civic Issue Classification

FastAPI service with YOLOv8 for automated civic issue classification from images.

## Features

- **Image Classification**: YOLOv8-based object detection
- **Issue Type Mapping**: Automatic mapping to civic issue categories
- **Redis Caching**: Fast responses for repeated images
- **Multiple Input Formats**: File upload or base64 encoding
- **Confidence Scoring**: Quality assessment of classifications
- **Alternative Suggestions**: Multiple classification options

## Tech Stack

- Python 3.9+
- FastAPI
- YOLOv8 (Ultralytics)
- PyTorch
- OpenCV
- Redis (optional, for caching)

## Prerequisites

1. Python 3.9 or higher
2. Redis (optional, for caching)

## Installation

### 1. Create Virtual Environment

```bash
cd ai-service
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn (API framework)
- PyTorch and TorchVision (deep learning)
- Ultralytics YOLOv8 (object detection)
- OpenCV and Pillow (image processing)
- Redis (caching)
- Other utilities

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# Model Configuration
MODEL_PATH=./models/yolov8n.pt
CONFIDENCE_THRESHOLD=0.25
MODEL_DEVICE=cpu

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=3600
```

### 4. Download Model (Optional)

YOLOv8n model will auto-download on first run. To download manually:

```bash
mkdir -p models
# The model will be downloaded automatically to models/ on first inference
```

## Running the Service

### Development Mode

```bash
# Make sure virtual environment is activated
python src/main.py
```

Or with uvicorn directly:

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Service will be available at `http://localhost:8000`

## API Documentation

Once running, view interactive API docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Classification

#### POST /classify
Classify image from file upload

**Request:**
```bash
curl -X POST http://localhost:8000/classify \
  -F "file=@path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "issue_type": "pothole",
  "confidence": 0.87,
  "ai_class": "pothole",
  "alternative_classes": [
    {
      "issue_type": "road_damage",
      "ai_class": "crack",
      "confidence": 0.65
    }
  ],
  "all_detections": [...],
  "message": "Classification successful"
}
```

#### POST /classify-base64
Classify base64 encoded image

**Request:**
```bash
curl -X POST http://localhost:8000/classify-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

### Health & Info

#### GET /health
Service health check

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00Z",
  "model": {
    "loaded": true,
    "device": "cpu",
    "confidence_threshold": 0.25
  },
  "cache": {
    "enabled": true,
    "connected": true
  }
}
```

#### GET /model-info
Model metadata

**Response:**
```json
{
  "success": true,
  "data": {
    "loaded": true,
    "model_path": "./models/yolov8n.pt",
    "device": "cpu",
    "confidence_threshold": 0.25
  }
}
```

### Cache Management

#### GET /cache/stats
Cache statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "connected": true,
    "total_keys": 42,
    "keyspace_hits": 150,
    "keyspace_misses": 30,
    "hit_rate": 0.83
  }
}
```

#### POST /cache/clear
Clear all cached classifications

## Issue Type Mapping

The service maps YOLOv8 detections to civic issue types:

| AI Detection | Issue Type | Department |
|-------------|------------|------------|
| pothole, road_damage | pothole | Roads |
| garbage, trash | garbage | Sanitation |
| cow, dog, animal | stray_cattle | Animal Control |
| manhole, open_manhole | open_manhole | Drainage |
| street_light, lamp | street_light | Electricity |
| water_leak, pipe | water_leakage | Water Supply |
| tree, fallen_tree | tree_fall | Parks |
| encroachment | illegal_construction | Building |

See `src/config.py` for complete mapping.

## Project Structure

```
ai-service/
├── src/
│   ├── cache.py          # Redis caching
│   ├── classifier.py     # Classification logic
│   ├── config.py         # Configuration
│   ├── main.py           # FastAPI application
│   └── model.py          # YOLOv8 model handler
├── models/               # Model files (auto-downloaded)
├── tests/                # Test files
├── .env.example          # Environment template
├── .gitignore
├── requirements.txt      # Python dependencies
└── README.md
```

## Model Information

**YOLOv8n (Nano)**
- Size: ~6 MB
- Speed: Fast (CPU-friendly)
- Accuracy: Good for civic infrastructure
- License: AGPL-3.0 (Ultralytics)

The nano version is optimized for:
- Fast inference on CPU
- Low memory footprint
- Good balance of speed/accuracy
- Perfect for free-tier deployments

## Caching Strategy

Redis caches classification results using SHA256 hash of image content:

- **Cache Key**: `classification:<sha256-hash>`
- **TTL**: 1 hour (3600 seconds)
- **Hit Rate**: Typically 70-80% for repeated reports

Benefits:
- Instant results for duplicate images
- Reduced compute load
- Lower latency for users

## Performance

**CPU Inference (YOLOv8n)**
- Average: 200-400ms per image
- With cache hit: <50ms

**GPU Inference (if available)**
- Average: 50-100ms per image
- Set `MODEL_DEVICE=cuda` in `.env`

## Development

### Running Tests

```bash
pytest tests/
```

### Adding New Issue Types

1. Update `ISSUE_TYPE_MAPPING` in `src/config.py`
2. Add corresponding database entry in backend
3. Restart service

Example:
```python
ISSUE_TYPE_MAPPING = {
    'new_detection_class': 'new_issue_type',
    # ... existing mappings
}
```

## Troubleshooting

### Model Download Issues

If auto-download fails, manually download:

```bash
# Install ultralytics
pip install ultralytics

# Download model
yolo task=detect mode=predict model=yolov8n.pt
```

### Redis Connection Issues

Check Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

Service works without Redis (caching disabled).

### CUDA/GPU Issues

For CPU-only deployment:
```env
MODEL_DEVICE=cpu
```

For GPU (if available):
```env
MODEL_DEVICE=cuda
```

### Memory Issues

YOLOv8n is lightweight, but if issues arise:
- Use YOLOv8n (already smallest)
- Reduce `MAX_IMAGE_SIZE` in config
- Increase system swap space
- Use production WSGI server with worker limits

## Production Deployment

See [../plans/DEPLOYMENT.md](../plans/DEPLOYMENT.md) for deployment instructions.

Quick steps:
1. Set `ENVIRONMENT=production` in `.env`
2. Use production ASGI server (uvicorn with workers)
3. Deploy to Render/Railway/Heroku
4. Configure Redis if available
5. Set up monitoring

### Render Deployment

```yaml
# render.yaml
services:
  - type: web
    name: ai-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: MODEL_DEVICE
        value: cpu
```

## API Client Examples

### Python

```python
import requests

# Classify image file
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8000/classify', files=files)
    print(response.json())

# Classify base64
import base64
with open('image.jpg', 'rb') as f:
    image_b64 = base64.b64encode(f.read()).decode()
    
response = requests.post(
    'http://localhost:8000/classify-base64',
    json={'image_base64': image_b64}
)
print(response.json())
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Classify image file
const form = new FormData();
form.append('file', fs.createReadStream('image.jpg'));

axios.post('http://localhost:8000/classify', form, {
    headers: form.getHeaders()
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

### cURL

```bash
# File upload
curl -X POST http://localhost:8000/classify \
  -F "file=@image.jpg"

# Base64
curl -X POST http://localhost:8000/classify-base64 \
  -H "Content-Type: application/json" \
  -d '{"image_base64": "..."}'

# Health check
curl http://localhost:8000/health
```

## License

MIT
