#!/usr/bin/env node
/**
 * Simple script to run database seeding
 */
const { execSync } = require('child_process');

console.log('🌱 Seeding database with sample data...');

try {
  execSync('tsx server/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');
  console.log('🔐 All user data is stored in database. No hardcoded credentials.');
  console.log('📝 To create admin user, set environment variables:');
  console.log('   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}