# fractOWN Setup Guide

## Why Data Gets Cleared When Cloning

When you clone this app from GitHub to Replit:
1. **Database content is NOT copied** - Only the database schema is imported
2. **Environment variables may be missing** - Database credentials need to be set up
3. **Initial data needs to be seeded** - Properties and admin users must be created

## Quick Setup Steps

### 1. Database Setup (Automatic)
The app will automatically:
- Connect to Replit's PostgreSQL database
- Create all necessary tables
- Set up proper schema

### 2. Seed Initial Data
Run this command to populate the database with sample data:
```bash
npm run seed
```

This will create:
- Sample properties in different cities
- Admin user (username: admin, password: admin123)
- Contact information settings

### 3. Alternative: Use Setup Script
For complete setup including configuration:
```bash
node scripts/setup.js
```

### 4. Manual Database Reset (if needed)
If you want to completely reset the database:
```bash
npm run db:push
npm run seed
```

## Environment Variables (Auto-configured)

These are automatically set by Replit when you add a PostgreSQL database:
- `DATABASE_URL` - Complete database connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

## Common Issues & Solutions

### Issue: "Property Not Found" or Empty Properties
**Solution:** Run the seed command
```bash
npm run seed
```

### Issue: Admin Login Fails
**Solution:** Seed will create admin user (admin/admin123)

### Issue: Database Connection Errors
**Solution:** 
1. Check if PostgreSQL database is added in Replit
2. Restart the application
3. Run database setup: `npm run db:push`

### Issue: App Crashes on Startup
**Solution:**
1. Make sure PostgreSQL database is provisioned
2. Run: `npm run db:push` then `npm run seed`
3. Restart application

## Database Schema

The app automatically creates these tables:
- `properties` - Property listings and investment data
- `contacts` - Contact form submissions
- `admin_users` - Admin authentication
- `admin_sessions` - Admin session management
- `admin_settings` - Application configuration
- `admin_password_reset_otps` - Password reset functionality

## Development vs Production

**Development (Replit):**
- Uses Replit's managed PostgreSQL
- Auto-configured environment variables
- Seed data for testing

**Production:**
- Uses production PostgreSQL database
- Manual environment variable setup
- Production data migration required

## Need Help?

1. Run setup script: `node scripts/setup.js`
2. Check logs in the console for specific errors
3. Ensure PostgreSQL database is added to your Replit project
4. Contact support if database provisioning fails