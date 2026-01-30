/**
 * Create test notification for current logged in user
 */

const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

async function createTestNotification() {
    try {
        console.log('Creating test notification...');
        
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        // Get any user ID from the session - we'll use a placeholder
        // In real usage, this will be the logged-in user's ID
        const testUserId = '507f1f77bcf86cd799439011'; // MongoDB ObjectId format
        
        // Create multiple test notifications
        const notifications = [
            {
                user_id: testUserId,
                type: 'issue_assigned',
                title: '🔔 New Issue Assigned',
                message: 'A pothole has been reported in Ward 5 and assigned to you',
                is_read: false,
                data: { issueId: '123', ward: 5 },
                created_at: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
            },
            {
                user_id: testUserId,
                type: 'priority_escalated',
                title: '⚠️ Priority Escalated',
                message: 'Issue #456 has been escalated to HIGH priority',
                is_read: false,
                data: { issueId: '456', newPriority: 'high' },
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                user_id: testUserId,
                type: 'system_update',
                title: '📢 System Update',
                message: 'New notification system is now live!',
                is_read: true,
                data: {},
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            }
        ];
        
        // Clear old test notifications
        await Notification.deleteMany({});
        
        // Insert new notifications
        const result = await Notification.insertMany(notifications);
        console.log(`✅ Created ${result.length} test notifications`);
        
        // Show created notifications
        const allNotifs = await Notification.find().sort({ created_at: -1 });
        console.log('\n📋 Notifications in database:');
        allNotifs.forEach(n => {
            console.log(`   [${n.is_read ? '✓' : '○'}] ${n.title}`);
            console.log(`       ${n.message}`);
        });
        
        console.log('\n✅ Test notifications created successfully!');
        console.log('💡 Note: These notifications use a placeholder user ID.');
        console.log('💡 After login, notifications will be filtered by the actual logged-in user ID.');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestNotification();
