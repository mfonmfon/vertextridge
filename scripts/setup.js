#!/usr/bin/env node

/**
 * TradZ Setup Script
 * Helps configure the application for first-time setup
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`)
};

async function main() {
  log.title('🚀 TradZ Broker Platform Setup');
  
  console.log('This script will help you configure your TradZ application.\n');

  // Check if .env files exist
  const frontendEnvExists = existsSync('.env');
  const backendEnvExists = existsSync('server/.env');

  if (frontendEnvExists && backendEnvExists) {
    const overwrite = await question('Environment files already exist. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log.info('Setup cancelled. Your existing configuration is preserved.');
      rl.close();
      return;
    }
  }

  log.title('📋 Supabase Configuration');
  log.info('Get these from: https://app.supabase.com/project/_/settings/api');
  
  const supabaseUrl = await question('Supabase URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');

  log.title('🔐 Google OAuth Configuration');
  log.info('Get this from: https://console.cloud.google.com/apis/credentials');
  
  const googleClientId = await question('Google Client ID: ');

  log.title('⚙️ Server Configuration');
  
  const port = await question('Server Port (default: 5000): ') || '5000';
  const nodeEnv = await question('Environment (development/production, default: development): ') || 'development';
  
  // Generate random JWT secret
  const jwtSecret = Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('');

  // Create backend .env
  const backendEnv = `PORT=${port}
NODE_ENV=${nodeEnv}

# ─── Supabase Configuration ───
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# ─── Google OAuth ───
GOOGLE_CLIENT_ID=${googleClientId}

# ─── Security ───
JWT_SECRET=${jwtSecret}
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# ─── Rate Limiting ───
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ─── Logging ───
LOG_LEVEL=info
`;

  // Create frontend .env
  const frontendEnv = `# ─── Google OAuth ───
VITE_GOOGLE_CLIENT_ID=${googleClientId}

# ─── API Configuration ───
VITE_API_URL=http://localhost:${port}/api

# ─── Supabase (Optional - for real-time features) ───
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

  try {
    writeFileSync('server/.env', backendEnv);
    log.success('Created server/.env');
    
    writeFileSync('.env', frontendEnv);
    log.success('Created .env');

    log.title('✅ Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Run the database schema:');
    console.log('   - Open Supabase SQL Editor');
    console.log('   - Copy contents of server/config/database.sql');
    console.log('   - Execute the SQL');
    console.log('\n2. Install dependencies:');
    console.log('   npm install');
    console.log('   cd server && npm install');
    console.log('\n3. Start development servers:');
    console.log('   Terminal 1: cd server && npm run dev');
    console.log('   Terminal 2: npm run dev');
    console.log('\n4. Open http://localhost:5173');
    console.log('\nFor detailed instructions, see PRODUCTION_SETUP.md\n');

  } catch (error) {
    log.error(`Failed to create configuration files: ${error.message}`);
  }

  rl.close();
}

main().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
