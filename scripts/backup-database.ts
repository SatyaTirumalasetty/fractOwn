#!/usr/bin/env tsx

/**
 * Database Backup and Restore Utility
 * Creates comprehensive backups of the production database with metadata
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { properties, contacts } from '../shared/schema';
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

interface BackupMetadata {
  timestamp: string;
  environment: string;
  version: string;
  tables: string[];
  recordCounts: Record<string, number>;
  size: string;
  description?: string;
}

interface DatabaseBackup {
  metadata: BackupMetadata;
  data: {
    properties: any[];
    contacts: any[];
  };
}

class DatabaseBackupManager {
  private db: any;
  private backupDir: string;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const poolConfig = {
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
    const pool = new Pool(poolConfig);
    this.db = drizzle({ client: pool });
    this.backupDir = join(process.cwd(), 'backups');
    
    // Ensure backup directory exists
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a complete database backup
   */
  async createBackup(description?: string): Promise<string> {
    try {
      console.log('🔄 Starting database backup...');
      
      // Fetch all data from tables
      const [propertiesData, contactsData] = await Promise.all([
        this.db.select().from(properties),
        this.db.select().from(contacts)
      ]);

      // Create backup metadata
      const timestamp = new Date().toISOString();
      const metadata: BackupMetadata = {
        timestamp,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        tables: ['properties', 'contacts'],
        recordCounts: {
          properties: propertiesData.length,
          contacts: contactsData.length
        },
        size: '0MB', // Will be calculated after serialization
        description
      };

      // Create complete backup object
      const backup: DatabaseBackup = {
        metadata,
        data: {
          properties: propertiesData,
          contacts: contactsData
        }
      };

      // Serialize and save backup
      const backupJson = JSON.stringify(backup, null, 2);
      const sizeInMB = (Buffer.byteLength(backupJson, 'utf8') / (1024 * 1024)).toFixed(2);
      backup.metadata.size = `${sizeInMB}MB`;

      // Generate filename with timestamp
      const filename = `backup_${timestamp.replace(/[:.]/g, '-')}.json`;
      const filepath = join(this.backupDir, filename);
      
      writeFileSync(filepath, JSON.stringify(backup, null, 2));

      console.log('✅ Backup created successfully:');
      console.log(`   File: ${filename}`);
      console.log(`   Size: ${sizeInMB}MB`);
      console.log(`   Records: ${Object.values(metadata.recordCounts).reduce((a, b) => a + b, 0)}`);
      console.log(`   Location: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * List all available backups
   */
  listBackups(): BackupMetadata[] {
    try {
      const files = readdirSync(this.backupDir)
        .filter((file: string) => file.endsWith('.json') && file.startsWith('backup_'))
        .sort()
        .reverse(); // Most recent first

      const backups: BackupMetadata[] = [];

      for (const file of files) {
        try {
          const filepath = join(this.backupDir, file);
          const backupData = JSON.parse(readFileSync(filepath, 'utf8'));
          backups.push(backupData.metadata);
        } catch (error) {
          console.warn(`⚠️  Could not read backup file: ${file}`);
        }
      }

      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Restore database from backup file
   */
  async restoreBackup(backupPath: string, confirmRestore: boolean = false): Promise<void> {
    if (!confirmRestore) {
      throw new Error('Restore confirmation required. Set confirmRestore=true to proceed.');
    }

    try {
      console.log('🔄 Starting database restore...');
      console.log(`📁 Backup file: ${backupPath}`);

      if (!existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Read and parse backup
      const backupData: DatabaseBackup = JSON.parse(readFileSync(backupPath, 'utf8'));
      
      console.log('📊 Backup Info:');
      console.log(`   Created: ${backupData.metadata.timestamp}`);
      console.log(`   Environment: ${backupData.metadata.environment}`);
      console.log(`   Size: ${backupData.metadata.size}`);
      console.log(`   Description: ${backupData.metadata.description || 'None'}`);

      // WARNING: This will delete all existing data
      console.log('⚠️  WARNING: This will delete all existing data!');
      
      // Clear existing data (in reverse order due to foreign keys)
      console.log('🗑️  Clearing existing data...');
      await this.db.delete(contacts);
      await this.db.delete(properties);

      // Restore data (in correct order)
      console.log('📥 Restoring data...');
      
      if (backupData.data.properties.length > 0) {
        await this.db.insert(properties).values(backupData.data.properties);
        console.log(`   ✅ Restored ${backupData.data.properties.length} properties`);
      }

      if (backupData.data.contacts.length > 0) {
        await this.db.insert(contacts).values(backupData.data.contacts);
        console.log(`   ✅ Restored ${backupData.data.contacts.length} contacts`);
      }

      console.log('✅ Database restore completed successfully!');
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      console.log('🔍 Verifying backup integrity...');

      if (!existsSync(backupPath)) {
        console.error('❌ Backup file not found');
        return false;
      }

      const backupData: DatabaseBackup = JSON.parse(readFileSync(backupPath, 'utf8'));
      
      // Check required fields
      if (!backupData.metadata || !backupData.data) {
        console.error('❌ Invalid backup format');
        return false;
      }

      // Verify record counts match actual data
      const actualCounts = {
        properties: backupData.data.properties?.length || 0,
        contacts: backupData.data.contacts?.length || 0
      };

      const metadataCounts = backupData.metadata.recordCounts;
      
      for (const [table, count] of Object.entries(actualCounts)) {
        if (metadataCounts[table] !== count) {
          console.error(`❌ Record count mismatch for ${table}: expected ${metadataCounts[table]}, found ${count}`);
          return false;
        }
      }

      console.log('✅ Backup integrity verified');
      return true;
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const backupManager = new DatabaseBackupManager();

  try {
    switch (command) {
      case 'create':
        const description = args[1];
        await backupManager.createBackup(description);
        break;

      case 'list':
        const backups = backupManager.listBackups();
        console.log('📋 Available Backups:');
        if (backups.length === 0) {
          console.log('   No backups found');
        } else {
          backups.forEach((backup, index) => {
            console.log(`   ${index + 1}. ${backup.timestamp} (${backup.size})`);
            console.log(`      Environment: ${backup.environment}`);
            console.log(`      Records: ${Object.values(backup.recordCounts).reduce((a, b) => a + b, 0)}`);
            if (backup.description) {
              console.log(`      Description: ${backup.description}`);
            }
            console.log('');
          });
        }
        break;

      case 'restore':
        const backupPath = args[1];
        const confirm = args[2] === '--confirm';
        
        if (!backupPath) {
          console.error('❌ Backup file path required');
          console.log('Usage: npm run backup restore <backup-file> --confirm');
          process.exit(1);
        }

        if (!confirm) {
          console.error('❌ Restore confirmation required');
          console.log('Add --confirm flag to proceed with restore');
          console.log('WARNING: This will delete all existing data!');
          process.exit(1);
        }

        await backupManager.restoreBackup(backupPath, true);
        break;

      case 'verify':
        const verifyPath = args[1];
        if (!verifyPath) {
          console.error('❌ Backup file path required');
          process.exit(1);
        }
        
        const isValid = await backupManager.verifyBackup(verifyPath);
        process.exit(isValid ? 0 : 1);
        break;

      default:
        console.log('🗄️  Database Backup Manager');
        console.log('');
        console.log('Commands:');
        console.log('  create [description]        Create a new backup');
        console.log('  list                       List all backups');
        console.log('  restore <file> --confirm   Restore from backup');
        console.log('  verify <file>              Verify backup integrity');
        console.log('');
        console.log('Examples:');
        console.log('  npm run backup create "Before major update"');
        console.log('  npm run backup list');
        console.log('  npm run backup restore backups/backup_2025-01-01.json --confirm');
        console.log('  npm run backup verify backups/backup_2025-01-01.json');
    }
  } catch (error) {
    console.error('❌ Command failed:', error);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseBackupManager };