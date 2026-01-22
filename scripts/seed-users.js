#!/usr/bin/env node

/**
 * User Seeding Script
 * Creates default test users for the system
 * Run from backend directory: node ../scripts/seed-users.js
 */

const path = require('path');
const fs = require('fs');

// Determine if running from backend or root
const isInBackend = fs.existsSync(path.join(process.cwd(), 'src', 'server.js'));
const backendPath = isInBackend ? process.cwd() : path.join(process.cwd(), 'backend');

// Load from backend node_modules
const bcrypt = require(path.join(backendPath, 'node_modules', 'bcryptjs'));
const { Client } = require(path.join(backendPath, 'node_modules', 'pg'));

// Load .env from backend directory
require(path.join(backendPath, 'node_modules', 'dotenv')).config({
  path: path.join(backendPath, '.env')
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const testUsers = [
  {
    name: 'VMC Admin',
    email: 'admin@vmc.gov.in',
    password: 'Admin@123456',
    role: 'admin'
  },
  {
    name: 'Ward 1 Engineer',
    email: 'engineer1@vmc.gov.in',
    password: 'Engineer@123456',
    role: 'engineer',
    ward_id: 1
  },
  {
    name: 'Ward 2 Engineer',
    email: 'engineer2@vmc.gov.in',
    password: 'Engineer@123456',
    role: 'engineer',
    ward_id: 2
  },
  {
    name: 'Field Surveyor',
    email: 'surveyor@vmc.gov.in',
    password: 'Surveyor@123456',
    role: 'surveyor'
  }
];

async function seedUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'civic_issues',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    await client.connect();
    console.log(`${colors.cyan}Connected to database${colors.reset}\n`);

    for (const user of testUsers) {
      try {
        // Check if user exists
        const checkResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );

        if (checkResult.rows.length > 0) {
          console.log(`${colors.cyan}ℹ User ${user.email} already exists, skipping${colors.reset}`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);

        // Insert user
        const query = user.ward_id
          ? 'INSERT INTO users (name, email, password_hash, role, ward_id) VALUES ($1, $2, $3, $4, $5) RETURNING id'
          : 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id';
        
        const values = user.ward_id
          ? [user.name, user.email, passwordHash, user.role, user.ward_id]
          : [user.name, user.email, passwordHash, user.role];

        const result = await client.query(query, values);
        
        console.log(`${colors.green}✓ Created user: ${user.email} (ID: ${result.rows[0].id})${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}✗ Failed to create ${user.email}: ${error.message}${colors.reset}`);
      }
    }

    console.log(`\n${colors.green}User seeding completed!${colors.reset}\n`);
    
    console.log(`${colors.cyan}Test Credentials:${colors.reset}`);
    testUsers.forEach(user => {
      console.log(`\n  ${user.role.toUpperCase()}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedUsers();
