/**
 * Trust Service
 * Manages Surveyor Reputation and Auto-Validation Logic
 */

const db = require('./database');
const logger = require('../utils/logger');

// SCORING CONSTANTS
const TRUST_THRESHOLDS = {
    ELITE: 4.5,   // Can auto-approve
    TRUSTED: 3.5, // Standard queue
    NEW: 2.5,     // Standard queue
    SUSPECT: 2.0, // Manual review required
    BANNED: 1.0   // Auto-reject
};

/**
 * Calculate and Update Trust Score for a User
 * Invoked after an issue is verified/rejected
 * @param {string} userId 
 */
async function recalculateTrustScore(userId) {
    try {
        const stats = await db.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as verified
             FROM issues 
             WHERE submitted_by = $1`,
            [userId]
        );

        const { total, verified } = stats.rows[0];

        if (parseInt(total) === 0) return 2.5; // Default

        // Formula: Accuracy * 5.0
        // Damping factor: New users fluctuate less wildly? For now, stick to simple accuracy.
        let newScore = (parseInt(verified) / parseInt(total)) * 5.0;

        // Ensure within bounds
        newScore = Math.max(0, Math.min(5, newScore));

        // Update User
        await db.query(
            'UPDATE users SET trust_score = $1, issues_verified = $2, issues_reported = $3 WHERE id = $4',
            [newScore, verified, total, userId]
        );

        return newScore;

    } catch (error) {
        logger.error('Error recalculating trust score:', error);
    }
}

/**
 * Determine Triage Status based on Trust Score
 * @param {string} userId 
 * @returns {string} 'auto_approve' | 'standard' | 'manual_review' | 'auto_reject'
 */
async function getTriageAction(userId) {
    const user = await db.findOne('users', { id: userId });
    if (!user) return 'standard';

    const score = user.trust_score || 2.5;

    if (score >= TRUST_THRESHOLDS.ELITE) return 'auto_approve';
    if (score <= TRUST_THRESHOLDS.BANNED) return 'auto_reject';
    if (score < TRUST_THRESHOLDS.SUSPECT) return 'manual_review';

    return 'standard';
}

module.exports = {
    recalculateTrustScore,
    getTriageAction,
    TRUST_THRESHOLDS
};
