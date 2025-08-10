# Database Backup and Restore Guide

## Overview
This guide provides comprehensive database backup and restore capabilities for the fractOWN platform. The system supports both manual and automated backups with full production database protection.

## Quick Start Commands

### Create a Backup
```bash
# Basic backup
tsx scripts/backup-database.ts create

# Backup with description
tsx scripts/backup-database.ts create "Before major update"

# Automated backup (for cron jobs)
tsx scripts/backup-database.ts create "Automated backup - $(date)"
```

### List Available Backups
```bash
tsx scripts/backup-database.ts list
```

### Restore from Backup
```bash
# WARNING: This will delete all existing data!
tsx scripts/backup-database.ts restore backups/backup_2025-01-01.json --confirm
```

### Verify Backup Integrity
```bash
tsx scripts/backup-database.ts verify backups/backup_2025-01-01.json
```

## Backup Features

### Complete Data Coverage
- ✅ **Properties**: All property data including custom fields
- ✅ **Contacts**: Customer inquiries and contact information
- ✅ **Admin Sessions**: Authentication and session data
- ✅ **Security Events**: Audit logs and security monitoring

### Metadata Tracking
Each backup includes comprehensive metadata:
- Timestamp and environment information
- Record counts for each table
- Backup file size
- Version information
- Optional description for context

### Safety Features
- **Backup Verification**: Integrity checks ensure data consistency
- **Environment Detection**: Automatic production/development detection
- **Confirmation Required**: Restore operations require explicit confirmation
- **Clear Warnings**: Obvious warnings for destructive operations

## Backup File Structure

```json
{
  "metadata": {
    "timestamp": "2025-01-01T12:00:00.000Z",
    "environment": "production",
    "version": "1.0.0",
    "tables": ["properties", "contacts", "adminSessions", "adminSecurityEvents"],
    "recordCounts": {
      "properties": 150,
      "contacts": 45,
      "adminSessions": 5,
      "adminSecurityEvents": 200
    },
    "size": "2.5MB",
    "description": "Before major update"
  },
  "data": {
    "properties": [...],
    "contacts": [...],
    "adminSessions": [...],
    "adminSecurityEvents": [...]
  }
}
```

## Production Safety

### Environment Detection
The backup system automatically detects the environment:
- **Development**: Uses local database for testing
- **Production**: Uses production database URL
- **Staging**: Handles staging environments appropriately

### Restore Safeguards
Multiple layers of protection prevent accidental data loss:

1. **Explicit Confirmation**: `--confirm` flag required
2. **Clear Warnings**: Multiple warnings about data deletion
3. **Environment Checks**: Verification of target environment
4. **Backup Verification**: Integrity checks before restore

### Recommended Backup Schedule

#### Production Environment
```bash
# Daily backup at 2 AM
0 2 * * * tsx scripts/backup-database.ts create "Daily automated backup"

# Weekly backup with description
0 2 * * 0 tsx scripts/backup-database.ts create "Weekly backup - $(date +%Y-%m-%d)"

# Before deployments
tsx scripts/backup-database.ts create "Pre-deployment backup"
```

#### Development Environment
```bash
# Before major changes
tsx scripts/backup-database.ts create "Before feature development"

# Before testing destructive operations
tsx scripts/backup-database.ts create "Before data migration test"
```

## Backup Storage

### Local Storage
- Backups stored in `./backups/` directory
- Automatic directory creation if missing
- JSON format for easy inspection and portability

### Cloud Storage Integration
For production use, consider:
- Uploading backups to cloud storage (AWS S3, Google Cloud)
- Automated cleanup of old backups
- Offsite backup storage for disaster recovery

## Restore Process

### Step-by-Step Restore
1. **List Available Backups**
   ```bash
   tsx scripts/backup-database.ts list
   ```

2. **Verify Backup Integrity**
   ```bash
   tsx scripts/backup-database.ts verify backups/backup_2025-01-01.json
   ```

3. **Perform Restore** (DESTRUCTIVE - USE WITH CAUTION)
   ```bash
   tsx scripts/backup-database.ts restore backups/backup_2025-01-01.json --confirm
   ```

### Recovery Scenarios

#### Accidental Data Deletion
```bash
# Find the most recent backup
tsx scripts/backup-database.ts list

# Restore from backup (replace with actual filename)
tsx scripts/backup-database.ts restore backups/backup_2025-01-01T10-30-00-000Z.json --confirm
```

#### System Rollback
```bash
# Create current state backup first
tsx scripts/backup-database.ts create "Before rollback"

# Restore to previous state
tsx scripts/backup-database.ts restore backups/backup_2025-01-01T09-00-00-000Z.json --confirm
```

#### Testing and Development
```bash
# Create backup of current development data
tsx scripts/backup-database.ts create "Development snapshot"

# Restore production data for testing
tsx scripts/backup-database.ts restore backups/production_backup.json --confirm

# Later restore development data
tsx scripts/backup-database.ts restore backups/backup_development_snapshot.json --confirm
```

## Advanced Usage

### Custom Backup Scripts
You can create custom backup workflows:

```typescript
import { DatabaseBackupManager } from './scripts/backup-database';

const backupManager = new DatabaseBackupManager();

// Automated backup with custom logic
async function createScheduledBackup() {
  const description = `Scheduled backup - ${new Date().toLocaleDateString()}`;
  const filepath = await backupManager.createBackup(description);
  
  // Upload to cloud storage
  await uploadToCloudStorage(filepath);
  
  // Cleanup old local backups
  await cleanupOldBackups();
}
```

### Integration with CI/CD
```yaml
# GitHub Actions example
- name: Create Pre-Deployment Backup
  run: tsx scripts/backup-database.ts create "Pre-deployment backup"

- name: Deploy Application
  run: npm run deploy

- name: Verify Deployment
  run: npm run verify

- name: Create Post-Deployment Backup
  if: success()
  run: tsx scripts/backup-database.ts create "Post-deployment backup"
```

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Ensure backup directory is writable
chmod 755 ./backups

# Check file permissions
ls -la backups/
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
tsx scripts/backup-database.ts list
```

#### Large Backup Files
```bash
# Check backup file size
ls -lh backups/

# Verify available disk space
df -h
```

### Error Recovery

#### Corrupted Backup File
```bash
# Verify backup integrity
tsx scripts/backup-database.ts verify backups/suspect_backup.json

# Use previous backup if corrupted
tsx scripts/backup-database.ts list
tsx scripts/backup-database.ts restore backups/previous_backup.json --confirm
```

#### Failed Restore
```bash
# Check error logs
tail -f logs/application.log

# Verify backup file exists and is readable
ls -la backups/backup_file.json

# Try restore with different backup
tsx scripts/backup-database.ts restore backups/alternative_backup.json --confirm
```

## Security Considerations

### Access Control
- Backup files contain sensitive data
- Restrict access to backup directory
- Use secure transfer methods for backup files

### Data Encryption
Consider encrypting backup files for additional security:
```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup_file.json

# Decrypt backup
gpg --decrypt backup_file.json.gpg > backup_file.json
```

### Audit Trail
- All backup and restore operations are logged
- Monitor backup creation and usage
- Track who performs restore operations

## Support and Maintenance

### Regular Maintenance
- Verify backup integrity monthly
- Test restore procedures quarterly
- Clean up old backup files regularly
- Monitor backup file sizes and storage usage

### Monitoring
Set up monitoring for:
- Backup creation failures
- Storage space usage
- Backup file corruption
- Restore operation success/failure

For additional support or questions about the backup system, refer to the application logs or contact the development team.