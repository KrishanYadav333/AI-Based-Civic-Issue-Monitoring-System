/**
 * Comprehensive System Test
 * Tests database, backend API, and notification system
 */

const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000';
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_issues';

async function runTests() {
    console.log('\n🧪 COMPREHENSIVE SYSTEM TEST\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    let dbConnection;
    const results = {
        database: false,
        backend: false,
        auth: false,
        notifications: false
    };

    try {
        // TEST 1: Database Connection
        console.log('📊 TEST 1: Database Connection');
        console.log(`   Connecting to: ${DB_URI}`);
        dbConnection = await mongoose.connect(DB_URI);
        console.log('   ✅ Connected to MongoDB');
        
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
        
        const userCount = await User.countDocuments();
        const notifCount = await Notification.countDocuments();
        console.log(`   ✅ Users: ${userCount}`);
        console.log(`   ✅ Notifications: ${notifCount}`);
        results.database = userCount >= 3 && notifCount >= 9;
        console.log('');

        // TEST 2: Backend Health
        console.log('🏥 TEST 2: Backend Health Check');
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            console.log(`   ✅ Status: ${healthRes.status}`);
            console.log(`   ✅ Response: ${JSON.stringify(healthRes.data)}`);
            results.backend = healthRes.status === 200;
        } catch (err) {
            console.log(`   ❌ Backend not responding: ${err.message}`);
        }
        console.log('');

        // TEST 3: Authentication
        console.log('🔐 TEST 3: Authentication System');
        try {
            const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
                username: 'admin',
                password: 'Admin@123'
            });
            
            const token = loginRes.data.data.token;
            const user = loginRes.data.data.user;
            
            console.log(`   ✅ Login successful`);
            console.log(`   ✅ Username: ${user.username}`);
            console.log(`   ✅ Role: ${user.role}`);
            console.log(`   ✅ User ID: ${user._id || user.id}`);
            console.log(`   ✅ Token: ${token.substring(0, 30)}...`);
            
            results.auth = true;
            results.token = token;
            results.userId = user._id || user.id;
            
        } catch (err) {
            console.log(`   ❌ Login failed: ${err.response?.data?.message || err.message}`);
        }
        console.log('');

        // TEST 4: Notification API
        if (results.token) {
            console.log('🔔 TEST 4: Notification System');
            try {
                const notifRes = await axios.get(`${API_URL}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${results.token}` }
                });
                
                const data = notifRes.data.data;
                console.log(`   ✅ API call successful`);
                console.log(`   ✅ Total: ${data.total}`);
                console.log(`   ✅ Unread: ${data.unread}`);
                console.log(`   ✅ Read: ${data.total - data.unread}`);
                
                if (data.notifications.length > 0) {
                    console.log('\n   📋 Sample Notifications:');
                    data.notifications.slice(0, 3).forEach((n, i) => {
                        const status = n.read ? '✓ Read' : '○ Unread';
                        console.log(`      ${i + 1}. [${status}] ${n.title}`);
                        console.log(`         ${n.message}`);
                        console.log(`         ${n.time}`);
                    });
                }
                
                results.notifications = data.total > 0;
                
            } catch (err) {
                console.log(`   ❌ Notification API failed: ${err.response?.data?.message || err.message}`);
            }
        }
        console.log('');

        // FINAL SUMMARY
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log('📊 TEST RESULTS:\n');
        
        const allPassed = Object.values(results).every(r => r === true || r);
        
        console.log(`   Database:      ${results.database ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Backend:       ${results.backend ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Auth:          ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Notifications: ${results.notifications ? '✅ PASS' : '❌ FAIL'}`);
        console.log('');
        
        if (allPassed) {
            console.log('🎉 ALL TESTS PASSED!\n');
            console.log('✅ System is ready to use!');
            console.log('');
            console.log('📝 Next Steps:');
            console.log('   1. Open MongoDB Compass: mongodb://localhost:27017');
            console.log('   2. Open browser: http://localhost:5173/login');
            console.log('   3. Login: admin / Admin@123');
            console.log('   4. Look for notification bell icon (🔔) in top-right');
            console.log('   5. You should see badge with number "2" (unread count)');
            console.log('');
        } else {
            console.log('❌ SOME TESTS FAILED\n');
            console.log('Please check the errors above and fix them.');
            console.log('');
        }

    } catch (error) {
        console.error('\n❌ Test suite error:', error.message);
        process.exit(1);
    } finally {
        if (dbConnection) {
            await mongoose.disconnect();
            console.log('🔌 Disconnected from MongoDB\n');
        }
    }
}

runTests();
