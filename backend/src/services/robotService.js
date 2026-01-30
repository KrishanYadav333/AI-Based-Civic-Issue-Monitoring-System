/**
 * Robot Service - Multi-Model Complete Analysis
 * Calls robot-service (port 5001) for comprehensive issue detection
 * Uses 8 Roboflow models for complete analysis
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');

const ROBOT_SERVICE_URL = process.env.ROBOT_SERVICE_URL || 'http://localhost:5001';

/**
 * Complete analysis using robot service (8+ detection models)
 * Use this for "Complete Analysis" option
 */
const analyzeImageComplete = async (imagePath) => {
    try {
        logger.info(`Calling robot service for complete analysis: ${imagePath}`);
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));
        
        const response = await axios.post(
            `${ROBOT_SERVICE_URL}/detect`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: 30000
            }
        );

        logger.info('Robot service analysis successful', { 
            totalIssues: response.data.total_issues,
            detectedTypes: Object.keys(response.data.issues_detected).filter(k => response.data.issues_detected[k] > 0)
        });

        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        logger.error('Robot service analysis failed', { 
            error: error.message,
            imagePath 
        });

        // Fallback to basic response
        return {
            success: false,
            error: error.message,
            data: {
                issues_detected: {
                    potholes: 0,
                    garbage: 0,
                    manholes: 0,
                    damaged_roads: 0,
                    construction_debris: 0,
                    stray_animals: 0,
                    water_leakage: 0,
                    visual_pollution: 0
                },
                total_issues: 0,
                severity_score: 0,
                message: 'Robot service unavailable - analysis incomplete'
            }
        };
    }
};

/**
 * Robot submission with base64 image
 * For autonomous robot surveys
 */
const robotSubmit = async (imageBase64, latitude, longitude, robotId) => {
    try {
        const response = await axios.post(
            `${ROBOT_SERVICE_URL}/robot/submit`,
            {
                image: imageBase64,
                latitude,
                longitude,
                robot_id: robotId
            },
            { timeout: 30000 }
        );

        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        logger.error('Robot submit failed', { error: error.message });
        throw error;
    }
};

/**
 * Get robot surveys
 */
const getRobotSurveys = async (limit = 50) => {
    try {
        const response = await axios.get(
            `${ROBOT_SERVICE_URL}/surveys`,
            { 
                params: { limit },
                timeout: 10000 
            }
        );

        return response.data;

    } catch (error) {
        logger.error('Failed to get robot surveys', { error: error.message });
        throw error;
    }
};

/**
 * Get robot statistics
 */
const getRobotStats = async () => {
    try {
        const response = await axios.get(
            `${ROBOT_SERVICE_URL}/admin/stats`,
            { timeout: 10000 }
        );

        return response.data;

    } catch (error) {
        logger.error('Failed to get robot stats', { error: error.message });
        throw error;
    }
};

/**
 * Check robot service health
 */
const checkRobotHealth = async () => {
    try {
        const response = await axios.get(
            `${ROBOT_SERVICE_URL}/health`,
            { timeout: 5000 }
        );

        return {
            available: true,
            status: response.data
        };

    } catch (error) {
        return {
            available: false,
            error: error.message
        };
    }
};

module.exports = {
    analyzeImageComplete,
    robotSubmit,
    getRobotSurveys,
    getRobotStats,
    checkRobotHealth
};
