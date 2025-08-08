#!/usr/bin/env node

/**
 * Update Admin Password Script
 * Updates the admin user password with the value from ADMIN_PASSWORD environment variable
 */

import bcrypt from 'bcrypt';

async function updateAdminPassword() {
  const { db } = await import('../server/db.ts');
  const { adminUsers } = await import('../shared/schema.ts');
  const { eq } = await import('drizzle-orm');

  try {
    console.log('🔐 Updating admin password from environment variables...');

    // Validate required environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD environment variable is required');
      process.exit(1);
    }

    if (!process.env.SESSION_SECRET) {
      console.error('❌ SESSION_SECRET environment variable is required');
      process.exit(1);
    }

    // Hash the new password
    console.log('🔒 Hashing new password...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Update the admin user password
    console.log(`📝 Updating password for admin user: ${adminUsername}`);
    const result = await db.update(adminUsers)
      .set({ 
        passwordHash: passwordHash,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.username, adminUsername))
      .returning();

    if (result.length > 0) {
      console.log('✅ Admin password updated successfully');
      console.log(`   Username: ${result[0].username}`);
      console.log(`   Email: ${result[0].email}`);
      console.log('🔐 Admin can now login with the new password');
    } else {
      console.log('⚠️  No admin user found with username:', adminUsername);
      console.log('Creating new admin user...');
      
      // Create new admin user if none exists
      const newAdmin = await db.insert(adminUsers).values({
        username: adminUsername,
        email: process.env.ADMIN_EMAIL || 'admin@fractown.com',
        passwordHash: passwordHash,
        role: 'admin'
      }).returning();
      
      console.log('✅ New admin user created successfully');
      console.log(`   Username: ${newAdmin[0].username}`);
      console.log(`   Email: ${newAdmin[0].email}`);
    }

    console.log('\n🎉 Admin authentication is now ready for production!');
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

updateAdminPassword();