require('dotenv').config({ path: '../.env' });
const db = require('../src/services/database');

async function verifySetup() {
    console.log('🔍 Verifying Premium Setup...');
    let success = true;

    // 1. Check Environment Variables
    console.log('\nChecking Environment Variables:');
    const aiUrl = process.env.AI_SERVICE_URL;
    if (aiUrl) {
        console.log(`   ✅ AI_SERVICE_URL is set to: ${aiUrl}`);
    } else {
        console.error('   ❌ AI_SERVICE_URL is missing!');
        success = false;
    }

    // 2. Check Database Schema
    console.log('\nChecking Database Schema:');
    try {
        // Check users table for trust_score
        const userCols = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trust_score'"
        );
        if (userCols.rows.length > 0) {
            console.log('   ✅ trust_score column exists in users table.');
        } else {
            console.error('   ❌ trust_score column MISSING in users table!');
            success = false;
        }

        // Check issues table for upvotes
        const issueCols = await db.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'upvotes'"
        );
        if (issueCols.rows.length > 0) {
            console.log('   ✅ upvotes column exists in issues table.');
        } else {
            console.error('   ❌ upvotes column MISSING in issues table!');
            success = false;
        }

        // Check issue_votes table
        const votesTable = await db.query(
            "SELECT table_name FROM information_schema.tables WHERE table_name = 'issue_votes'"
        );
        if (votesTable.rows.length > 0) {
            console.log('   ✅ issue_votes table exists.');
        } else {
            console.error('   ❌ issue_votes table MISSING!');
            success = false;
        }

    } catch (err) {
        console.error('   ❌ Database check failed:', err.message);
        success = false;
    } finally {
        await db.close();
    }

    if (success) {
        console.log('\n🎉 All Premium Setup Checks Passed!');
    } else {
        console.error('\n⚠️ Some checks failed. Please review.');
        process.exit(1);
    }
}

verifySetup();
