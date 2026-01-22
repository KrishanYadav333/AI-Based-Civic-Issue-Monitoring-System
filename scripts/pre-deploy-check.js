#!/usr/bin/env node

/**
 * Pre-Deployment Check Script
 * Validates all requirements before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function log(message, type = 'info') {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const colorMap = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan
  };
  
  console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

function checkFile(filePath, required = true) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`${filePath} exists`, 'success');
    checks.passed++;
    return true;
  } else {
    if (required) {
      log(`${filePath} is missing`, 'error');
      checks.failed++;
    } else {
      log(`${filePath} is missing (optional)`, 'warning');
      checks.warnings++;
    }
    return false;
  }
}

function checkEnvVariable(filePath, variable, required = true) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasVariable = content.includes(`${variable}=`);
  
  if (hasVariable) {
    log(`${variable} is configured`, 'success');
    checks.passed++;
    return true;
  } else {
    if (required) {
      log(`${variable} is missing`, 'error');
      checks.failed++;
    } else {
      log(`${variable} is missing (optional)`, 'warning');
      checks.warnings++;
    }
    return false;
  }
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'pipe' });
    log(`${name} is installed`, 'success');
    checks.passed++;
    return true;
  } catch (error) {
    log(`${name} is not installed`, 'error');
    checks.failed++;
    return false;
  }
}

function checkPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `netstat -an | findstr :${port}`
      : `lsof -i :${port}`;
    
    execSync(command, { stdio: 'pipe' });
    log(`Port ${port} is in use`, 'warning');
    checks.warnings++;
    return false;
  } catch (error) {
    log(`Port ${port} is available`, 'success');
    checks.passed++;
    return true;
  }
}

async function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   AI Civic Issue Monitor - Pre-Deployment Check          ║
║   Vadodara Municipal Corporation                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  // 1. Check System Requirements
  section('System Requirements');
  checkCommand('node --version', 'Node.js');
  checkCommand('npm --version', 'npm');
  checkCommand('python --version', 'Python');
  checkCommand('pip --version', 'pip');
  checkCommand('psql --version', 'PostgreSQL');

  // 2. Check Project Structure
  section('Project Structure');
  checkFile('backend/package.json');
  checkFile('ai-service/requirements.txt');
  checkFile('frontend/package.json');
  checkFile('mobile-app/package.json');
  checkFile('database/schema.sql');
  checkFile('docker-compose.yml');

  // 3. Check Environment Files
  section('Environment Configuration');
  checkFile('backend/.env');
  checkFile('ai-service/.env');
  checkFile('frontend/.env', false);
  checkFile('mobile-app/.env', false);

  // 4. Check Backend Environment Variables
  section('Backend Environment Variables');
  const backendEnv = 'backend/.env';
  if (fs.existsSync(backendEnv)) {
    checkEnvVariable(backendEnv, 'NODE_ENV');
    checkEnvVariable(backendEnv, 'PORT');
    checkEnvVariable(backendEnv, 'DB_HOST');
    checkEnvVariable(backendEnv, 'DB_PORT');
    checkEnvVariable(backendEnv, 'DB_NAME');
    checkEnvVariable(backendEnv, 'DB_USER');
    checkEnvVariable(backendEnv, 'DB_PASSWORD');
    checkEnvVariable(backendEnv, 'JWT_SECRET');
    checkEnvVariable(backendEnv, 'AI_SERVICE_URL');
    checkEnvVariable(backendEnv, 'REDIS_HOST', false);
    checkEnvVariable(backendEnv, 'SMTP_HOST', false);
  }

  // 5. Check Dependencies
  section('Dependencies');
  checkFile('backend/node_modules', true);
  checkFile('ai-service/venv', false) || checkFile('ai-service/.venv', false);

  // 6. Check Ports
  section('Port Availability');
  checkPort(3000); // Backend
  checkPort(5000); // AI Service
  checkPort(3001); // Frontend dev server
  checkPort(5432); // PostgreSQL
  checkPort(6379); // Redis

  // 7. Check Upload Directory
  section('Storage Directories');
  if (!fs.existsSync('backend/uploads')) {
    fs.mkdirSync('backend/uploads', { recursive: true });
    log('Created backend/uploads directory', 'success');
    checks.passed++;
  } else {
    log('backend/uploads directory exists', 'success');
    checks.passed++;
  }

  if (!fs.existsSync('ai-service/uploads')) {
    fs.mkdirSync('ai-service/uploads', { recursive: true });
    log('Created ai-service/uploads directory', 'success');
    checks.passed++;
  } else {
    log('ai-service/uploads directory exists', 'success');
    checks.passed++;
  }

  // 8. Check Database Connection (if PostgreSQL is running)
  section('Database Connection');
  try {
    const dbTest = execSync('psql --version', { stdio: 'pipe' }).toString();
    log('PostgreSQL client is available', 'success');
    checks.passed++;
    
    // Try to connect to database
    try {
      const envContent = fs.readFileSync('backend/.env', 'utf8');
      const dbName = envContent.match(/DB_NAME=(.+)/)?.[1] || 'civic_issues';
      const dbUser = envContent.match(/DB_USER=(.+)/)?.[1] || 'postgres';
      
      execSync(`psql -U ${dbUser} -d ${dbName} -c "SELECT 1" 2>&1`, { stdio: 'pipe' });
      log(`Database '${dbName}' is accessible`, 'success');
      checks.passed++;
    } catch (error) {
      log('Cannot connect to database (may not be running)', 'warning');
      checks.warnings++;
    }
  } catch (error) {
    log('PostgreSQL is not installed or not in PATH', 'error');
    checks.failed++;
  }

  // 9. Check Git Status
  section('Git Status');
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' }).toString().trim();
    log(`Current branch: ${branch}`, 'info');
    
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString();
    if (status.trim()) {
      log('Uncommitted changes detected', 'warning');
      checks.warnings++;
    } else {
      log('No uncommitted changes', 'success');
      checks.passed++;
    }
  } catch (error) {
    log('Not a git repository', 'warning');
    checks.warnings++;
  }

  // 10. Check Test Status
  section('Test Status');
  try {
    execSync('cd backend && npm test 2>&1', { stdio: 'pipe' });
    log('All backend tests passing', 'success');
    checks.passed++;
  } catch (error) {
    log('Some backend tests failing', 'warning');
    checks.warnings++;
  }

  // Summary
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`  Deployment Check Summary`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.green}Passed:   ${checks.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:   ${checks.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${checks.warnings}${colors.reset}`);

  if (checks.failed > 0) {
    console.log(`\n${colors.red}⚠ Deployment NOT recommended - fix failed checks first${colors.reset}\n`);
    process.exit(1);
  } else if (checks.warnings > 5) {
    console.log(`\n${colors.yellow}⚠ Deployment possible but with warnings - review carefully${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✓ System ready for deployment!${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error(`${colors.red}Error running pre-deployment checks:${colors.reset}`, error);
  process.exit(1);
});
