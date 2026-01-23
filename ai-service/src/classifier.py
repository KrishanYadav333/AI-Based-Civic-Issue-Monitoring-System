"""
Classification Service
Maps YOLOv8 detections to civic issue types
"""

import logging
from typing import List, Dict, Optional
from config import config

logger = logging.getLogger(__name__)


class ClassificationService:
    """Service to classify civic issues from YOLOv8 detections"""
    
    def __init__(self):
        self.issue_mapping = config.ISSUE_TYPE_MAPPING
    
    def map_detection_to_issue_type(self, class_name: str) -> Optional[str]:
        """
        Map YOLOv8 class name to civic issue type
        
        Args:
            class_name: YOLO detected class name
            
        Returns:
            Issue type code or None
        """
        class_lower = class_name.lower().replace('-', '_').replace(' ', '_')
        return self.issue_mapping.get(class_lower)
    
    def classify_issue(self, detections: List[Dict]) -> Dict:
        """
        Classify civic issue from detections
        
        Args:
            detections: List of YOLO detections
            
        Returns:
            Classification result with issue type and confidence
        """
        if not detections:
            return {
                'success': False,
                'issue_type': None,
                'confidence': 0.0,
                'ai_class': None,
                'alternative_classes': [],
                'all_detections': [],
                'message': 'No objects detected in image'
            }
        
        # Get top detection
        top_detection = detections[0]
        top_class = top_detection['class_name']
        top_confidence = top_detection['confidence']
        
        # Map to issue type
        issue_type = self.map_detection_to_issue_type(top_class)
        
        if issue_type is None:
            # Try to find any mapped detection
            for det in detections:
                mapped_type = self.map_detection_to_issue_type(det['class_name'])
                if mapped_type:
                    issue_type = mapped_type
                    top_class = det['class_name']
                    top_confidence = det['confidence']
                    break
        
        # Get alternative classifications
        alternatives = []
        for det in detections[1:6]:  # Top 5 alternatives
            mapped = self.map_detection_to_issue_type(det['class_name'])
            if mapped and mapped != issue_type:
                alternatives.append({
                    'issue_type': mapped,
                    'ai_class': det['class_name'],
                    'confidence': det['confidence']
                })
        
        # Remove duplicates from alternatives
        seen_types = {issue_type}
        unique_alternatives = []
        for alt in alternatives:
            if alt['issue_type'] not in seen_types:
                unique_alternatives.append(alt)
                seen_types.add(alt['issue_type'])
        
        if issue_type is None:
            return {
                'success': False,
                'issue_type': None,
                'confidence': top_confidence,
                'ai_class': top_class,
                'alternative_classes': unique_alternatives,
                'all_detections': detections,
                'message': f'Detected "{top_class}" but no mapping to civic issue type'
            }
        
        return {
            'success': True,
            'issue_type': issue_type,
            'confidence': top_confidence,
            'ai_class': top_class,
            'alternative_classes': unique_alternatives,
            'all_detections': detections,
            'message': 'Classification successful'
        }
    
    def get_confidence_level(self, confidence: float) -> str:
        """Get confidence level description"""
        if confidence >= 0.9:
            return 'very_high'
        elif confidence >= 0.75:
            return 'high'
        elif confidence >= 0.5:
            return 'medium'
        elif confidence >= 0.25:
            return 'low'
        else:
            return 'very_low'


# Global service instance
classification_service = None


def get_classification_service() -> ClassificationService:
    """Get or create classification service singleton"""
    global classification_service
    if classification_service is None:
        classification_service = ClassificationService()
    return classification_service
