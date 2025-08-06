# fractOWN - Fractional Real Estate Investment Platform

Welcome to fractOWN! This is a complete web application that allows people to invest in real estate properties with small amounts of money. Anyone can set up and run this application on their own server by following these simple instructions.

## 🚀 What is fractOWN?

fractOWN democratizes real estate investment by allowing users to:
- Invest in premium properties starting from just ₹10 Lakhs
- View detailed property information with multiple images
- Track investment progress and returns
- Manage properties through an admin dashboard

## 📋 What You Need Before Starting

### Step 1: System Requirements
Your server/computer needs:
- **Operating System**: Windows 10/11, macOS, or Linux
- **Memory**: At least 4GB RAM
- **Storage**: At least 10GB free space
- **Internet**: Stable internet connection

### Step 2: Install Required Software

#### A. Install Node.js (JavaScript Runtime)
1. Go to https://nodejs.org
2. Download the "LTS" version (recommended for most users)
3. Run the installer and follow the instructions
4. Open a terminal/command prompt and type: `node --version`
5. You should see a version number like "v20.x.x"

#### B. Install a Database (Choose One)

**Option 1: PostgreSQL (Recommended)**
1. Go to https://www.postgresql.org/download/
2. Download PostgreSQL for your operating system
3. Install with these settings:
   - Username: `postgres`
   - Password: `your_secure_password` (remember this!)
   - Port: `5432`
4. Make note of your username, password, and port

**Option 2: MySQL**
1. Go to https://dev.mysql.com/downloads/mysql/
2. Download MySQL Community Server
3. Install with default settings
4. Remember your root password

**Option 3: SQLite (Easiest)**
- No installation needed! SQLite creates a file on your computer
- Good for testing but not recommended for production

#### C. Install Git (Version Control)
1. Go to https://git-scm.com/downloads
2. Download Git for your operating system
3. Install with default settings

## 🏗️ Setting Up fractOWN

### Step 1: Download the Application

**Option A: Download from GitHub**
1. Go to your fractOWN project page
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder like `C:\fractOWN` or `/home/user/fractOWN`

**Option B: Using Git (if you have it)**
```bash
git clone [your-repository-url]
cd fractOWN
```

### Step 2: Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **macOS**: Press `Cmd + Space`, type `terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

Navigate to your fractOWN folder:
```bash
cd path/to/fractOWN
```

### Step 3: Install Dependencies
Type this command and wait for it to finish:
```bash
npm install
```

This downloads all the necessary files for the application.

### Step 4: Configure the Application

#### Option A: Automatic Setup (Recommended)
Run the setup script:
```bash
npm run setup
```

This will ask you questions like:
- What database do you want to use?
- What's your database password?
- What port should the server run on?

Answer each question, and the script will create all necessary files.

#### Option B: Manual Setup
Create a file called `.env` in your fractOWN folder with this content:

**For PostgreSQL:**
```env
# Server Settings
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

# Database Settings
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fractown
PGHOST=localhost
PGPORT=5432
PGDATABASE=fractown
PGUSER=postgres
PGPASSWORD=your_password

# Security
SESSION_SECRET=your_random_secret_key_here

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**For MySQL:**
```env
# Server Settings
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

# Database Settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=fractown
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# Security
SESSION_SECRET=your_random_secret_key_here

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**For SQLite:**
```env
# Server Settings
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

# Database Settings
SQLITE_PATH=./data/fractown.db

# Security
SESSION_SECRET=your_random_secret_key_here

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

Replace `your_password` with your actual database password.

### Step 5: Set Up the Database
Run these commands one by one:

```bash
# Create the database structure
npm run db:push

# Add sample data (optional but recommended)
npm run seed
```

If successful, you'll see:
- "Database schema created successfully"
- "Database seeded with sample data"
- Default admin credentials: admin / admin123

## 🚀 Starting the Application

### For Development/Testing
```bash
npm run dev
```

### For Production
```bash
npm run build
npm start
```

You should see:
```
[express] serving on port 5000
```

## 🌐 Accessing Your Application

1. Open your web browser
2. Go to: `http://localhost:5000`
3. You should see the fractOWN homepage!

### Admin Access
1. Go to: `http://localhost:5000/admin`
2. Login with the admin credentials created during setup:
   - Username: `admin`
   - Password: Check the setup/seed output for the generated secure password
3. **IMPORTANT**: Change this password immediately after first login using the admin settings!

## 🔧 Configuration Options

All settings can be changed in the admin dashboard under the "Settings" tab:

### Branding
- Upload your company logo
- Change application name
- Set support email address

### Theme
- Customize colors and appearance
- Primary, secondary, and accent colors
- Background and text colors

### Content
- Edit section titles and descriptions
- Customize hero section text
- Update investment information

