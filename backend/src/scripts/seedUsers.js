/**
 * Seed Users to Local MongoDB
 * Creates test users with plain text passwords for development
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Users with PLAIN TEXT passwords (for demo)
const users = [
    {
        username: 'admin',
        email: 'admin@vmc.gov.in',
        password_hash: 'Admin@123',  // Plain text (as per authService.js)
        full_name: 'System Administrator',
        phone: '9876543200',
        role: 'admin'
    },
    {
        username: 'surveyor1',
        email: 'surveyor1@vmc.gov.in',
        password_hash: 'Survey@123',  // Plain text
        full_name: 'Rajesh Kumar',
        phone: '9876543211',
        role: 'surveyor'
    },
    {
        username: 'surveyor2',
        email: 'surveyor2@vmc.gov.in',
        password_hash: 'Survey@123',  // Plain text
        full_name: 'Priya Sharma',
        phone: '9876543212',
        role: 'surveyor'
    },
    {
        username: 'engineer1',
        email: 'engineer1@vmc.gov.in',
        password_hash: 'Engineer@123',  // Plain text
        full_name: 'Amit Patel',
        phone: '9876543213',
        role: 'engineer'
    },
    {
        username: 'engineer2',
        email: 'engineer2@vmc.gov.in',
        password_hash: 'Engineer@123',  // Plain text
        full_name: 'Neha Desai',
        phone: '9876543214',
        role: 'engineer'
    }
];

async function seedUsers() {
    try {
        console.log('🌱 Seeding users to local MongoDB...\n');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        console.log('👥 Creating users with plain text passwords...\n');

        for (const userData of users) {
            try {
                const existing = await User.findOne({
                    $or: [{ username: userData.username }, { email: userData.email }]
                });

                if (existing) {
                    console.log(`⏭️  Skipping ${userData.username} - already exists`);
                    continue;
                }

                const user = new User(userData);
                await user.save();

                console.log(`✅ Created: ${userData.username}`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   Password: ${userData.password_hash}`);
                console.log(`   Role: ${userData.role}\n`);

            } catch (error) {
                console.error(`❌ Error creating ${userData.username}:`, error.message);
            }
        }

        const count = await User.countDocuments();
        console.log(`📊 Total users in database: ${count}\n`);

        console.log('📝 Test Credentials:');
        console.log('┌────────────┬───────────────┬──────────┐');
        console.log('│ Username   │ Password      │ Role     │');
        console.log('├────────────┼───────────────┼──────────┤');
        users.forEach(u => {
            console.log(`│ ${u.username.padEnd(10)} │ ${u.password_hash.padEnd(13)} │ ${u.role.padEnd(8)} │`);
        });
        console.log('└────────────┴───────────────┴──────────┘\n');

        console.log('✅ User seeding complete!\n');
        console.log('💡 You can now:');
        console.log('   1. Run: node src/scripts/createTestNotifications.js');
        console.log('   2. Login at http://localhost:5173/login\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedUsers();
