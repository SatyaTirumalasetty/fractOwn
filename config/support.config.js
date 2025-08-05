/**
 * Support Team Configuration
 * 
 * ⚠️  WARNING: This file should only be modified by authorized support team members.
 * ⚠️  Changes here can affect the entire application functionality.
 * ⚠️  Always backup the database before making changes.
 * 
 * Contact: support@fractown.com for any assistance.
 */

module.exports = {
  // Database Migration Scripts
  migrations: {
    // Uncomment and run these scripts for database changes
    
    // Example: Add new column to properties table
    // addPropertyColumn: `
    //   ALTER TABLE properties 
    //   ADD COLUMN new_field VARCHAR(255);
    // `,
    
    // Example: Create new table
    // createUserPreferences: `
    //   CREATE TABLE user_preferences (
    //     id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    //     user_id VARCHAR NOT NULL,
    //     theme VARCHAR(50) DEFAULT 'light',
    //     language VARCHAR(10) DEFAULT 'en',
    //     created_at TIMESTAMP DEFAULT NOW()
    //   );
    // `,
    
    // Example: Update existing data
    // updatePropertyTypes: `
    //   UPDATE properties 
    //   SET property_type = 'mixed-use' 
    //   WHERE property_type = 'commercial' AND location LIKE '%residential%';
    // `
  },

  // Database Maintenance
  maintenance: {
    // Cleanup scripts
    cleanupOldLogs: `
      DELETE FROM system_logs 
      WHERE created_at < NOW() - INTERVAL '30 days';
    `,
    
    cleanupInactiveProperties: `
      UPDATE properties 
      SET is_active = false 
      WHERE funding_progress = 0 
      AND created_at < NOW() - INTERVAL '90 days';
    `,
    
    // Backup scripts
    backupProperties: `
      CREATE TABLE properties_backup_$(date) AS 
      SELECT * FROM properties;
    `,
    
    backupContacts: `
      CREATE TABLE contacts_backup_$(date) AS 
      SELECT * FROM contacts;
    `
  },

  // Emergency Recovery
  recovery: {
    // Restore last backup
    restoreProperties: `
      -- Replace 'BACKUP_DATE' with actual backup table name
      DROP TABLE IF EXISTS properties_temp;
      CREATE TABLE properties_temp AS SELECT * FROM properties;
      DELETE FROM properties;
      INSERT INTO properties SELECT * FROM properties_backup_BACKUP_DATE;
    `,
    
    // Reset admin password
    resetAdminPassword: `
      -- Replace 'NEW_HASH' with bcrypt hash of new password
      UPDATE admin_users 
      SET password_hash = 'NEW_HASH' 
      WHERE username = 'admin';
    `
  },

  // System Health Monitoring
  monitoring: {
    checkDatabaseHealth: `
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats
      WHERE schemaname = 'public';
    `,
    
    checkPerformance: `
      SELECT 
        query,
        calls,
        total_time,
        mean_time
      FROM pg_stat_statements
      ORDER BY total_time DESC
      LIMIT 10;
    `
  },

  // Data Validation
  validation: {
    checkDataIntegrity: `
      -- Check for orphaned records
      SELECT 'Orphaned contacts' as check_type, COUNT(*) as count
      FROM contacts c
      WHERE NOT EXISTS (SELECT 1 FROM properties p WHERE p.id = c.property_id)
      
      UNION ALL
      
      SELECT 'Invalid property values' as check_type, COUNT(*) as count
      FROM properties
      WHERE total_value <= 0 OR min_investment <= 0 OR expected_return < 0;
    `,
    
    checkBusinessRules: `
      -- Check business rule violations
      SELECT 'Min investment > Total value' as violation, COUNT(*) as count
      FROM properties
      WHERE min_investment > total_value
      
      UNION ALL
      
      SELECT 'Funding progress > 100%' as violation, COUNT(*) as count
      FROM properties
      WHERE funding_progress > 100;
    `
  },

  // Security Auditing
  security: {
    auditAdminAccess: `
      -- Create audit log for admin access (implement as needed)
      SELECT 
        username,
        last_login,
        login_count
      FROM admin_users
      ORDER BY last_login DESC;
    `,
    
    checkSuspiciousActivity: `
      -- Monitor for suspicious patterns
      SELECT 
        ip_address,
        COUNT(*) as request_count,
        MIN(created_at) as first_request,
        MAX(created_at) as last_request
      FROM access_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
      GROUP BY ip_address
      HAVING COUNT(*) > 100
      ORDER BY request_count DESC;
    `
  },

  // Configuration Overrides
  overrides: {
    // Emergency maintenance mode
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance. Please try again later.",
    
    // Feature toggles
    disableRegistration: false,
    disablePropertyCreation: false,
    disableFileUploads: false,
    
    // Performance tuning
    enableQueryCache: true,
    cacheTimeout: 300, // 5 minutes
    
    // Debug mode
    enableDebugLogging: false,
    logAllQueries: false
  }
};