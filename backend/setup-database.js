/**
 * Complete Database Setup Script
 * Creates clean MongoDB database with all collections and indexes
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, trim: true },
    role: { type: String, enum: ['surveyor', 'engineer', 'admin'], required: true, default: 'surveyor' },
    ward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', default: null },
    phone: { type: String, trim: true },
    is_active: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    issue_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    type: { 
        type: String, 
        required: true,
        enum: ['issue_assigned', 'issue_resolved', 'issue_rejected', 'priority_escalated', 
               'civic_voice_alert', 'system_update', 'comment_added', 'status_updated']
    },
    title: { type: String, required: true, maxLength: 255 },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    created_at: { type: Date, default: Date.now, index: true }
});

// Sample data
const users = [
    {
        username: 'admin',
        email: 'admin@vmc.gov.in',
        password_hash: 'Admin@123',
        full_name: 'System Administrator',
        phone: '9876543200',
        role: 'admin'
    },
    {
        username: 'surveyor1',
        email: 'surveyor1@vmc.gov.in',
        password_hash: 'Survey@123',
        full_name: 'Rajesh Kumar',
        phone: '9876543211',
        role: 'surveyor'
    },
    {
        username: 'engineer1',
        email: 'engineer1@vmc.gov.in',
        password_hash: 'Engineer@123',
        full_name: 'Amit Patel',
        phone: '9876543213',
        role: 'engineer'
    }
];

async function setupDatabase() {
    let connection;
    try {
        console.log('🗄️  MongoDB Database Setup\n');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_issues';
        console.log(`📡 Connecting to: ${mongoUri}`);
        connection = await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');
        
        const db = mongoose.connection.db;
        
        // Step 1: Drop existing collections
        console.log('🗑️  Step 1: Cleaning old data...');
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.dropCollection(collection.name);
            console.log(`   ✅ Dropped: ${collection.name}`);
        }
        console.log('');
        
        // Step 2: Create models (this creates collections with indexes)
        console.log('📦 Step 2: Creating collections...');
        const User = mongoose.model('User', userSchema);
        const Notification = mongoose.model('Notification', notificationSchema);
        
        // Create indexes
        await User.createIndexes();
        await Notification.createIndexes();
        console.log('   ✅ Created: users (with indexes)');
        console.log('   ✅ Created: notifications (with indexes)');
        console.log('');
        
        // Step 3: Insert users
        console.log('👥 Step 3: Seeding users...');
        const createdUsers = await User.insertMany(users);
        for (const user of createdUsers) {
            console.log(`   ✅ ${user.username} → ${user._id}`);
        }
        console.log('');
        
        // Step 4: Create notifications for each user
        console.log('📬 Step 4: Creating notifications...');
        const notifications = [];
        const notificationTemplates = [
            {
                type: 'issue_assigned',
                title: '🔔 New Issue Assigned',
                message: 'A pothole has been reported in Ward 5 and assigned to you',
                is_read: false,
                timeAgo: 5 * 60 * 1000
            },
            {
                type: 'priority_escalated',
                title: '⚠️ Priority Escalated',
                message: 'Issue #456 has been escalated to HIGH priority',
                is_read: false,
                timeAgo: 2 * 60 * 60 * 1000
            },
            {
                type: 'system_update',
                title: '📢 System Update',
                message: 'Notification system is now live! You will receive real-time updates.',
                is_read: true,
                timeAgo: 24 * 60 * 60 * 1000
            }
        ];
        
        for (const user of createdUsers) {
            for (const template of notificationTemplates) {
                notifications.push({
                    user_id: user._id,
                    type: template.type,
                    title: template.title,
                    message: template.message,
                    is_read: template.is_read,
                    data: { userId: user._id.toString(), role: user.role },
                    created_at: new Date(Date.now() - template.timeAgo)
                });
            }
        }
        
        await Notification.insertMany(notifications);
        console.log(`   ✅ Created ${notifications.length} notifications`);
        console.log('');
        
        // Step 5: Verify data
        console.log('🔍 Step 5: Verifying database...');
        const userCount = await User.countDocuments();
        const notifCount = await Notification.countDocuments();
        console.log(`   ✅ Users: ${userCount}`);
        console.log(`   ✅ Notifications: ${notifCount}`);
        console.log('');
        
        // Summary
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('✅ Database setup complete!\n');
        console.log('📊 Database Summary:');
        console.log(`   • Database: civic_monitoring`);
        console.log(`   • Collections: ${collections.length > 0 ? 'Recreated' : 'Created'}`);
        console.log(`   • Users: ${userCount}`);
        console.log(`   • Notifications: ${notifCount}\n`);
        
        console.log('🔑 Test Credentials:');
        console.log('┌─────────────┬──────────────┬───────────┬──────────────────────────────────┐');
        console.log('│ Username    │ Password     │ Role      │ User ID                          │');
        console.log('├─────────────┼──────────────┼───────────┼──────────────────────────────────┤');
        for (const user of createdUsers) {
            const userData = users.find(u => u.username === user.username);
            console.log(`│ ${user.username.padEnd(11)} │ ${userData.password_hash.padEnd(12)} │ ${user.role.padEnd(9)} │ ${user._id} │`);
        }
        console.log('└─────────────┴──────────────┴───────────┴──────────────────────────────────┘\n');
        
        console.log('📝 Notification Summary:');
        for (const user of createdUsers) {
            const userNotifs = notifications.filter(n => n.user_id.toString() === user._id.toString());
            const unread = userNotifs.filter(n => !n.is_read).length;
            console.log(`   • ${user.username}: ${userNotifs.length} total (${unread} unread)`);
        }
        console.log('');
        
        console.log('🌐 Connection String:');
        console.log(`   mongodb://localhost:27017/civic_monitoring\n`);
        
        console.log('✅ Ready to use! Start backend with: npm run dev\n');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB\n');
        }
    }
}

// Run setup
setupDatabase();
