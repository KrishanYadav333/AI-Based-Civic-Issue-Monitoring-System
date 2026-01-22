"""
AI Classification Service
FastAPI + YOLOv8 - 100% FREE STACK
"""

import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
class Config:
    # Server
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    
    # Model
    MODEL_PATH = os.getenv('MODEL_PATH', './models/yolov8n.pt')
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.25))
    MODEL_DEVICE = os.getenv('MODEL_DEVICE', 'cpu')  # 'cpu' or 'cuda'
    
    # Redis Cache
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
    CACHE_TTL = int(os.getenv('CACHE_TTL', 3600))
    
    # Issue Type Mapping (AI class -> Issue type)
    ISSUE_TYPE_MAPPING = {
        'pothole': 'pothole',
        'road_damage': 'pothole',
        'garbage': 'garbage',
        'trash': 'garbage',
        'waste': 'garbage',
        'debris': 'debris',
        'rubble': 'debris',
        'construction_waste': 'debris',
        'cow': 'stray_cattle',
        'cattle': 'stray_cattle',
        'buffalo': 'stray_cattle',
        'animal': 'stray_cattle',
        'broken_road': 'broken_road',
        'road_crack': 'broken_road',
        'damaged_road': 'broken_road',
        'manhole': 'open_manhole',
        'open_drain': 'open_manhole',
        'uncovered_drain': 'open_manhole',
    }

config = Config()

# Request/Response Models
class ClassificationRequest(BaseModel):
    image_path: Optional[str] = None
    image_base64: Optional[str] = None

class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: list

class ClassificationResponse(BaseModel):
    success: bool
    issue_type: str
    confidence: float
    ai_class: str
    alternative_classes: list
    all_detections: list
    message: str
