# fractOWN - Fractional Real Estate Investment Platform

## Overview

fractOWN is a comprehensive web application that democratizes real estate investment in India by enabling users to invest in premium properties through fractional ownership. The platform allows investors to start with as little as ₹10L and benefit from property appreciation.

## Features

- **Property Browsing**: View and filter premium real estate properties
- **Investment Calculator**: Calculate potential returns and investment amounts
- **Admin Dashboard**: Complete property and user management system
- **Contact Management**: Lead management and investor inquiries
- **Responsive Design**: Works on all devices and screen sizes
- **Configurable Settings**: Easily customizable for different deployments

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: bcrypt with session management
- **File Handling**: Configurable file uploads
- **Development**: Vite, hot module replacement

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher) 
- **PostgreSQL** (v13 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fractown
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: PostgreSQL (Recommended)

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE fractown;
   CREATE USER fractown_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE fractown TO fractown_user;
   \q
   ```

3. **Set Environment Variables**:
   ```bash
   export DATABASE_URL="postgresql://fractown_user:your_password@localhost:5432/fractown"
   export PGHOST="localhost"
   export PGPORT="5432"
   export PGDATABASE="fractown"
   export PGUSER="fractown_user"
   export PGPASSWORD="your_password"
   ```

#### Option B: Alternative Databases

Edit `config/app.config.js` to use MySQL or SQLite:

```javascript
// For MySQL
database: {
  mysql: {
    host: 'localhost',
    port: 3306,
    database: 'fractown',
    user: 'your_user',
    password: 'your_password'
  }
}

// For SQLite (development only)
database: {
  sqlite: {
    filename: './data/fractown.db'
  }
}
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://fractown_user:your_password@localhost:5432/fractown
PGHOST=localhost
PGPORT=5432
PGDATABASE=fractown
PGUSER=fractown_user
PGPASSWORD=your_password

# Server
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Security
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Optional: Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: SMS Configuration  
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Optional: Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### 5. Database Migration

Push the database schema:

```bash
npm run db:push
```

### 6. Seed Initial Data

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 6 sample properties
- Default admin user (username: `admin`, password: `admin123`)

### 7. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Configuration

### Application Settings

Modify `config/app.config.js` for:

- **Server settings**: Port, host, CORS
- **Database connections**: PostgreSQL, MySQL, SQLite
- **File upload limits**: Size, types, storage path
- **Authentication**: Session settings, bcrypt rounds
- **Business rules**: Investment limits, supported states
- **Feature flags**: Enable/disable functionality

### Support Configuration

⚠️ **Support team only**: Modify `config/support.config.js` for:

- Database migrations
- Maintenance scripts
- Emergency recovery
- System monitoring
- Security auditing

## Admin Dashboard

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

### Admin Features
- Property management (CRUD operations)
- Contact management
- Application settings
- Logo and theme customization
- File upload management

### Customization Options

The admin dashboard includes:

1. **Logo Management**: Upload custom logos
2. **Theme Settings**: Configure colors and branding
3. **Content Management**: Edit section descriptions
4. **File Upload Settings**: Configure size limits and allowed types
5. **Business Rules**: Set investment limits and supported regions

## Deployment

### Production Server Setup

1. **Server Requirements**:
   - Ubuntu 20.04 LTS or higher
   - 2GB RAM minimum (4GB recommended)
   - 20GB storage minimum
   - Node.js 18+, PostgreSQL 13+

2. **Server Preparation**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx for reverse proxy
   sudo apt install -y nginx
   ```

3. **Application Deployment**:
   ```bash
   # Clone and setup
   git clone <repository-url> /var/www/fractown
   cd /var/www/fractown
   npm install
   npm run build
   
   # Set up environment
   sudo nano .env
   # Configure production environment variables
   
   # Database setup
   sudo -u postgres createdb fractown
   npm run db:push
   npm run seed
   
   # Start with PM2
   pm2 start npm --name "fractown" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate** (using Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Database Migration Between Servers

1. **Export from source**:
   ```bash
   pg_dump -h source_host -U username -d fractown > fractown_backup.sql
   ```

2. **Import to destination**:
   ```bash
   psql -h destination_host -U username -d fractown < fractown_backup.sql
   ```

## File Structure

```
fractown/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── seed.ts           # Database seeding
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema and types
├── config/              # Configuration files
│   ├── app.config.js    # Application configuration
│   └── support.config.js # Support team configuration
├── uploads/             # File upload directory
├── logs/               # Application logs
└── README.md           # This file
```

## API Endpoints

### Public Endpoints
- `GET /api/properties` - List active properties
- `GET /api/properties/:id` - Get property details
- `POST /api/contact` - Submit contact form

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/properties` - List all properties
- `POST /api/admin/properties` - Create property
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property
- `GET /api/contacts` - List contacts
- `DELETE /api/contacts/:id` - Delete contact

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check firewall settings for port 5432

2. **File Upload Not Working**:
   - Check UPLOAD_PATH directory permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure upload directory exists

3. **Admin Login Failed**:
   - Run seed script again: `npm run seed`
   - Check database for admin_users table
   - Verify bcrypt is working properly

4. **Application Won't Start**:
   - Check port availability: `lsof -i :5000`
   - Verify all dependencies installed: `npm install`
   - Check Node.js version: `node --version`

### Performance Optimization

1. **Database Optimization**:
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_properties_city ON properties(city);
   CREATE INDEX idx_properties_active ON properties(is_active);
   CREATE INDEX idx_contacts_created ON contacts(created_at);
   ```

2. **File Upload Optimization**:
   - Use CDN for image storage
   - Implement image compression
   - Add file type validation

3. **Caching**:
   - Enable Redis for session storage
   - Implement API response caching
   - Use browser caching for static assets

## Security Considerations

1. **Production Security**:
   - Change default admin credentials
   - Use strong SESSION_SECRET
   - Enable HTTPS with SSL certificates
   - Implement rate limiting
   - Regular security updates

2. **Database Security**:
   - Use connection pooling
   - Implement SQL injection protection
   - Regular backups
   - Monitor for suspicious queries

3. **File Upload Security**:
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Implement proper file permissions
   - Use secure file storage

## Support

For technical support or questions:

- **Email**: support@fractown.com
- **Documentation**: Check this README and config files
- **Support Configuration**: Refer to `config/support.config.js`

## License

This project is proprietary software. All rights reserved.

## Changelog

### Version 1.0.0
- Initial release
- Property management system
- Admin dashboard
- Contact management
- Configurable settings
- Database abstraction layer
- File upload system
- Responsive design