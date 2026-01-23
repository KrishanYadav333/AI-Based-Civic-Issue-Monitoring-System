require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const db = require('../src/services/database');

async function runMigration() {
    try {
        console.log('🔄 Creating Missing Tables...');

        const sqlPath = path.join(__dirname, '../database/create_missing_tables.sql');
        console.log(`📄 Reading SQL file from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⚡ Executing SQL...');
        await db.pool.query(sql);

        console.log('✅ Missing tables created successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await db.close();
    }
}

runMigration();
