/**
 * Create test notifications for ALL existing users
 */

const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
require('dotenv').config();

async function createTestNotifications() {
    try {
        console.log('🌱 Creating test notifications for all users...\n');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');
        
        // Get ALL users
        const users = await User.find().select('_id username role');
        
        if (users.length === 0) {
            console.log('❌ No users found in database!');
            console.log('💡 Please login first to create a user account.');
            console.log('💡 After login, run this script again to create notifications.\n');
            await mongoose.disconnect();
            process.exit(1);
        }
        
        console.log(`📊 Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`   • ${u.username} (${u.role})`);
        });
        console.log('');
        
        // Clear old test notifications
        const deletedCount = await Notification.deleteMany({});
        if (deletedCount.deletedCount > 0) {
            console.log(`🗑️ Cleared ${deletedCount.deletedCount} old notification(s)\n`);
        }
        
        // Create notifications for EACH user
        const notificationTemplates = [
            {
                type: 'issue_assigned',
                title: '🔔 New Issue Assigned',
                message: 'A pothole has been reported in Ward 5 and assigned to you',
                is_read: false,
                data: { issueId: '123', ward: 5 },
                timeAgo: 5 * 60 * 1000 // 5 minutes ago
            },
            {
                type: 'priority_escalated',
                title: '⚠️ Priority Escalated',
                message: 'Issue #456 has been escalated to HIGH priority',
                is_read: false,
                data: { issueId: '456', newPriority: 'high' },
                timeAgo: 2 * 60 * 60 * 1000 // 2 hours ago
            },
            {
                type: 'system_update',
                title: '📢 System Update',
                message: 'New notification system is now live! You will receive real-time updates.',
                is_read: true,
                data: {},
                timeAgo: 24 * 60 * 60 * 1000 // 1 day ago
            },
            {
                type: 'issue_resolved',
                title: '✅ Issue Resolved',
                message: 'The streetlight issue in Ward 3 has been successfully resolved',
                is_read: false,
                data: { issueId: '789', ward: 3 },
                timeAgo: 30 * 60 * 1000 // 30 minutes ago
            },
            {
                type: 'comment_added',
                title: '💬 New Comment',
                message: 'A citizen has commented on your assigned issue',
                is_read: false,
                data: { issueId: '123', commentId: 'c1' },
                timeAgo: 15 * 60 * 1000 // 15 minutes ago
            }
        ];
        
        // Create notifications for each user
        const allNotifications = [];
        for (const user of users) {
            // Create 3-4 notifications per user
            const userNotifs = notificationTemplates.slice(0, 3 + Math.floor(Math.random() * 2));
            
            for (const template of userNotifs) {
                allNotifications.push({
                    user_id: user._id,
                    type: template.type,
                    title: template.title,
                    message: template.message,
                    is_read: template.is_read,
                    data: template.data,
                    created_at: new Date(Date.now() - template.timeAgo)
                });
            }
        }
        
        // Insert all notifications
        const result = await Notification.insertMany(allNotifications);
        console.log(`✅ Created ${result.length} notification(s) total\n`);
        
        // Show summary per user
        console.log('📊 Notifications by user:');
        for (const user of users) {
            const userNotifs = await Notification.find({ user_id: user._id }).sort({ created_at: -1 });
            const unreadCount = userNotifs.filter(n => !n.is_read).length;
            console.log(`\n   ${user.username} (${user.role}):`);
            console.log(`   • Total: ${userNotifs.length}`);
            console.log(`   • Unread: ${unreadCount}`);
            console.log(`   • Read: ${userNotifs.length - unreadCount}`);
            
            userNotifs.forEach(n => {
                const icon = n.is_read ? '✓' : '○';
                console.log(`      [${icon}] ${n.title}`);
            });
        }
        
        console.log('\n✅ Test notifications created successfully!');
        console.log('💡 Login with any username to see their notifications.\n');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

createTestNotifications();
