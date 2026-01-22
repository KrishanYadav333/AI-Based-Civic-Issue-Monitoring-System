/**
 * AI Classification Service
 * Integrates with FastAPI AI service for image classification
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');
const { AI_CONFIG } = require('../core/constants');
const { mapAIClassToIssueType } = require('../utils/helpers');

// AI Service base URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Classify image from file path
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Classification result
 */
async function classifyImageFromFile(imagePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));
        
        logger.info(`Sending image to AI service: ${imagePath}`);
        
        // Call AI service
        const response = await axios.post(
            `${AI_SERVICE_URL}/classify`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: AI_CONFIG.REQUEST_TIMEOUT_MS || 30000
            }
        );
        
        const result = response.data;
        
        if (result.success) {
            logger.info(`Classification successful: ${result.issue_type} (confidence: ${result.confidence})`);
        } else {
            logger.warn(`Classification failed: ${result.message}`);
        }
        
        return result;
        
    } catch (error) {
        logger.error('Error classifying image from file:', {
            error: error.message,
            path: imagePath,
            response: error.response?.data
        });
        
        // Return error result
        return {
            success: false,
            issue_type: null,
            confidence: 0,
            ai_class: null,
            alternative_classes: [],
            all_detections: [],
            message: `AI service error: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Classify image from base64 string
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Classification result
 */
async function classifyImageFromBase64(imageBase64) {
    try {
        if (!imageBase64) {
            throw new Error('Base64 image data is required');
        }
        
        logger.info('Sending base64 image to AI service');
        
        // Call AI service
        const response = await axios.post(
            `${AI_SERVICE_URL}/classify-base64`,
            {
                image_base64: imageBase64
            },
            {
                timeout: AI_CONFIG.REQUEST_TIMEOUT_MS || 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = response.data;
        
        if (result.success) {
            logger.info(`Classification successful: ${result.issue_type} (confidence: ${result.confidence})`);
        } else {
            logger.warn(`Classification failed: ${result.message}`);
        }
        
        return result;
        
    } catch (error) {
        logger.error('Error classifying base64 image:', {
            error: error.message,
            response: error.response?.data
        });
        
        return {
            success: false,
            issue_type: null,
            confidence: 0,
            ai_class: null,
            alternative_classes: [],
            all_detections: [],
            message: `AI service error: ${error.message}`,
            error: error.message
        };
    }
}

/**
 * Check AI service health
 * @returns {Promise<Object>} Health status
 */
async function checkAIServiceHealth() {
    try {
        const response = await axios.get(
            `${AI_SERVICE_URL}/health`,
            { timeout: 5000 }
        );
        
        return {
            available: true,
            status: response.data.status,
            details: response.data
        };
        
    } catch (error) {
        logger.error('AI service health check failed:', error.message);
        
        return {
            available: false,
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Get AI model information
 * @returns {Promise<Object>} Model info
 */
async function getModelInfo() {
    try {
        const response = await axios.get(
            `${AI_SERVICE_URL}/model-info`,
            { timeout: 5000 }
        );
        
        return response.data;
        
    } catch (error) {
        logger.error('Error getting model info:', error.message);
        throw error;
    }
}

/**
 * Validate classification result
 * @param {Object} classification - Classification result
 * @returns {Object} Validation result
 */
function validateClassification(classification) {
    if (!classification) {
        return {
            valid: false,
            error: 'Classification result is null'
        };
    }
    
    if (!classification.success) {
        return {
            valid: false,
            error: classification.message || 'Classification failed'
        };
    }
    
    if (!classification.issue_type) {
        return {
            valid: false,
            error: 'No issue type detected'
        };
    }
    
    if (classification.confidence < AI_CONFIG.MIN_CONFIDENCE) {
        return {
            valid: false,
            error: `Confidence too low: ${classification.confidence} < ${AI_CONFIG.MIN_CONFIDENCE}`,
            lowConfidence: true
        };
    }
    
    return {
        valid: true,
        issueType: classification.issue_type,
        confidence: classification.confidence,
        aiClass: classification.ai_class
    };
}

/**
 * Process classification result for issue creation
 * @param {Object} classification - Classification result
 * @param {Object} options - Processing options
 * @returns {Object} Processed result
 */
function processClassificationResult(classification, options = {}) {
    const validation = validateClassification(classification);
    
    return {
        success: validation.valid,
        issueType: validation.issueType || null,
        confidence: classification.confidence || 0,
        aiClass: classification.ai_class || null,
        alternativeClasses: classification.alternative_classes || [],
        allDetections: classification.all_detections || [],
        error: validation.error || null,
        lowConfidence: validation.lowConfidence || false,
        requiresManualReview: validation.lowConfidence || !validation.valid
    };
}

/**
 * Get confidence level description
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Confidence level
 */
function getConfidenceLevel(confidence) {
    if (confidence >= 0.9) return 'very_high';
    if (confidence >= 0.75) return 'high';
    if (confidence >= 0.5) return 'medium';
    if (confidence >= 0.25) return 'low';
    return 'very_low';
}

module.exports = {
    classifyImageFromFile,
    classifyImageFromBase64,
    checkAIServiceHealth,
    getModelInfo,
    validateClassification,
    processClassificationResult,
    getConfidenceLevel
};
