/**
 * Issue Model - MongoDB Schema with Geospatial Support
 */

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    // Geospatial location (GeoJSON Point)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    issue_type: {
        type: String,
        enum: ['pothole', 'streetlight', 'garbage', 'drainage', 'water_supply', 'road_damage', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    ward_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward'
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    surveyor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resolution_notes: {
        type: String,
        default: ''
    },
    resolution_image_url: {
        type: String
    },
    resolved_at: {
        type: Date,
        default: null
    },
    ai_confidence: {
        type: Number,
        default: 0
    },
    department: {
        type: String,
        trim: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Geospatial index for location queries (nearby issues)
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, priority: -1 });
issueSchema.index({ ward_id: 1 });
issueSchema.index({ assigned_to: 1 });
issueSchema.index({ submitted_by: 1 });
issueSchema.index({ created_at: -1 });

// Pre-save hook to ensure location GeoJSON is set from lat/lng
issueSchema.pre('save', function(next) {
    if (this.latitude && this.longitude) {
        this.location = {
            type: 'Point',
            coordinates: [this.longitude, this.latitude]
        };
    }
    next();
});

module.exports = mongoose.model('Issue', issueSchema);
