// MongoDB Seed Data Script
// Run with: mongosh civic_issues seed-data.js

db = db.getSiblingDB('civic_issues');

// Seed Issue Types
const issueTypes = [
    {
        name: 'pothole',
        description: 'Road surface damage, potholes',
        department: 'Public Works',
        priority_default: 'high',
        is_active: true
    },
    {
        name: 'streetlight',
        description: 'Street lighting issues',
        department: 'Electrical',
        priority_default: 'medium',
        is_active: true
    },
    {
        name: 'garbage',
        description: 'Waste management issues',
        department: 'Sanitation',
        priority_default: 'high',
        is_active: true
    },
    {
        name: 'drainage',
        description: 'Drainage and sewage problems',
        department: 'Public Works',
        priority_default: 'high',
        is_active: true
    },
    {
        name: 'water_supply',
        description: 'Water supply issues',
        department: 'Water Works',
        priority_default: 'critical',
        is_active: true
    },
    {
        name: 'road_damage',
        description: 'General road damage',
        department: 'Public Works',
        priority_default: 'medium',
        is_active: true
    },
    {
        name: 'other',
        description: 'Other civic issues',
        department: 'General',
        priority_default: 'low',
        is_active: true
    }
];

db.issuetypes.insertMany(issueTypes);
print(`Inserted ${issueTypes.length} issue types`);

// Seed Sample Wards (Vadodara - 19 wards)
// Note: Add actual GeoJSON polygon coordinates for production
const wards = [];
for (let i = 1; i <= 19; i++) {
    wards.push({
        ward_number: i,
        ward_name: `Ward ${i}`,
        // Placeholder boundary - replace with actual GeoJSON polygons
        boundary: {
            type: 'Polygon',
            coordinates: [[
                [73.1 + (i * 0.01), 22.3 + (i * 0.01)],
                [73.1 + (i * 0.01) + 0.05, 22.3 + (i * 0.01)],
                [73.1 + (i * 0.01) + 0.05, 22.3 + (i * 0.01) + 0.05],
                [73.1 + (i * 0.01), 22.3 + (i * 0.01) + 0.05],
                [73.1 + (i * 0.01), 22.3 + (i * 0.01)]
            ]]
        },
        area: 5000000, // Placeholder area in square meters
        population: 50000 + (i * 1000)
    });
}

db.wards.insertMany(wards);
print(`Inserted ${wards.length} wards`);

print('Seed data insertion complete');
