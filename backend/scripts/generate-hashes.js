// Generate Bcrypt Hashes for MongoDB Seeding
const bcrypt = require('bcrypt');

const passwords = {
    'Admin@123': 'admin',
    'Survey@123': 'surveyor1/surveyor2',
    'Engineer@123': 'engineer1/engineer2',
    'Test@123456': 'testuser'
};

async function generateHashes() {
    console.log('Generating bcrypt hashes (10 rounds)...\n');
    
    for (const [password, username] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`Password: ${password} (${username})`);
        console.log(`Hash: ${hash}\n`);
    }
    process.exit(0);
}

generateHashes().catch(console.error);
