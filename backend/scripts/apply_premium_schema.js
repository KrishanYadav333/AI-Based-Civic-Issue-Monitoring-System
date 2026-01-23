require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
// Adjust path to database service as we are in backend/scripts
const db = require('../src/services/database');

async function runMigration() {
    try {
        console.log('🔄 Starting Premium Features Schema Migration...');

        const sqlPath = path.join(__dirname, '../database/update_schema_premium.sql');
        console.log(`📄 Reading SQL file from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⚡ Executing SQL...');

        // Using the pool directly to run the query
        await db.pool.query(sql);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runMigration();
