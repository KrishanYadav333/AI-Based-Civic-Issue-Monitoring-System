/**
 * IssueLog Model - MongoDB Schema for Audit Trail
 */

const mongoose = require('mongoose');

const issueLogSchema = new mongoose.Schema({
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    action: {
        type: String,
        enum: ['created', 'assigned', 'in_progress', 'resolved', 'rejected', 'reassigned', 'updated'],
        required: true
    },
    old_value: {
        type: String
    },
    new_value: {
        type: String
    },
    notes: {
        type: String
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Indexes
issueLogSchema.index({ issue_id: 1, created_at: -1 });
issueLogSchema.index({ created_by: 1 });

module.exports = mongoose.model('IssueLog', issueLogSchema);
