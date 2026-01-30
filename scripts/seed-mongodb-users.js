/**
 * MongoDB Atlas Seed Script - User Credentials
 * Creates test users with proper bcrypt password hashing
 * 
 * USAGE:
 * node scripts/seed-mongodb-users.js
 * 
 * OR use MongoDB Compass/Atlas UI to run this directly
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_issues';

// User data to seed
const usersToSeed = [
    {
        username: 'admin',
        email: 'admin@vmc.gov.in',
        password: 'Admin@123',
        full_name: 'System Administrator',
        phone: '9876543200',
        role: 'admin'
    },
    {
        username: 'surveyor1',
        email: 'surveyor1@vmc.gov.in',
        password: 'Survey@123',
        full_name: 'Rajesh Kumar',
        phone: '9876543211',
        role: 'surveyor'
    },
    {
        username: 'surveyor2',
        email: 'surveyor2@vmc.gov.in',
        password: 'Survey@123',
        full_name: 'Priya Sharma',
        phone: '9876543212',
        role: 'surveyor'
    },
    {
        username: 'engineer1',
        email: 'engineer1@vmc.gov.in',
        password: 'Engineer@123',
        full_name: 'Amit Patel',
        phone: '9876543213',
        role: 'engineer'
    },
    {
        username: 'engineer2',
        email: 'engineer2@vmc.gov.in',
        password: 'Engineer@123',
        full_name: 'Neha Desai',
        phone: '9876543214',
        role: 'engineer'
    },
    {
        username: 'testuser',
        email: 'test@vmc.com',
        password: 'Test@123456',
        full_name: 'Test User',
        phone: '9999999999',
        role: 'surveyor'
    }
];

// User Schema (simplified - matches backend model)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: String,
    role: { type: String, enum: ['surveyor', 'engineer', 'admin'], default: 'surveyor' },
    phone: String,
    is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const User = mongoose.model('User', userSchema);

async function seedUsers() {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        console.log(`   URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB\n');

        // Clear existing users (optional - comment out to keep existing)
        // await User.deleteMany({});
        // console.log('🗑️  Cleared existing users\n');

        console.log('👥 Creating users with bcrypt hashed passwords...\n');

        for (const userData of usersToSeed) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [
                        { username: userData.username },
                        { email: userData.email }
                    ]
                });

                if (existingUser) {
                    console.log(`⏭️  Skipping ${userData.username} - already exists`);
                    continue;
                }

                // Hash password with bcrypt (10 rounds)
                const password_hash = await bcrypt.hash(userData.password, 10);

                // Create user
                const user = new User({
                    email: userData.email,
                    username: userData.username,
                    password_hash: password_hash,
                    full_name: userData.full_name,
                    phone: userData.phone,
                    role: userData.role,
                    is_active: true
                });

                await user.save();

                console.log(`✅ Created: ${userData.username}`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   Password: ${userData.password}`);
                console.log(`   Role: ${userData.role}\n`);

            } catch (error) {
                console.error(`❌ Error creating ${userData.username}:`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        const userCount = await User.countDocuments();
        console.log(`   Total users in database: ${userCount}`);

        console.log('\n📝 Test Credentials:');
        console.log('   ┌─────────────────────────────────────┐');
        console.log('   │ Username    │ Password      │ Role  │');
        console.log('   ├─────────────────────────────────────┤');
        usersToSeed.forEach(u => {
            console.log(`   │ ${u.username.padEnd(11)} │ ${u.password.padEnd(13)} │ ${u.role.padEnd(5)} │`);
        });
        console.log('   └─────────────────────────────────────┘');

        console.log('\n✅ Seeding complete!\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the seeding
seedUsers();
