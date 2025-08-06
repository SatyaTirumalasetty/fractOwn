# Data Persistence & Deployment Safety Guide

## 🛡️ Customer Data Protection Guarantee

### Current Database Status
- ✅ **Database Type**: PostgreSQL (Neon Serverless)
- ✅ **Users**: 2 registered customers
- ✅ **Properties**: 7 investment properties
- ✅ **Contacts**: Customer inquiries stored
- ✅ **Data Location**: External database (persists across deployments)

### Deployment Safety Measures

#### 1. Database Separation from Application Code
```
APPLICATION CODE ↔ EXTERNAL DATABASE
     (Replit)         (Neon/PostgreSQL)
        ↓                    ↓
   Can be updated       Data persists
   without data loss    independently
```

#### 2. Zero Data Loss Deployment Process
- **Application updates**: Only code changes, database remains untouched
- **Database migrations**: Use `npm run db:push` (additive only, no data deletion)
- **Schema changes**: Always backward compatible
- **Rollbacks**: Application code only, database data preserved

#### 3. Protected Data Tables
```sql
-- Customer Data (NEVER DELETED)
users              -- Customer accounts & authentication
contacts           -- Customer inquiries & communications
user_sessions      -- Customer login sessions
otp_verifications  -- Customer authentication codes

-- Business Data (NEVER DELETED)  
properties         -- Investment property listings
admin_settings     -- Business configuration

-- Admin Data (PROTECTED)
admin_users        -- Admin accounts
admin_sessions     -- Admin login sessions
```

### Data Backup & Recovery

#### Automatic Protections
- **Database Provider**: Neon automatically backs up data
- **Connection Pooling**: Prevents connection-related data corruption
- **Transaction Safety**: All writes are atomic and consistent
- **Environment Variables**: Database credentials separate from code

#### Manual Backup Commands
```bash
# Export all customer data
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Export specific tables
pg_dump $DATABASE_URL -t users -t contacts -t properties > customer_backup.sql
```

### Safe Deployment Checklist

#### ✅ Before Each Deployment
1. **Verify Database Connection**
   ```bash
   # Check database is accessible
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   ```

2. **Run Schema Sync (Safe)**
   ```bash
   # Only adds new tables/columns, never deletes data
   npm run db:push
   ```

3. **Verify Customer Data Intact**
   ```bash
   # Count records in critical tables
   psql $DATABASE_URL -c "
   SELECT 
     'users' as table_name, COUNT(*) as record_count FROM users
   UNION ALL
   SELECT 'properties', COUNT(*) FROM properties
   UNION ALL  
   SELECT 'contacts', COUNT(*) FROM contacts;"
   ```

#### ✅ After Each Deployment
1. **Test Database Connectivity**
2. **Verify User Login Works**
3. **Check Property Data Displays**
4. **Confirm Contact Forms Function**

### Environment Variables (Required)
```bash
# Database Connection (CRITICAL)
DATABASE_URL=postgresql://user:pass@host:port/db

# Database Config (Replit Auto-Generated)
PGHOST=your-db-host
PGPORT=5432
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password

# Admin Access (Optional)
ADMIN_USERNAME=admin_username
ADMIN_EMAIL=admin@company.com
ADMIN_INITIAL_PASSWORD=secure_password
```

### Emergency Recovery Procedures

#### If Data Appears Missing
1. **Check Database Connection**
   ```bash
   echo $DATABASE_URL
   psql $DATABASE_URL -c "\dt"  # List all tables
   ```

2. **Verify Table Structure**
   ```bash
   psql $DATABASE_URL -c "\d users"     # Check users table
   psql $DATABASE_URL -c "\d properties" # Check properties table
   ```

3. **Count All Records**
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM properties;"
   ```

#### If Application Won't Start
1. **Database-only issue**: Data is safe, fix connection
2. **Code issue**: Deploy previous version, data unaffected
3. **Migration issue**: Rollback migration, data preserved

### Prohibited Operations
```sql
-- ❌ NEVER RUN THESE COMMANDS
DROP TABLE users;
DROP TABLE contacts;  
DROP TABLE properties;
DELETE FROM users;
DELETE FROM contacts;
DELETE FROM properties;
TRUNCATE users;
TRUNCATE contacts;
TRUNCATE properties;
```

### Development vs Production

#### Development Database
- **Location**: Same as production (external)
- **Data Safety**: Same protections apply
- **Testing**: Use separate test data, not customer data

#### Production Database  
- **Access**: Via Replit database panel only
- **Modifications**: Through application only
- **Direct Access**: Emergency situations with backup first

### Monitoring & Alerts
- **Connection Status**: Automated health checks
- **Data Integrity**: Record count monitoring
- **Performance**: Query execution time tracking
- **Backup Status**: Daily backup verification

---

## 📞 Emergency Contact
If customer data appears lost or corrupted:
1. **DO NOT** run any SQL commands
2. **DO NOT** redeploy immediately  
3. **Contact** database provider support immediately
4. **Preserve** current application state for investigation

**Remember**: Customer data is the most valuable asset. When in doubt, protect the data first, fix the application second.