/**
 * MongoDB User Seed Script
 * Creates default admin, engineer, and surveyor users
 */

require('../backend/node_modules/dotenv').config({ path: '../backend/.env' });
const mongoose = require('../backend/node_modules/mongoose');
const bcrypt = require('../backend/node_modules/bcrypt');
const User = require('../backend/src/models/User');
const Ward = require('../backend/src/models/Ward');
const IssueType = require('../backend/src/models/IssueType');

const MONGODB_URI = process.env.MONGODB_URI || 
    `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'civic_issues'}`;

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Ward.deleteMany({});
        await IssueType.deleteMany({});
        console.log('Cleared existing data');

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create Issue Types
        const issueTypes = await IssueType.insertMany([
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
            }
        ]);
        console.log(`Created ${issueTypes.length} issue types`);

        // Create Wards (19 wards for Vadodara)
        const wards = [];
        for (let i = 1; i <= 19; i++) {
            wards.push({
                ward_number: i,
                ward_name: `Ward ${i}`,
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
                area: 5000000,
                population: 50000 + (i * 1000)
            });
        }
        const createdWards = await Ward.insertMany(wards);
        console.log(`Created ${createdWards.length} wards`);

        // Create Admin User
        const admin = await User.create({
            email: 'admin@civic.com',
            username: 'admin@civic.com',
            password_hash: hashedPassword,
            full_name: 'System Admin',
            role: 'admin',
            phone: '+91-1234567890',
            is_active: true
        });
        console.log(`Created admin user: ${admin.email}`);

        // Create Engineers (one for each ward)
        for (let i = 0; i < 5; i++) {
            await User.create({
                email: `engineer${i + 1}@civic.com`,
                username: `engineer${i + 1}@civic.com`,
                password_hash: hashedPassword,
                full_name: `Engineer ${i + 1}`,
                role: 'engineer',
                ward_id: createdWards[i]._id,
                phone: `+91-987654321${i}`,
                is_active: true
            });
        }
        console.log('Created 5 engineer users');

        // Create Surveyors
        for (let i = 0; i < 3; i++) {
            await User.create({
                email: `surveyor${i + 1}@civic.com`,
                username: `surveyor${i + 1}@civic.com`,
                password_hash: hashedPassword,
                full_name: `Surveyor ${i + 1}`,
                role: 'surveyor',
                phone: `+91-876543210${i}`,
                is_active: true
            });
        }
        console.log('Created 3 surveyor users');

        console.log('\n=== Seed Complete ===');
        console.log('Default password for all users: admin123');
        console.log('\nTest Accounts:');
        console.log('Admin: admin@civic.com / admin123');
        console.log('Engineer: engineer1@civic.com / admin123');
        console.log('Surveyor: surveyor1@civic.com / admin123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
