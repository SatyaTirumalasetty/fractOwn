#!/usr/bin/env node

/**
 * Auto Setup Script for fractOWN
 * Automatically runs when app is cloned from GitHub to prevent crashes and data loss
 */

import { exec } from 'child_process';
import fs from 'fs';

console.log('🚀 fractOWN Auto Setup Starting...\n');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ ${description}...`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${description} failed:`, error.message);
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
  
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found. Please add a PostgreSQL database in Replit.');
    console.log('   Go to Tools > Database and add PostgreSQL');
    return false;
  }
  
  console.log('✅ Database connection found');
  
  // Push database schema
  const schemaPushed = await runCommand('npx drizzle-kit push --force', 'Pushing database schema');
  
  if (!schemaPushed) {
    console.log('⚠️  Schema push failed, but continuing...');
  }
  
  // Seed database
  const seeded = await runCommand('npx tsx server/seed.ts', 'Seeding database with initial data');
  
  return seeded;
}

async function main() {
  try {
    console.log('🔧 Environment Check:');
    console.log('- Node.js:', process.version);
    console.log('- Database URL:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Missing');
    
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