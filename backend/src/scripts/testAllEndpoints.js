/**
 * Test all admin dashboard endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testAllEndpoints() {
    try {
        console.log('🧪 Testing All Admin Dashboard Endpoints\n');
        
        // 1. Login
        console.log('1️⃣ Logging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            username: 'admin',
            password: 'Admin@123'
        });
        
        const token = loginResponse.data.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        console.log('   ✅ Login successful\n');
        
        // 2. Test notifications
        console.log('2️⃣ Testing GET /api/notifications...');
        try {
            const notifRes = await axios.get(`${API_URL}/api/notifications`, { headers });
            console.log(`   ✅ Status: ${notifRes.status}`);
            console.log(`   Data:`, notifRes.data);
        } catch (err) {
            console.log(`   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        }
        
        // 3. Test issues
        console.log('\n3️⃣ Testing GET /api/issues...');
        try {
            const issuesRes = await axios.get(`${API_URL}/api/issues`, { headers });
            console.log(`   ✅ Status: ${issuesRes.status}`);
            console.log(`   Data:`, issuesRes.data);
        } catch (err) {
            console.log(`   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        }
        
        // 4. Test users
        console.log('\n4️⃣ Testing GET /api/users...');
        try {
            const usersRes = await axios.get(`${API_URL}/api/users`, { headers });
            console.log(`   ✅ Status: ${usersRes.status}`);
            console.log(`   Data:`, usersRes.data);
        } catch (err) {
            console.log(`   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        }
        
        // 5. Test admin stats
        console.log('\n5️⃣ Testing GET /api/dashboard/admin/stats...');
        try {
            const statsRes = await axios.get(`${API_URL}/api/dashboard/admin/stats`, { headers });
            console.log(`   ✅ Status: ${statsRes.status}`);
            console.log(`   Data:`, statsRes.data);
        } catch (err) {
            console.log(`   ❌ FAILED: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
        }
        
        console.log('\n✅ Testing complete!\n');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        process.exit(1);
    }
}

testAllEndpoints();
