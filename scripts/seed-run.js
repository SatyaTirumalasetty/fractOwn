#!/usr/bin/env node
/**
 * Simple script to run database seeding
 */
const { execSync } = require('child_process');

console.log('🌱 Seeding database with sample data...');

try {
  execSync('tsx server/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');
  console.log('Default admin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}