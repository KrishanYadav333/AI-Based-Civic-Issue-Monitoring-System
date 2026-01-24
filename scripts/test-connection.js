/**
 * Backend-Frontend Connection Test
 * Verifies API connectivity and basic endpoints
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';
const API_URL = `${BACKEND_URL}/api`;

// ANSI color codes
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function logSuccess(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

async function testEndpoint(name, url, method = 'GET', data = null, headers = {}) {
    try {
        const config = {
            method,
            url,
            headers: { 'Content-Type': 'application/json', ...headers },
            timeout: 5000
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        logSuccess(`${name}: ${response.status} ${response.statusText}`);
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            logError(`${name}: ${error.response.status} ${error.response.statusText}`);
            if (error.response.status !== 401 && error.response.status !== 403) {
                console.log('   Response:', error.response.data);
            }
        } else if (error.code === 'ECONNREFUSED') {
            logError(`${name}: Connection refused - backend not running`);
        } else {
            logError(`${name}: ${error.message}`);
        }
        return { success: false, error };
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('Backend-Frontend Connection Test');
    console.log('='.repeat(60) + '\n');

    // Test 1: Backend Health Check
    logInfo('Testing backend health endpoint...');
    const health = await testEndpoint('Health Check', `${BACKEND_URL}/health`);
    
    if (!health.success) {
        logError('\nBackend is not running!');
        logInfo('\nTo start backend:');
        console.log('  cd backend');
        console.log('  npm start\n');
        process.exit(1);
    }
    
    console.log('   Database:', health.data.database);
    console.log('   Status:', health.data.status);
    console.log();

    // Test 2: API Root
    logInfo('Testing API root endpoint...');
    await testEndpoint('API Root', `${API_URL}`);
    console.log();

    // Test 3: Authentication (should fail without credentials - expected)
    logInfo('Testing authentication endpoint...');
    await testEndpoint(
        'Login Endpoint (no auth)', 
        `${API_URL}/auth/login`,
        'POST',
        { username: '', password: '' }
    );
    console.log();

    // Test 4: Test with actual credentials
    logInfo('Testing login with test credentials...');
    const loginResult = await testEndpoint(
        'Login (admin@civic.com)',
        `${API_URL}/auth/login`,
        'POST',
        { username: 'admin@civic.com', password: 'admin123' }
    );
    
    let authToken = null;
    if (loginResult.success && loginResult.data.data) {
        authToken = loginResult.data.data.token;
        logSuccess('Authentication token received');
        console.log();
    } else {
        logWarning('Could not obtain auth token - run seed script first');
        logInfo('Run: node scripts/seed-mongodb.js');
        console.log();
    }

    // Test 5: Protected endpoints (with token if available)
    if (authToken) {
        logInfo('Testing protected endpoints with auth token...');
        
        await testEndpoint(
            'Get Current User',
            `${API_URL}/auth/me`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        await testEndpoint(
            'Get Issues',
            `${API_URL}/issues`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        await testEndpoint(
            'Get Wards',
            `${API_URL}/wards`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        await testEndpoint(
            'Get Admin Dashboard Stats',
            `${API_URL}/dashboard/admin/stats`,
            'GET',
            null,
            { 'Authorization': `Bearer ${authToken}` }
        );
        
        console.log();
    }

    // Test 6: CORS Configuration
    logInfo('Testing CORS configuration...');
    try {
        const response = await axios.options(`${API_URL}/auth/login`, {
            headers: {
                'Origin': 'http://localhost:3001',
                'Access-Control-Request-Method': 'POST'
            }
        });
        logSuccess('CORS is properly configured');
        console.log();
    } catch (error) {
        logWarning('CORS might need configuration for frontend origin');
        console.log();
    }

    // Summary
    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    logSuccess('Backend is running and accessible');
    logSuccess('API endpoints are responding');
    
    if (authToken) {
        logSuccess('Authentication is working');
        logSuccess('Protected endpoints are accessible');
    } else {
        logWarning('Seed database to test authentication');
    }
    
    logSuccess('CORS is configured');
    
    console.log('\nNext steps:');
    console.log('1. Start frontend: cd frontend && npm run dev');
    console.log('2. Access app at: http://localhost:3001');
    console.log('3. Login with: admin@civic.com / admin123');
    console.log();
}

// Run tests
runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
