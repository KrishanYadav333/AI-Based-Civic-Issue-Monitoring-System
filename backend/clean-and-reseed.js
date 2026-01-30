/**
 * Clean database and reseed fresh data
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
require('dotenv').config();

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

async function cleanAndReseed() {
    try {
        console.log('🧹 Cleaning and reseeding database...\n');
        
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // 1. Delete ALL users and notifications
        console.log('🗑️  Clearing old data...');
        await User.deleteMany({});
        await Notification.deleteMany({});
        console.log('   ✅ Cleared users and notifications\n');

        // 2. Create fresh users
        console.log('👥 Creating fresh users...');
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`   ✅ Created: ${user.username} (${user._id})`);
        }
        console.log('');

        // 3. Create notifications for each user
        console.log('📬 Creating notifications...');
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
                message: 'New notification system is now live!',
                is_read: true,
                timeAgo: 24 * 60 * 60 * 1000
            }
        ];

        for (const user of createdUsers) {
            for (const template of notificationTemplates) {
                await Notification.create({
                    user_id: user._id,
                    type: template.type,
                    title: template.title,
                    message: template.message,
                    is_read: template.is_read,
                    data: {},
                    created_at: new Date(Date.now() - template.timeAgo)
                });
            }
            const unreadCount = notificationTemplates.filter(n => !n.is_read).length;
            console.log(`   ✅ ${user.username}: ${notificationTemplates.length} notifications (${unreadCount} unread)`);
        }

        console.log('\n✅ Clean and reseed complete!\n');
        console.log('📝 Test Credentials:');
        console.log('┌────────────┬───────────────┬──────────┐');
        console.log('│ Username   │ Password      │ Role     │');
        console.log('├────────────┼───────────────┼──────────┤');
        users.forEach(u => {
            console.log(`│ ${u.username.padEnd(10)} │ ${u.password_hash.padEnd(13)} │ ${u.role.padEnd(8)} │`);
        });
        console.log('└────────────┴───────────────┴──────────┘\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

cleanAndReseed();
