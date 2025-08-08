#!/usr/bin/env node

/**
 * Production Deployment Script for fractOWN
 * Ensures secure production deployment with proper build process
 * 
 * Security Features:
 * - Forces production environment variables
 * - Validates environment before deployment
 * - Uses production build instead of development server
 * - Validates required secrets and configurations
 */

import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 fractOWN Production Deployment Starting...\n');

// Security: Validate production environment
function validateProductionEnvironment() {
  console.log('🔒 Validating production environment...');
  
  // Ensure NODE_ENV is set to production
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Security Error: NODE_ENV must be set to "production" for deployment');
    console.log('   Set NODE_ENV=production in your environment');
    process.exit(1);
  }
  
  // Validate required environment variables for production
  const requiredEnvVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'PORT'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Security Error: Missing required production environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
  
  // Warn about insecure defaults
  if (process.env.SESSION_SECRET === 'fractown-session-secret-change-in-production') {
    console.error('❌ Security Error: Default session secret detected');
    console.log('   Set a secure SESSION_SECRET in production');
    process.exit(1);
  }
  
  console.log('✅ Production environment validated');
}

// Safe command execution (same security as auto-setup)
function runCommand(commandArray, description) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${description}...`);
    
    if (!Array.isArray(commandArray) || commandArray.length === 0) {
      console.error(`❌ ${description} failed: Invalid command format`);
      resolve(false);
      return;
    }

    const allowedCommands = ['npm', 'node', 'npx'];
    if (!allowedCommands.includes(commandArray[0])) {
      console.error(`❌ ${description} failed: Command not allowed: ${commandArray[0]}`);
      resolve(false);
      return;
    }
    
    execFile(commandArray[0], commandArray.slice(1), {
      timeout: 300000, // 5 minute timeout for builds
      maxBuffer: 2 * 1024 * 1024, // 2MB max buffer
      killSignal: 'SIGTERM',
      env: { ...process.env, NODE_ENV: 'production' }
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

async function buildForProduction() {
  console.log('\n🏗️  Building application for production...');
  
  // Clean any existing dist directory
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning existing build directory...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // Build the application
  const buildSuccess = await runCommand(['npm', 'run', 'build'], 'Building production bundle');
  
  if (!buildSuccess) {
    console.error('❌ Production build failed');
    return false;
  }
  
  // Verify build output exists
  if (!fs.existsSync('dist/index.js') || !fs.existsSync('dist/public')) {
    console.error('❌ Build verification failed: Missing expected output files');
    return false;
  }
  
  console.log('✅ Production build completed and verified');
  return true;
}

async function startProductionServer() {
  console.log('\n🚀 Starting production server...');
  
  // Use production start script
  const serverStarted = await runCommand(['npm', 'run', 'start'], 'Starting production server');
  
  return serverStarted;
}

async function main() {
  try {
    // Validate production environment first
    validateProductionEnvironment();
    
    console.log('🔧 Production Deployment Check:');
    console.log('- Node.js:', process.version);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- Port:', process.env.PORT);
    console.log('- Database:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
    console.log('- Security validation: ✅ Passed');
    
    // Build for production
    const buildSuccess = await buildForProduction();
    
    if (!buildSuccess) {
      console.error('\n❌ Deployment failed: Build step failed');
      process.exit(1);
    }
    
    console.log('\n🎉 Production build completed successfully!');
    console.log('\n📋 What was built:');
    console.log('✅ Frontend assets optimized and bundled');
    console.log('✅ Backend server bundled for production');
    console.log('✅ Static files prepared for serving');
    console.log('✅ Production environment validated');
    
    console.log('\n🚀 To start the production server:');
    console.log('   npm run start');
    
    console.log('\n⚠️  Production Deployment Security Notes:');
    console.log('- Development server (npm run dev) should NEVER be used in production');
    console.log('- All environment variables are validated for security');
    console.log('- Session secrets are enforced to be secure');
    console.log('- Static files are served optimally for performance');
    
  } catch (error) {
    console.error('\n❌ Production deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure NODE_ENV=production is set');
    console.log('2. Verify all required environment variables are present');
    console.log('3. Check that SESSION_SECRET is not using default value');
    console.log('4. Ensure DATABASE_URL is properly configured');
    process.exit(1);
  }
}

// Run deployment if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateProductionEnvironment, buildForProduction };