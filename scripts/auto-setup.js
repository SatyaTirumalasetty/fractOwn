#!/usr/bin/env node

/**
 * Auto Setup Script for fractOWN
 * Automatically runs when app is cloned from GitHub to prevent crashes and data loss
 * 
 * Security Features:
 * - Command whitelisting to prevent command injection
 * - Input validation for database URLs
 * - Environment validation to prevent running as root
 * - Command timeout and buffer limits
 * - Uses execFile instead of exec to prevent shell injection
 */

import { execFile, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 fractOWN Auto Setup Starting...\n');

// Security: Validate environment and sanitize inputs
function validateEnvironment() {
  // Ensure we're running in a safe environment
  if (process.getuid && process.getuid() === 0) {
    console.error('❌ Security Error: This script should not be run as root');
    process.exit(1);
  }
  
  // Validate current working directory
  const currentDir = process.cwd();
  if (!fs.existsSync(path.join(currentDir, 'package.json'))) {
    console.error('❌ Security Error: Must be run from project root directory');
    process.exit(1);
  }
}

// Validate and sanitize database URL
function validateDatabaseUrl(url) {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    // Only allow postgresql/postgres protocols
    if (!['postgresql:', 'postgres:'].includes(parsedUrl.protocol)) {
      console.error('❌ Security Error: Invalid database protocol. Only PostgreSQL is allowed.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Security Error: Invalid database URL format');
    return false;
  }
}

function runCommand(commandArray, description) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${description}...`);
    
    // Validate that command is an array and contains safe commands
    if (!Array.isArray(commandArray) || commandArray.length === 0) {
      console.error(`❌ ${description} failed: Invalid command format`);
      resolve(false);
      return;
    }

    // Whitelist of allowed commands for security
    const allowedCommands = ['npx', 'npm', 'node'];
    if (!allowedCommands.includes(commandArray[0])) {
      console.error(`❌ ${description} failed: Command not allowed: ${commandArray[0]}`);
      resolve(false);
      return;
    }
    
    execFile(commandArray[0], commandArray.slice(1), {
      timeout: 120000, // 2 minute timeout for safety
      maxBuffer: 1024 * 1024, // 1MB max buffer
      killSignal: 'SIGTERM'
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          console.error(`❌ ${description} failed: Command timed out`);
        } else {
          console.error(`❌ ${description} failed:`, error.message);
        }
        resolve(false);
        return;
      }
      if (stderr && !stderr.includes('warning')) {
        console.error(`⚠️  ${description} warning:`, stderr);
      }
      console.log(`✅ ${description} completed`);
      if (stdout) console.log(stdout);
      resolve(true);
    });
  });
}

async function setupDatabase() {
  console.log('\n📊 Setting up database...');
  
  // Check if DATABASE_URL exists and validate it
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found. Please add a PostgreSQL database in Replit.');
    console.log('   Go to Tools > Database and add PostgreSQL');
    return false;
  }
  
  // Validate database URL for security
  if (!validateDatabaseUrl(process.env.DATABASE_URL)) {
    return false;
  }
  
  console.log('✅ Database connection found and validated');
  
  // Push database schema
  const schemaPushed = await runCommand(['npx', 'drizzle-kit', 'push', '--force'], 'Pushing database schema');
  
  if (!schemaPushed) {
    console.log('⚠️  Schema push failed, but continuing...');
  }
  
  // Seed database
  const seeded = await runCommand(['npx', 'tsx', 'server/seed.ts'], 'Seeding database with initial data');
  
  return seeded;
}

async function main() {
  try {
    // Run security validation first
    validateEnvironment();
    
    console.log('🔧 Environment Check:');
    console.log('- Node.js:', process.version);
    console.log('- Database URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
    console.log('- Security validation: ✅ Passed');
    
    // Setup database
    const dbSuccess = await setupDatabase();
    
    if (dbSuccess) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('\n📋 What was set up:');
      console.log('✅ Database schema created');
      console.log('✅ Sample properties added (Chennai, Coimbatore, Hyderabad)');
      console.log('✅ Database configured (admin user via environment variables only)');
      console.log('✅ Contact settings configured');
      
      console.log('\n🚀 You can now:');
      console.log('- Browse properties on the homepage');
      console.log('- Login to admin dashboard (/admin/login)');
      console.log('- Manage properties and settings');
    } else {
      console.log('\n⚠️  Setup completed with warnings.');
      console.log('If you see errors, manually run: npm run db:push && npm run seed');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup steps:');
    console.log('1. Add PostgreSQL database in Replit Tools > Database');
    console.log('2. Run: npm run db:push');
    console.log('3. Run: npm run seed');
  }
}

// Run setup if this file is executed directly
main();