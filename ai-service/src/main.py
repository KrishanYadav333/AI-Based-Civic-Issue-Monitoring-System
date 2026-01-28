"""
FastAPI Main Application
Civic Issue Image Classification API
"""

import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime

from .config import config, ClassificationRequest, ClassificationResponse
from .model import get_model_handler
from .classifier import get_classification_service
from .cache import get_cache_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Civic Issue Classification API",
    description="YOLOv8-based image classification for civic issues - 100% FREE STACK",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services
model_handler = None
classifier = None
cache = None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global model_handler, classifier, cache
    
    logger.info("=" * 60)
    logger.info("Starting Civic Issue Classification API")
    logger.info(f"Environment: {config.ENVIRONMENT}")
    logger.info(f"Model: {config.MODEL_PATH}")
    logger.info(f"Device: {config.MODEL_DEVICE}")
    logger.info(f"Confidence Threshold: {config.CONFIDENCE_THRESHOLD}")
    logger.info("=" * 60)
    
    try:
        # Initialize model
        logger.info("Loading YOLOv8 model...")
        model_handler = get_model_handler()
        logger.info("✓ Model loaded successfully")
        
        # Initialize classifier
        logger.info("Initializing classifier...")
        classifier = get_classification_service()
        logger.info("✓ Classifier initialized")
        
        # Initialize cache
        logger.info("Connecting to Redis cache...")
        cache = get_cache_service()
        if cache.enabled:
            logger.info("✓ Cache connected")
        else:
            logger.warning("⚠ Cache not available (continuing without cache)")
        
        logger.info("=" * 60)
        logger.info("API ready to accept requests")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down API...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Civic Issue Classification API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check model
        model_info = model_handler.get_model_info()
        
        # Check cache
        cache_stats = cache.get_stats()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "model": {
                "loaded": model_info['loaded'],
                "device": model_info['device'],
                "confidence_threshold": model_info['confidence_threshold']
            },
            "cache": {
                "enabled": cache_stats.get('enabled', False),
                "connected": cache_stats.get('connected', False)
            }
        }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@app.get("/model-info")
async def get_model_info():
    """Get model information"""
    try:
        info = model_handler.get_model_info()
        return {
            "success": True,
            "data": info,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify", response_model=ClassificationResponse)
async def classify_image(file: UploadFile = File(...)):
    """
    Classify civic issue from image
    
    Args:
        file: Image file (jpg, png, jpeg)
        
    Returns:
        Classification result with issue type and confidence
    """
    temp_path = None
    
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only images are allowed."
            )
        
        # Save uploaded file temporarily
        os.makedirs('./temp', exist_ok=True)
        temp_path = f"./temp/{datetime.now().timestamp()}_{file.filename}"
        
        with open(temp_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Processing image: {file.filename} ({len(content)} bytes)")
        
        # Check cache first
        cached_result = cache.get(image_path=temp_path)
        if cached_result:
            logger.info("Returning cached classification result")
            return ClassificationResponse(**cached_result)
        
        # Run inference
        logger.info("Running YOLOv8 inference...")
        detections = model_handler.predict(temp_path)
        logger.info(f"Found {len(detections)} detections")
        
        # Classify issue
        result = classifier.classify_issue(detections)
        logger.info(f"Classification: {result['issue_type']} (confidence: {result['confidence']:.2f})")
        
        # Cache result
        cache.set(result, image_path=temp_path)
        
        return ClassificationResponse(**result)
    
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"Error classifying image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
    
    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass


@app.post("/classify-base64", response_model=ClassificationResponse)
async def classify_base64(request: ClassificationRequest):
    """
    Classify civic issue from base64 encoded image
    
    Args:
        request: Classification request with base64 image
        
    Returns:
        Classification result with issue type and confidence
    """
    try:
        if not request.image_base64:
            raise HTTPException(
                status_code=400,
                detail="image_base64 is required"
            )
        
        logger.info("Processing base64 image")
        
        # Check cache
        cached_result = cache.get(image_base64=request.image_base64)
        if cached_result:
            logger.info("Returning cached classification result")
            return ClassificationResponse(**cached_result)
        
        # Run inference
        logger.info("Running YOLOv8 inference...")
        detections = model_handler.predict_from_base64(request.image_base64)
        logger.info(f"Found {len(detections)} detections")
        
        # Classify issue
        result = classifier.classify_issue(detections)
        logger.info(f"Classification: {result['issue_type']} (confidence: {result['confidence']:.2f})")
        
        # Cache result
        cache.set(result, image_base64=request.image_base64)
        
        return ClassificationResponse(**result)
    
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"Error classifying base64 image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = cache.get_stats()
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cache/clear")
async def clear_cache():
    """Clear all cached classifications"""
    try:
        success = cache.clear()
        return {
            "success": success,
            "message": "Cache cleared successfully" if success else "Cache clear failed",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if config.ENVIRONMENT == 'development' else "An error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


if __name__ == "__main__":
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=config.ENVIRONMENT == "development",
        log_level="info"
    )
