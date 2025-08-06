# 🚨 IMPORTANT: Prevent Data Loss When Cloning

## Why This Happens

When you clone this fractOWN app from GitHub to Replit:

1. **Database content is NOT copied** - GitHub only stores code, not database data
2. **Environment variables reset** - New Replit instance needs database connection
3. **No initial data** - App crashes because database is empty

## ✅ IMMEDIATE FIX

Run this single command after cloning:

```bash
node scripts/auto-setup.js
```

This will:
- ✅ Set up database schema
- ✅ Add sample properties (Mumbai, Bangalore, Pune, Chennai, Hyderabad)  
- ✅ Create admin user (admin/admin123)
- ✅ Configure contact settings
- ✅ Prevent crashes and "Property Not Found" errors

## Alternative Manual Steps

If auto-setup fails, run these commands:

```bash
# 1. Create database tables
npx drizzle-kit push

# 2. Add sample data
npx tsx server/seed.ts
```

## What You Get After Setup

### Sample Properties
- **Mumbai**: Oberoi Sky Heights (₹2.5Cr, Goregaon)
- **Bangalore**: Tech Park Plaza (₹5.2Cr, Electronic City)  
- **Pune**: Emerald Gardens (₹3.8Cr, Baner)
- **Chennai**: Marina Bay Residences (₹4.5Cr, Marine Drive)
- **Hyderabad**: Techno Towers (₹4.5Cr, HITEC City)

### Admin Access
- **URL**: /admin/login
- **Username**: admin
- **Password**: admin123
- **Features**: Property management, contact settings, user management

### Functional Features
- ✅ Property browsing and filtering
- ✅ Investment calculators
- ✅ Contact forms
- ✅ Admin dashboard
- ✅ TOTP authentication
- ✅ Password reset system

## Database Requirements

**For Replit:**
- PostgreSQL database must be added via Tools > Database
- Environment variables are auto-configured

**For Other Platforms:**
Set these environment variables:
```
DATABASE_URL=postgresql://user:pass@host:port/db
PGHOST=your-host
PGPORT=5432
PGDATABASE=your-db
PGUSER=your-user
PGPASSWORD=your-password
```

## Troubleshooting

### "Property Not Found" Error
**Cause**: Database is empty
**Fix**: Run `npx tsx server/seed.ts`

### Admin Login Fails
**Cause**: No admin user exists
**Fix**: Seeding creates admin user (admin/admin123)

### App Crashes on Startup
**Cause**: Database connection or missing tables
**Fix**: 
1. Ensure PostgreSQL is added to Replit
2. Run `npx drizzle-kit push`
3. Run seed script

### Database Connection Errors
**Fix**: Add PostgreSQL database in Replit Tools > Database

## Production Deployment

For production deployment:
1. Set up production PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Import production data (don't use seed data)
5. Change admin password from default

## Support

If you continue having issues:
1. Check that PostgreSQL database is properly added to your Replit
2. Verify environment variables exist
3. Run setup script again
4. Check console logs for specific errors

The key point: **Always run the setup script after cloning from GitHub** to prevent crashes and data loss.