/**
 * Test getUserNotifications with string ID
 */

const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');
require('dotenv').config();

async function testWithStringId() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_monitoring';
        await mongoose.connect(mongoUri);
        
        // Use the admin user ID as a string (like from JWT)
        const adminUserId = '697cb1c1e99349a4b1e80314'; // String, not ObjectId
        
        console.log('📍 Testing getUserNotifications with STRING user ID:', adminUserId);
        console.log('   Type:', typeof adminUserId);
        
        const result = await notificationService.getUserNotifications(adminUserId, false);
        
        console.log('\n📊 Result:');
        console.log('   Total:', result.total);
        console.log('   Unread:', result.unread);
        console.log('   Notifications:', result.notifications.length);
        
        if (result.notifications.length > 0) {
            console.log('\n📋 Notifications:');
            result.notifications.slice(0, 3).forEach(n => {
                console.log(`   [${n.read ? '✓' : '○'}] ${n.title}`);
                console.log(`       ${n.message}`);
                console.log(`       ${n.time}`);
            });
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

testWithStringId();
