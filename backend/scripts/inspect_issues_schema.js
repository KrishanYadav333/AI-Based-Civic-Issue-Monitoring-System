require('dotenv').config({ path: '../.env' });
const db = require('../src/services/database');

async function inspectSchema() {
    console.log('🔍 Inspecting Issues Table Schema...');
    try {
        const res = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'issues' ORDER BY ordinal_position"
        );
        console.log('Columns in issues table:');
        res.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
    } catch (err) {
        console.error('Error inspecting schema:', err);
    } finally {
        await db.close();
    }
}

inspectSchema();
