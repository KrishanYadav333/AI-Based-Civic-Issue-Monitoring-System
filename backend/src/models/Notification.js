/**
 * Notification Model
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    issue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'issue_assigned',
            'issue_resolved',
            'issue_rejected',
            'priority_escalated',
            'civic_voice_alert',
            'system_update',
            'comment_added',
            'status_updated'
        ]
    },
    title: {
        type: String,
        required: true,
        maxLength: 255
    },
    message: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false,
        index: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

// Virtual for time ago
notificationSchema.virtual('time').get(function() {
    const now = new Date();
    const diffMs = now - this.created_at;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
