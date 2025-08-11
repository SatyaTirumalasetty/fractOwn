# fractOWN - Fractional Real Estate Investment Platform

🌐 **Live at**: [fractown.in](https://fractown.in)

## Quick Start

1. **Deploy**: Click the Deploy button in Replit
2. **Domain**: Configure DNS records for fractown.in (see DNS_SETUP_GUIDE.md)
3. **Access**: Visit https://fractown.in after DNS propagation

## Key Features

- 🏢 **Property Investment**: Fractional real estate ownership starting from ₹10L
- 📊 **Portfolio Management**: Track investments and returns
- 🔒 **Secure Admin Panel**: Property management with TOTP authentication
- 📁 **File Management**: Upload property documents and images
- 📊 **Export Data**: CSV export for properties and contacts
- 🔄 **Database Backup**: Automated backup and restore system

## About fractOWN

The fractOWN platform enables fractional ownership of premium real estate properties in India. Users can invest in high-value properties starting from ₹10 Lakhs, making real estate investment accessible to more people.

## Technical Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Security**: TOTP authentication, encryption, rate limiting
- **Deployment**: Replit with custom domain support

## Admin Access

Default admin credentials:
- **Username**: Available in environment variables
- **Password**: Available in environment variables

## Database Backup

Create backups before making changes:
```bash
tsx scripts/backup-database.ts create "Description of backup"
tsx scripts/backup-database.ts list
tsx scripts/backup-database.ts restore backup_file.json --confirm
```

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `ADMIN_USERNAME`: Admin login username
- `ADMIN_PASSWORD`: Admin login password
- `NODE_ENV`: Set to 'production' for deployment

## Support

- **Documentation**: See DNS_SETUP_GUIDE.md for domain configuration
- **Backup System**: Full database backup and restore capabilities
- **Security**: Multi-factor authentication with TOTP codes
- **Production Ready**: Environment isolation and data protection

## License

This project is proprietary software for fractional real estate investment platform.