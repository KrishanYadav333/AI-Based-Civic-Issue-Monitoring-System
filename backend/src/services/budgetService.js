/**
 * Budget Service
 * AI-driven Cost Estimation for Repairs
 */

const logger = require('../utils/logger');

// Base rates (Mock Data - INR)
const RATES = {
    'pothole': { base: 2000, variable: 500 }, // per sq ft approx logic
    'garbage': { base: 1000, variable: 200 },
    'broken_road': { base: 15000, variable: 5000 },
    'street_light': { base: 3000, variable: 0 },
    'water_leakage': { base: 5000, variable: 2000 }
};

/**
 * Estimate Repair Cost
 * @param {string} issueType - The type code
 * @param {number} severity - 0.0 to 1.0 (from AI confidence or manual input)
 * @returns {Object} { min, max, estimated }
 */
function estimateCost(issueType, severity = 0.5) {
    const rate = RATES[issueType] || { base: 1000, variable: 500 };

    // Severity multiplier: 0.1 -> 1.0, 1.0 -> 2.5
    const severityMultiplier = 1.0 + (severity * 1.5);

    const estimated = Math.round(rate.base + (rate.variable * severityMultiplier));
    const variance = estimated * 0.2; // +/- 20%

    return {
        currency: 'INR',
        estimated: estimated,
        range: {
            min: Math.round(estimated - variance),
            max: Math.round(estimated + variance)
        },
        breakdown: {
            base_cost: rate.base,
            severity_adjustment: Math.round(rate.variable * severityMultiplier)
        }
    };
}

module.exports = {
    estimateCost
};
