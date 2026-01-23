/**
 * User Model - MongoDB Schema
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['surveyor', 'engineer', 'admin'],
        required: true
    },
    ward_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
        default: null
    },
    phone: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ ward_id: 1 });

module.exports = mongoose.model('User', userSchema);
