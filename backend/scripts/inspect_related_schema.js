require('dotenv').config({ path: '../.env' });
const db = require('../src/services/database');

async function inspectSchema() {
    console.log('🔍 Inspecting Related Tables Schema...');
    try {
        // Issue History
        console.log('\n=== issue_history ===');
        let res = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'issue_history' ORDER BY ordinal_position"
        );
        if (res.rows.length === 0) {
            console.log('Table does not exist');
        } else {
            res.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
        }

        // Notifications
        console.log('\n=== notifications ===');
        res = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position"
        );
        if (res.rows.length === 0) {
            console.log('Table does not exist');
        } else {
            res.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
        }

        // Issue Types
        console.log('\n=== issue_types ===');
        res = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'issue_types' ORDER BY ordinal_position"
        );
        if (res.rows.length === 0) {
            console.log('Table does not exist');
        } else {
            res.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
        }

    } catch (err) {
        console.error('Error inspecting schema:', err);
    } finally {
        await db.close();
    }
}

inspectSchema();
