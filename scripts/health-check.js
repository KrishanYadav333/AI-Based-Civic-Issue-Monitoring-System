#!/usr/bin/env node

/**
 * Health Check Script
 * Tests all services and endpoints
 */

const http = require('http');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const services = [
  {
    name: 'Backend API',
    url: 'http://localhost:3000/health',
    critical: true
  },
  {
    name: 'AI Service',
    url: 'http://localhost:5000/health',
    critical: true
  }
];

function checkService(service) {
  return new Promise((resolve) => {
    const url = new URL(service.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(service.url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`${colors.green}✓ ${service.name}: OK${colors.reset}`);
          try {
            const json = JSON.parse(data);
            console.log(`  ${colors.cyan}Response: ${JSON.stringify(json, null, 2)}${colors.reset}`);
          } catch (e) {
            // Not JSON, skip
          }
          resolve({ name: service.name, status: 'ok', critical: service.critical });
        } else {
          console.log(`${colors.red}✗ ${service.name}: HTTP ${res.statusCode}${colors.reset}`);
          resolve({ name: service.name, status: 'error', critical: service.critical });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}✗ ${service.name}: ${error.message}${colors.reset}`);
      resolve({ name: service.name, status: 'error', critical: service.critical });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`${colors.yellow}⚠ ${service.name}: Timeout${colors.reset}`);
      resolve({ name: service.name, status: 'timeout', critical: service.critical });
    });
  });
}

async function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════╗
║   Health Check - All Services             ║
╚═══════════════════════════════════════════╝
${colors.reset}`);

  const results = await Promise.all(services.map(checkService));
  
  const failed = results.filter(r => r.status !== 'ok' && r.critical);
  
  console.log(`\n${colors.cyan}Summary:${colors.reset}`);
  console.log(`${colors.green}✓ Healthy: ${results.filter(r => r.status === 'ok').length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed:  ${results.filter(r => r.status === 'error').length}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Timeout: ${results.filter(r => r.status === 'timeout').length}${colors.reset}`);
  
  if (failed.length > 0) {
    console.log(`\n${colors.red}Critical services are down!${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All services are healthy!${colors.reset}\n`);
    process.exit(0);
  }
}

main();
