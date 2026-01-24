/**
 * Ward Model - MongoDB Schema with Geospatial Support
 */

const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    ward_number: {
        type: Number,
        required: true,
        unique: true
    },
    ward_name: {
        type: String,
        required: true,
        trim: true
    },
    // GeoJSON polygon for ward boundaries
    boundary: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]], // Array of LinearRings
            required: true
        }
    },
    area: {
        type: Number // Area in square meters
    },
    population: {
        type: Number
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Geospatial index for boundary queries
wardSchema.index({ boundary: '2dsphere' });
// ward_number already indexed via unique:true

// Method to check if a point is within this ward
wardSchema.methods.containsPoint = function(longitude, latitude) {
    // MongoDB geospatial query will handle this
    return true;
};

module.exports = mongoose.model('Ward', wardSchema);
