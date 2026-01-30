/**
 * Seed Sample Notifications
 * Run: node src/scripts/seedNotifications.js
 */

const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');
require('dotenv').config();

// MongoDB connection
const getConnectionString = () => {
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
};

async function seedNotifications() {
    try {
        console.log('🌱 Seeding sample notifications...');
        
        // Connect to MongoDB
        await mongoose.connect(getConnectionString());
        console.log('✅ Connected to MongoDB');
        
        // Get all users
        const users = await User.find().limit(10);
        
        if (users.length === 0) {
            console.log('❌ No users found. Please seed users first.');
            process.exit(1);
        }
        
        console.log(`Found ${users.length} users`);
        
        // Clear existing notifications
        await Notification.deleteMany({});
        console.log('Cleared existing notifications');
        
        // Sample notifications for each user
        const notificationTemplates = [
            {
                type: 'issue_assigned',
                title: 'New Issue Assigned',
                message: 'A new pothole issue has been assigned to you in Ward 5',
                is_read: false
            },
            {
                type: 'issue_resolved',
                title: 'Issue Resolved',
                message: 'Street light issue in Ward 3 has been marked as resolved',
                is_read: false
            },
            {
                type: 'system_update',
                title: 'System Update',
                message: 'New features are now available in the civic monitoring system',
                is_read: true
            },
            {
                type: 'priority_escalated',
                title: 'Priority Escalated',
                message: 'Issue #12345 has been escalated to HIGH priority due to multiple reports',
                is_read: false
            },
            {
                type: 'civic_voice_alert',
                title: 'Civic Voice Alert',
                message: 'Issue in your ward has received 50+ upvotes and requires immediate attention',
                is_read: false
            },
            {
                type: 'comment_added',
                title: 'New Comment',
                message: 'Someone commented on your reported issue',
                is_read: false
            }
        ];
        
        let count = 0;
        
        for (const user of users) {
            // Add 3-5 random notifications per user
            const numNotifications = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < numNotifications; i++) {
                const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
                
                const hoursAgo = Math.floor(Math.random() * 48);
                const createdAt = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
                
                await Notification.create({
                    user_id: user._id,
                    type: template.type,
                    title: template.title,
                    message: template.message,
                    is_read: template.is_read,
                    data: { userId: user._id.toString(), role: user.role },
                    created_at: createdAt
                });
                
                count++;
            }
        }
        
        console.log(`✅ Successfully seeded ${count} notifications for ${users.length} users`);
        
        // Show summary
        const total = await Notification.countDocuments();
        const unread = await Notification.countDocuments({ is_read: false });
        const read = await Notification.countDocuments({ is_read: true });
        
        console.log('\n📊 Notification Summary:');
        console.log(`   Total: ${total}`);
        console.log(`   Unread: ${unread}`);
        console.log(`   Read: ${read}`);
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedNotifications();
}

module.exports = seedNotifications;
