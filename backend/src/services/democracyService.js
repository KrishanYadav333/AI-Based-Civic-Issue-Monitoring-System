/**
 * Democracy Service
 * Handles Civic Voice Protocol (Voting & Priority Escalation)
 */

const db = require('./database');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

/**
 * Vote for an issue
 * @param {string} issueId 
 * @param {string} userId 
 * @returns {Promise<Object>} Updated vote count and status
 */
async function voteForIssue(issueId, userId) {
    try {
        // 1. Check if issue exists
        const issue = await db.findOne('issues', { id: issueId });
        if (!issue) {
            throw new Error('Issue not found');
        }

        // 2. Check if user already voted
        const existingVote = await db.query(
            'SELECT id FROM issue_votes WHERE issue_id = $1 AND user_id = $2',
            [issueId, userId]
        );

        if (existingVote.rows.length > 0) {
            throw new Error('User has already voted for this issue');
        }

        // 3. Record Vote
        await db.query(
            'INSERT INTO issue_votes (issue_id, user_id) VALUES ($1, $2)',
            [issueId, userId]
        );

        // 4. Manually increment upvotes (since trigger may not exist)
        const currentUpvotes = issue.upvotes || 0;
        const newUpvotes = currentUpvotes + 1;

        // Check if priority should escalate (50+ votes = critical)
        const shouldEscalate = newUpvotes >= 50 && issue.priority !== 'critical' &&
            !['resolved', 'closed', 'rejected'].includes(issue.status);

        const newPriority = shouldEscalate ? 'critical' : issue.priority;

        await db.query(
            'UPDATE issues SET upvotes = $1, priority = $2 WHERE id = $3',
            [newUpvotes, newPriority, issueId]
        );

        // 5. If Priority escalated, Notify Admin
        if (shouldEscalate) {
            logger.info(`🚨 Issue ${issue.issue_number} escalated to CRITICAL via Civic Voice!`);
            await notificationService.notifyAdminOfEscalation({ ...issue, priority: 'critical', upvotes: newUpvotes });
        }

        return {
            success: true,
            upvotes: newUpvotes,
            priority: newPriority,
            message: 'Vote recorded successfully'
        };

    } catch (error) {
        logger.error('Error in voteForIssue:', error);
        throw error;
    }
}

/**
 * Get voting status for a user on an issue
 * @param {string} issueId 
 * @param {string} userId 
 */
async function getUserVoteStatus(issueId, userId) {
    const result = await db.query(
        'SELECT id FROM issue_votes WHERE issue_id = $1 AND user_id = $2',
        [issueId, userId]
    );
    return { hasVoted: result.rows.length > 0 };
}

module.exports = {
    voteForIssue,
    getUserVoteStatus
};
