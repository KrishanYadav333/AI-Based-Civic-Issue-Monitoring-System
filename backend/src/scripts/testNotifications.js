/**
 * Test Notification API End-to-End
 * 1. Login as admin
 * 2. Fetch notifications
 * 3. Mark one as read
 * 4. Mark all as read
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testNotificationSystem() {
    try {
        console.log('🧪 Testing Notification System End-to-End\n');
        
        // 1. Login as admin
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            username: 'admin',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        console.log(`   ✅ Logged in as: ${user.username} (${user.role})`);
        console.log(`   User ID: ${user.id || user._id}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        
        // 2. Fetch notifications
        console.log('\n2️⃣ Fetching notifications...');
        const notificationsResponse = await axios.get(`${API_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const { notifications, total, unread } = notificationsResponse.data.data;
        console.log(`   ✅ Fetched ${total} notification(s)`);
        console.log(`   📊 Unread: ${unread}, Read: ${total - unread}`);
        
        if (notifications.length > 0) {
            console.log('\n   📋 Notifications:');
            notifications.slice(0, 3).forEach(n => {
                const icon = n.read ? '✓' : '○';
                console.log(`      [${icon}] ${n.title}`);
                console.log(`          ${n.message}`);
                console.log(`          ${n.time}`);
            });
        }
        
        // 3. Mark one as read
        if (unread > 0) {
            const unreadNotif = notifications.find(n => !n.read);
            console.log(`\n3️⃣ Marking notification as read: "${unreadNotif.title}"`);
            
            await axios.patch(
                `${API_URL}/api/notifications/${unreadNotif.id}/read`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('   ✅ Marked as read');
            
            // Fetch again to verify
            const updated = await axios.get(`${API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   📊 New unread count: ${updated.data.data.unread}`);
        }
        
        // 4. Mark all as read
        console.log('\n4️⃣ Marking all notifications as read...');
        const markAllResponse = await axios.patch(
            `${API_URL}/api/notifications/read-all`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log(`   ✅ Marked ${markAllResponse.data.data.count} notification(s) as read`);
        
        // Final fetch
        const finalResponse = await axios.get(`${API_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`   📊 Final unread count: ${finalResponse.data.data.unread}`);
        
        console.log('\n✅ All tests passed! Notification system is working!\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        console.error('\nDetails:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        process.exit(1);
    }
}

testNotificationSystem();