### System Settings
- Set minimum and maximum investment amounts
- Configure file upload limits
- Enable/disable features like notifications

### File Uploads
- Maximum file size for images
- Allowed file types
- Number of images per property

## 📊 Managing Properties

### Adding Properties
1. Go to Admin Dashboard → Properties tab
2. Click "Add Property"
3. Fill in all required information:
   - Property name and description
   - Location (state and city)
   - Property type (residential/commercial)
   - Total value and minimum investment
   - Expected return percentage
   - Multiple property images (drag and drop)

### Property Images
- You can upload multiple images for each property
- Supported formats: JPEG, PNG, WebP, GIF
- Maximum file size: 10MB per image (configurable)
- Users will see a carousel to browse through all images

### Managing Contacts
- View all contact form submissions
- Export contact data
- Respond to inquiries

## 🔐 Security Best Practices

### Change Default Passwords
1. Admin password: Change from `admin123` to a strong password
2. Database password: Use a complex password
3. Session secret: Generate a random string

### Regular Updates
- Keep Node.js updated to the latest LTS version
- Update the application when new versions are available
- Monitor for security updates

### Backup Your Data
- Regularly backup your database
- Keep copies of your `.env` file (securely)
- Backup uploaded property images

## 🌍 Making Your Site Available on the Internet

### For Production Deployment

1. **Get a Domain Name**
   - Purchase from providers like GoDaddy, Namecheap, or Cloudflare
   - Example: `yourcompany.com`

2. **Get a Server**
   - Cloud providers: AWS, DigitalOcean, Linode, Vultr
   - Minimum: 2GB RAM, 20GB storage
   - Operating System: Ubuntu 20.04+ recommended

3. **Install on Server**
   - Follow the same setup steps as above
   - Change `HOST=0.0.0.0` in your `.env` file
   - Use a production database (not SQLite)

4. **Set Up Reverse Proxy**
   - Install Nginx or Apache
   - Configure SSL certificate (free with Let's Encrypt)
   - Point your domain to your server

5. **Use Process Manager**
   ```bash
   npm install -g pm2
   pm2 start npm --name "fractown" -- start
   pm2 save
   pm2 startup
   ```

## ❗ Troubleshooting

### Common Issues

**"Port already in use"**
- Change `PORT=5000` to `PORT=3000` or another number in `.env`
- Or stop other applications using that port

**"Database connection failed"**
- Check if your database is running
- Verify username/password in `.env` file
- Make sure database name exists

**"Permission denied"**
- On Linux/macOS, you might need `sudo` for some commands
- Check file permissions: `chmod 755 fractOWN`

**"Module not found"**
- Delete `node_modules` folder
- Run `npm install` again

**Images not uploading**
- Check if `uploads` folder exists and is writable
- Verify file size limits in admin settings
- Check file format is supported

### Getting Help

1. **Check the Error Messages**
   - Read the full error message
   - Look for clues about what went wrong

2. **Check Log Files**
   - Look in the terminal where you started the application
   - Error messages will show there

3. **Common Solutions**
   - Restart the application: Stop with `Ctrl+C`, then `npm run dev`
   - Restart your database service
   - Check your `.env` file for typos

## 📁 Project Structure

```
fractOWN/
├── client/                 # Frontend application (what users see)
├── server/                 # Backend application (handles data)
├── shared/                 # Code shared between frontend and backend
├── config/                 # Configuration files
├── scripts/                # Setup and maintenance scripts
├── uploads/                # User uploaded files
├── .env                    # Your configuration settings
├── package.json            # Project dependencies
└── README.md              # This file
```

## 🔄 Updating the Application

When a new version is available:

1. **Backup Everything**
   - Export your database
   - Copy your `.env` file
   - Backup uploaded images

2. **Update Code**
   ```bash
   git pull origin main
   # or download new ZIP and replace files
   ```

3. **Update Dependencies**
   ```bash
   npm install
   ```

4. **Update Database**
   ```bash
   npm run db:push
   ```

5. **Restart Application**
   ```bash
   npm run dev
   ```

## 📞 Support

If you need help:
1. Check this README file first
2. Look at error messages in your terminal
3. Contact technical support with:
   - Your operating system
   - Node.js version (`node --version`)
   - The exact error message
   - What you were trying to do when it happened

## 🎉 You're Ready!

Congratulations! You now have a fully functional real estate investment platform. Users can:

- Browse properties with multiple images
- Calculate potential investments
- Submit contact inquiries
- View detailed property information

As an admin, you can:
- Add and manage properties
- Customize the entire appearance
- View and respond to contacts
- Monitor platform activity
- Configure all settings through the web interface

The application automatically updates in real-time when you make changes, so your users always see the latest information without refreshing their browsers.

Start by uploading some properties and customizing your branding in the admin dashboard. Welcome to fractOWN!