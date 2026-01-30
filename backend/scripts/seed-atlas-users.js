/**
 * MongoDB Atlas Direct Seeding - Plain Text Passwords
 * Seeds users directly to MongoDB Atlas (not localhost)
 * 
 * USAGE: Provide MongoDB Atlas URI as environment variable or command line argument
 * node seed-atlas-users.js "mongodb+srv://user:pass@cluster.mongodb.net/civic_issues"
 */

const mongoose = require('mongoose');

// Get MongoDB URI from command line argument or environment
const ATLAS_URI = process.argv[2] || process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
    console.error('❌ Error: MongoDB Atlas URI required!');
    console.error('   Usage: node seed-atlas-users.js "mongodb+srv://..."');
    console.error('   OR set MONGODB_URI environment variable in Render');
    process.exit(1);
}

// User Schema
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

// Users with PLAIN TEXT passwords (stored as-is)
const users = [
    {
        username: 'admin',
        email: 'admin@vmc.gov.in',
        password_hash: 'Admin@123',  // Plain text
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

async function seedAtlas() {
    try {
        console.log('🌍 Connecting to MongoDB Atlas...');
        console.log(`   URI: ${ATLAS_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`);
        
        await mongoose.connect(ATLAS_URI);
        
        console.log('✅ Connected to MongoDB Atlas\n');
        console.log('👥 Seeding users with PLAIN TEXT passwords...\n');

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
        console.log(`\n📊 Total users in Atlas: ${count}`);

        console.log('\n📝 Test Credentials:');
        console.log('   ┌────────────┬───────────────┬──────────┐');
        console.log('   │ Username   │ Password      │ Role     │');
        console.log('   ├────────────┼───────────────┼──────────┤');
        users.forEach(u => {
            console.log(`   │ ${u.username.padEnd(10)} │ ${u.password_hash.padEnd(13)} │ ${u.role.padEnd(8)} │`);
        });
        console.log('   └────────────┴───────────────┴──────────┘');

        console.log('\n✅ Seeding to MongoDB Atlas complete!\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        if (error.message.includes('Authentication failed')) {
            console.error('   Check MongoDB Atlas credentials in URI');
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from Atlas\n');
    }
}

seedAtlas();
