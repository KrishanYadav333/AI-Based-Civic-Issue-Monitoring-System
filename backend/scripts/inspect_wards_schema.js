require('dotenv').config({ path: '../.env' });
const db = require('../src/services/database');

async function inspectSchema() {
    console.log('🔍 Inspecting Wards Table Schema...');
    try {
        const res = await db.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'wards'"
        );
        console.log('Columns in wards table:');
        console.log(res.rows);
    } catch (err) {
        console.error('Error inspecting schema:', err);
    } finally {
        await db.close();
    }
}

inspectSchema();
