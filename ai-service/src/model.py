"""
YOLOv8 Model Handler
100% FREE - Open-source YOLOv8 from Ultralytics
"""

import os
try:
    from ultralytics.yolo.engine.model import YOLO
except ImportError:
    from ultralytics.yolo.engine.model import YOLO
from PIL import Image
import numpy as np
import logging
from typing import List, Dict, Optional
import torch

from config import config

logger = logging.getLogger(__name__)


class YOLOv8Handler:
    """Handler for YOLOv8 model operations"""
    
    def __init__(self):
        self.model = None
        self.device = config.MODEL_DEVICE
        self.confidence_threshold = config.CONFIDENCE_THRESHOLD
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize YOLOv8 model"""
        try:
            # Check if model file exists
            if not os.path.exists(config.MODEL_PATH):
                logger.warning(f"Model not found at {config.MODEL_PATH}, downloading YOLOv8n...")
                # YOLOv8 will automatically download if not found
                self.model = YOLO('yolov8n.pt')  # Nano version (fastest, smallest)
                
                # Save to configured path
                os.makedirs(os.path.dirname(config.MODEL_PATH), exist_ok=True)
                self.model.save(config.MODEL_PATH)
            else:
                logger.info(f"Loading model from {config.MODEL_PATH}")
                self.model = YOLO(config.MODEL_PATH)
            
            # Set device (CPU or CUDA)
            if self.device == 'cuda' and torch.cuda.is_available():
                self.model.to('cuda')
                logger.info("Model loaded on CUDA")
            else:
                self.model.to('cpu')
                logger.info("Model loaded on CPU")
            
            logger.info("YOLOv8 model initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize model: {str(e)}")
            raise
    
    def predict(self, image_path: str) -> List[Dict]:
        """
        Run inference on image
        
        Args:
            image_path: Path to image file
            
        Returns:
            List of detections with class, confidence, and bbox
        """
        try:
            # Run inference
            results = self.model(
                image_path,
                conf=self.confidence_threshold,
                verbose=False
            )
            
            detections = []
            
            # Process results
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    # Get class name
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    
                    # Get confidence
                    confidence = float(box.conf[0])
                    
                    # Get bounding box coordinates
                    bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                    
                    detections.append({
                        'class_name': class_name,
                        'confidence': confidence,
                        'bbox': bbox
                    })
            
            # Sort by confidence (highest first)
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            return detections
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def predict_from_base64(self, image_base64: str) -> List[Dict]:
        """
        Run inference on base64 encoded image
        
        Args:
            image_base64: Base64 encoded image string
            
        Returns:
            List of detections
        """
        import base64
        import io
        
        try:
            # Decode base64 to image
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to numpy array
            image_np = np.array(image)
            
            # Run inference
            results = self.model(
                image_np,
                conf=self.confidence_threshold,
                verbose=False
            )
            
            detections = []
            
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    class_id = int(box.cls[0])
                    class_name = result.names[class_id]
                    confidence = float(box.conf[0])
                    bbox = box.xyxy[0].tolist()
                    
                    detections.append({
                        'class_name': class_name,
                        'confidence': confidence,
                        'bbox': bbox
                    })
            
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            return detections
            
        except Exception as e:
            logger.error(f"Base64 prediction failed: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            'model_path': config.MODEL_PATH,
            'device': self.device,
            'confidence_threshold': self.confidence_threshold,
            'model_loaded': self.model is not None,
            'cuda_available': torch.cuda.is_available(),
        }


# Global model instance
model_handler = None


def get_model_handler() -> YOLOv8Handler:
    """Get or create model handler singleton"""
    global model_handler
    if model_handler is None:
        model_handler = YOLOv8Handler()
    return model_handler
