/**
 * IssueType Model - MongoDB Schema
 */

const mongoose = require('mongoose');

const issueTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    priority_default: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
issueTypeSchema.index({ name: 1 });
issueTypeSchema.index({ is_active: 1 });

module.exports = mongoose.model('IssueType', issueTypeSchema);
