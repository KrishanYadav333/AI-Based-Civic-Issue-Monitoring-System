/**
 * Premium Feature Routes
 * Routes for Smart City features: Voting, Clustering, Budgeting
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const democracyService = require('../services/democracyService');
const budgetService = require('../services/budgetService');
const clusterService = require('../services/clusterService');
const trustService = require('../services/trustService');
const logger = require('../utils/logger');

// ==========================================
// CIVIC VOICE (Democracy)
// ==========================================

/**
 * @route POST /api/premium/issues/:id/vote
 * @desc Upvote an issue to prioritize it
 * @access Protected
 */
router.post('/issues/:id/vote', authenticate, async (req, res) => {
    try {
        const issueId = req.params.id;
        const userId = req.user.id;

        const result = await democracyService.voteForIssue(issueId, userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message.includes('already voted')) {
            return res.status(409).json({ error: error.message });
        }
        logger.error('Vote error:', error);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

/**
 * @route GET /api/premium/issues/:id/vote-status
 * @desc Check if user voted
 * @access Protected
 */
router.get('/issues/:id/vote-status', authenticate, async (req, res) => {
    try {
        const result = await democracyService.getUserVoteStatus(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get vote status' });
    }
});

// ==========================================
// SMART CLUSTERING (Work Batches)
// ==========================================

/**
 * @route GET /api/premium/clusters
 * @desc Get work clusters for engineers
 * @access Protected (Engineer/Admin)
 */
router.get('/clusters', authenticate, async (req, res) => {
    try {
        if (req.user.role === 'surveyor') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const radius = req.query.radius ? parseInt(req.query.radius) : 200;
        const clusters = await clusterService.findWorkClusters(radius);

        res.json({
            count: clusters.length,
            clusters
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clusters' });
    }
});

// ==========================================
// BUDGET PREDICTION
// ==========================================

/**
 * @route POST /api/premium/budget/estimate
 * @desc Get AI cost estimation
 * @access Protected (Admin/Engineer)
 */
router.post('/budget/estimate', authenticate, async (req, res) => {
    try {
        const { issueType, severity } = req.body;

        const estimate = budgetService.estimateCost(issueType, severity);

        res.json(estimate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate estimate' });
    }
});

// ==========================================
// TRUST SCORE (Debug/Admin View)
// ==========================================

/**
 * @route GET /api/premium/users/:id/trust
 * @desc Get user trust metrics
 * @access Protected (Admin)
 */
router.get('/users/:id/trust', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Trigger recalculation to ensure freshness
        const score = await trustService.recalculateTrustScore(req.params.id);
        const action = await trustService.getTriageAction(req.params.id);

        res.json({
            trust_score: score,
            triage_action: action
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get trust score' });
    }
});

module.exports = router;
