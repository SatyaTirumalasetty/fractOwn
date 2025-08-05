#!/usr/bin/env node
/**
 * fractOWN Setup Script
 * 
 * This script helps set up the fractOWN application on a new server.
 * It handles database configuration, environment setup, and initial data seeding.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = require('../config/app.config.js');

console.log('='.repeat(60));
console.log('🏠 fractOWN Application Setup');
console.log('='.repeat(60));
console.log();

async function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function setupDatabase() {
  console.log('📊 Database Configuration');
  console.log('-'.repeat(30));
  
  const dbType = await question('Select database type (postgresql/mysql/sqlite) [postgresql]: ') || 'postgresql';
  
  let envVars = '';
  
  if (dbType === 'postgresql') {
    const host = await question('Database host [localhost]: ') || 'localhost';
    const port = await question('Database port [5432]: ') || '5432';
    const database = await question('Database name [fractown]: ') || 'fractown';
    const user = await question('Database user [postgres]: ') || 'postgres';
    const password = await question('Database password: ');
    
    const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    
    envVars = `
# Database Configuration
DATABASE_URL=${databaseUrl}
PGHOST=${host}
PGPORT=${port}
PGDATABASE=${database}
PGUSER=${user}
PGPASSWORD=${password}
`;
  } else if (dbType === 'mysql') {
    const host = await question('MySQL host [localhost]: ') || 'localhost';
    const port = await question('MySQL port [3306]: ') || '3306';
    const database = await question('Database name [fractown]: ') || 'fractown';
    const user = await question('MySQL user [root]: ') || 'root';
    const password = await question('MySQL password: ');
    
    envVars = `
# Database Configuration  
MYSQL_HOST=${host}
MYSQL_PORT=${port}
MYSQL_DATABASE=${database}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
`;
  } else if (dbType === 'sqlite') {
    const dbPath = await question('SQLite database path [./data/fractown.db]: ') || './data/fractown.db';
    
    envVars = `
# Database Configuration
SQLITE_PATH=${dbPath}
`;
  }
  
  return envVars;
}

async function setupServer() {
  console.log('\n🌐 Server Configuration');
  console.log('-'.repeat(30));
  
  const port = await question('Server port [5000]: ') || '5000';
  const host = await question('Server host [0.0.0.0]: ') || '0.0.0.0';
  const nodeEnv = await question('Environment (development/production) [production]: ') || 'production';
  
  return `
# Server Configuration
PORT=${port}
HOST=${host}
NODE_ENV=${nodeEnv}
`;
}

async function setupSecurity() {
  console.log('\n🔐 Security Configuration');
  console.log('-'.repeat(30));
  
  const sessionSecret = await question('Session secret (leave empty to generate): ') || 
    require('crypto').randomBytes(32).toString('hex');
  
  return `
# Security Configuration
SESSION_SECRET=${sessionSecret}
`;
}

async function setupFileUploads() {
  console.log('\n📁 File Upload Configuration');
  console.log('-'.repeat(30));
  
  const maxFileSize = await question('Max file size in MB [10]: ') || '10';
  const uploadPath = await question('Upload directory path [./uploads]: ') || './uploads';
  
  // Create upload directory if it doesn't exist
  const fullUploadPath = path.join(process.cwd(), uploadPath);
  if (!fs.existsSync(fullUploadPath)) {
    fs.mkdirSync(fullUploadPath, { recursive: true });
    console.log(`✓ Created upload directory: ${uploadPath}`);
  }
  
  return `
# File Upload Configuration
MAX_FILE_SIZE=${parseInt(maxFileSize) * 1024 * 1024}
UPLOAD_PATH=${uploadPath}
`;
}

async function createEnvFile() {
  console.log('\n📝 Creating .env file...');
  
  const dbConfig = await setupDatabase();
  const serverConfig = await setupServer();
  const securityConfig = await setupSecurity();
  const uploadConfig = await setupFileUploads();
  
  const envContent = `# fractOWN Environment Configuration
# Generated on ${new Date().toISOString()}

${serverConfig}
${dbConfig}
${securityConfig}
${uploadConfig}

# Optional: Email Configuration (uncomment to enable)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# Optional: SMS Configuration (uncomment to enable)
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=your-twilio-number

# Optional: Payment Gateway (uncomment to enable)
# RAZORPAY_KEY_ID=your-razorpay-key
# RAZORPAY_KEY_SECRET=your-razorpay-secret
`;

  fs.writeFileSync('.env', envContent);
  console.log('✓ .env file created successfully');
}

async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('\n🗄️  Setting up database...');
  
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✓ Database schema created successfully');
    
    const seedDb = await question('Seed database with sample data? (y/n) [y]: ') || 'y';
    if (seedDb.toLowerCase() === 'y') {
      execSync('npm run seed', { stdio: 'inherit' });
      console.log('✓ Database seeded with sample data');
      console.log('  Default admin credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('Please check your database configuration and try again.');
  }
}

async function createDirectories() {
  console.log('\n📁 Creating required directories...');
  
  const directories = ['uploads', 'logs', 'data'];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
}

async function main() {
  try {
    console.log('This script will help you set up fractOWN on your server.\n');
    
    const proceed = await question('Do you want to continue? (y/n) [y]: ') || 'y';
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
    
    await createDirectories();
    await createEnvFile();
    await installDependencies();
    await setupDatabase();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('-'.repeat(40));
    console.log('Next steps:');
    console.log('1. Review the .env file and adjust settings as needed');
    console.log('2. Start the application: npm run dev (development) or npm start (production)');
    console.log('3. Access admin dashboard at: http://localhost:5000/admin');
    console.log('4. Login with: admin / admin123');
    console.log('\nFor production deployment, refer to the README.md file.');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nSetup interrupted by user.');
  rl.close();
  process.exit(0);
});

main();