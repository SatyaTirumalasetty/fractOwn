/**
 * fractOWN Application Configuration
 * 
 * This file contains all configurable settings for the application.
 * Modify these settings according to your deployment environment.
 */

export default {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Database Configuration
  database: {
    // Primary database connection
    url: process.env.DATABASE_URL,
    
    // Alternative database configurations (uncomment to use)
    // PostgreSQL Configuration
    postgresql: {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'fractown',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    
    // MySQL Configuration (uncomment to switch to MySQL)
    // mysql: {
    //   host: process.env.MYSQL_HOST || 'localhost',
    //   port: process.env.MYSQL_PORT || 3306,
    //   database: process.env.MYSQL_DATABASE || 'fractown',
    //   user: process.env.MYSQL_USER || 'root',
    //   password: process.env.MYSQL_PASSWORD || ''
    // },
    
    // SQLite Configuration (uncomment for local development)
    // sqlite: {
    //   filename: process.env.SQLITE_PATH || './data/fractown.db'
    // },
    
    // Connection pool settings
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000
    }
  },

  // File Upload Configuration
  uploads: {
    maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFilesPerProperty: 10
  },

  // Authentication Configuration
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'fractown-session-secret-change-in-production',
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    bcryptRounds: 12,
    defaultAdminCredentials: {
      username: 'admin',
      password: 'admin123',
      email: 'admin@fractown.com'
    }
  },

  // Application Settings
  app: {
    name: 'fractOWN',
    description: 'Democratizing real estate investment through fractional ownership',
    version: '1.0.0',
    supportEmail: 'support@fractown.com',
    
    // Feature flags
    features: {
      enableUserRegistration: false,
      enableEmailNotifications: false,
      enableSMSNotifications: false,
      enablePaymentIntegration: false
    },
    
    // Business logic
    business: {
      minInvestmentAmount: 10000, // ₹10,000 minimum
      maxInvestmentAmount: 10000000, // ₹1 Crore maximum
      defaultCurrency: 'INR',
      supportedStates: [
        'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Delhi',
        'Haryana', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Punjab'
      ]
    }
  },

  // Email Configuration (if enabled)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },

  // SMS Configuration (if enabled)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Notification Templates
  notifications: {
    email: {
      welcome: {
        subject: 'Welcome to fractOWN',
        template: 'welcome-email'
      },
      investmentConfirm: {
        subject: 'Investment Confirmed',
        template: 'investment-confirm'
      },
      propertyUpdate: {
        subject: 'Property Update',
        template: 'property-update'
      }
    },
    sms: {
      welcome: 'Welcome to fractOWN! Start investing in premium real estate.',
      investmentConfirm: 'Your investment has been confirmed. Thank you!',
      propertyUpdate: 'New property available for investment.'
    }
  },

  // Security Configuration
  security: {
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"]
        }
      } : false, // Disable CSP in development
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    }
  },

  // API Keys and External Services
  // Payment Gateway Configuration (if enabled)
  payments: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    }
  },

  // API Keys and External Services
  integrations: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    },
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxFiles: 5,
    maxSize: '10m'
  }
};