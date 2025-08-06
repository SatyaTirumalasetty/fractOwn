import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertPropertySchema, updatePropertySchema, insertAdminUserSchema, properties, users, insertUserSchema, adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { body, validationResult } from "express-validator";
import { db } from "./db";
import { authService } from "./services/auth";
import { seedProperties } from "./seed-properties";

// Load configuration
import config from '../config/app.config.js';

// WebSocket connections for real-time updates
let wsConnections: Set<any> = new Set();

function broadcastUpdate(type: string, data?: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wsConnections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure trust proxy before security middleware
  app.set('trust proxy', config.security.additionalSecurity.trustProxy);
  
  // CORS middleware - must be before other middleware
  if (config.security.additionalSecurity.enableCors) {
    app.use(cors(config.security.additionalSecurity.corsOptions));
  }

  // Security middleware - comprehensive protection
  app.use(helmet(config.security.helmet));
  
  // Data sanitization against NoSQL injection attacks
  app.use(mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
      console.log(`Sanitized field '${key}' in ${req.method} ${req.path}`);
    }
  }));

  // Rate limiting - flexible approach
  const limiter = rateLimit(config.security.rateLimit);
  app.use(limiter);

  // Speed limiting - slow down repeated requests
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // Allow 100 requests per windowMs at full speed
    delayMs: () => 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Max delay of 20 seconds
    skip: (req) => {
      return req.path.startsWith('/assets/') || 
             req.path.startsWith('/static/') || 
             req.path === '/health' ||
             req.path === '/favicon.ico';
    }
  });
  app.use(speedLimiter);

  // Additional XSS protection middleware
  app.use((req: any, res: any, next: any) => {
    // Set additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    next();
  });

  // Input sanitization middleware for XSS protection
  const sanitizeInput = (req: any, res: any, next: any) => {
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Basic XSS sanitization - remove script tags and potentially dangerous content
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/data:\s*text\/html/gi, '')
          .trim();
      }
      return value;
    };

    const sanitizeObject = (obj: any): any => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            obj[key] = Array.isArray(obj[key]) 
              ? obj[key].map(sanitizeValue)
              : sanitizeObject(obj[key]);
          }
        }
      } else {
        obj = sanitizeValue(obj);
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject({ ...req.body });
    }
    if (req.query) {
      req.query = sanitizeObject({ ...req.query });
    }
    if (req.params) {
      req.params = sanitizeObject({ ...req.params });
    }

    next();
  };

  // Apply input sanitization to all routes
  app.use(sanitizeInput);

  // Health check endpoint (before rate limiting)
  app.get('/health', (req: any, res: any) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv
    });
  });

  // Authentication middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, config.auth.sessionSecret, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  };

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', err);
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ 
        message: 'Invalid JSON payload',
        error: 'Bad Request'
      });
    }
    
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ 
        message: 'Request entity too large',
        error: 'Payload Too Large'
      });
    }

    // Default server error
    res.status(500).json({ 
      message: 'Internal server error',
      error: config.server.nodeEnv === 'development' ? err.message : 'Server Error',
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  });

  // Get all active properties (public endpoint)
  app.get("/api/properties", async (req, res) => {
    try {
      // Only show active properties to public users
      const activeProperties = await db.select().from(properties).where(eq(properties.isActive, true));
      res.json(activeProperties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get single property (including inactive ones for detail view)
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Filter properties by city
  app.get("/api/properties/city/:city", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const filteredProperties = properties.filter(
        p => p.city.toLowerCase() === req.params.city.toLowerCase()
      );
      res.json(filteredProperties);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter properties" });
    }
  });

  // Feature flags endpoint
  app.get("/api/config/features", (req, res) => {
    res.json(config.app.features);
  });

  // Update feature flags (admin only)
  app.put("/api/admin/config/features", async (req, res) => {
    try {
      // In a real application, you would validate admin access here
      // For now, we'll update the in-memory config and save to file
      const newFeatures = req.body;
      config.app.features = { ...config.app.features, ...newFeatures };
      
      // TODO: Persist changes to config file or database
      res.json({ message: "Feature flags updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update feature flags" });
    }
  });

  // Send OTP for phone verification
  app.post("/api/auth/send-otp", [
    body('phoneNumber').isMobilePhone(),
    body('email').optional().isEmail()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, email } = req.body;
      const result = await authService.sendOTP(phoneNumber, email);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify OTP and login/register user
  app.post("/api/auth/verify-otp", [
    body('phoneNumber').isMobilePhone(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('name').optional().notEmpty().trim(),
    body('countryCode').optional().notEmpty().trim()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, otp, name, countryCode } = req.body;
      const result = await authService.verifyOTPAndLogin(phoneNumber, otp, name, countryCode);
      
      if (result.success) {
        res.json({
          message: result.message,
          user: result.user,
          sessionToken: result.sessionToken
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // User logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const sessionToken = authHeader && authHeader.split(' ')[1];
      
      if (sessionToken) {
        await authService.logout(sessionToken);
      }
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get current user info
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const sessionToken = authHeader && authHeader.split(' ')[1];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token" });
      }
      
      const user = await authService.validateSession(sessionToken);
      
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ message: "Invalid session" });
      }
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // User login
  app.post("/api/auth/login", [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      
      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.auth.sessionSecret,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // OTP Authentication Routes
  app.post("/api/auth/send-otp", [
    body('phoneNumber').isMobilePhone('any', { strictMode: false }),
    body('email').optional().isEmail()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, email } = req.body;
      const result = await authService.sendOTP(phoneNumber, email);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", [
    body('phoneNumber').isMobilePhone('any', { strictMode: false }),
    body('otp').isLength({ min: 4, max: 6 }),
    body('name').optional().trim().isLength({ min: 1 }),
    body('countryCode').optional().trim()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, otp, name, countryCode } = req.body;
      const result = await authService.verifyOTPAndLogin(phoneNumber, otp, name, countryCode);
      
      if (result.success) {
        res.json({
          message: result.message,
          user: result.user,
          sessionToken: result.sessionToken
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      // Send notification to admin if enabled
      if (config.app.features.enableEmailNotifications) {
        await sendContactNotification(contact);
      }
      
      broadcastUpdate('CONTACT_CREATED', contact);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Get all contacts (for admin)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Delete contact (admin)
  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContact(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Admin Property CRUD operations
  
  // Get all properties (including inactive ones for admin)
  app.get("/api/admin/properties", async (req, res) => {
    try {
      // For admin, get all properties without filtering by isActive
      const allProperties = await db.select().from(properties);
      res.json(allProperties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all properties" });
    }
  });

  // Create property (admin)
  app.post("/api/admin/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      broadcastUpdate('PROPERTY_CREATED', property);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Update property (admin)
  app.put("/api/admin/properties/:id", async (req, res) => {
    try {
      const validatedData = updatePropertySchema.parse(req.body);
      const property = await storage.updateProperty(req.params.id, validatedData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      broadcastUpdate('PROPERTY_UPDATED', property);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  // Delete property (admin) - soft delete
  app.delete("/api/admin/properties/:id", async (req, res) => {
    try {
      const success = await storage.deleteProperty(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      broadcastUpdate('PROPERTY_DELETED', { id: req.params.id });
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Admin user management
  
  // Create admin user
  app.post("/api/admin/users", async (req, res) => {
    try {
      const { password, ...userData } = insertAdminUserSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(password, 10);
      const adminUser = await storage.createAdminUser({
        ...userData,
        passwordHash
      });
      // Don't return password hash
      const { passwordHash: _, ...safeUser } = adminUser;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Login admin user
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Use the auth service for admin login
      const result = await authService.adminLogin(username, password);
      
      if (result.success) {
        res.json({
          message: result.message,
          sessionToken: result.sessionToken
        });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Change admin password
  app.post("/api/admin/change-password", [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
    body('notifyMobile').optional().isBoolean()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const authHeader = req.headers['authorization'];
      const sessionToken = authHeader && authHeader.split(' ')[1];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authorization required" });
      }

      // Validate session and get admin user
      const adminResult = await authService.validateSession(sessionToken);
      if (!adminResult.success || !adminResult.user) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const { currentPassword, newPassword, notifyMobile = true } = req.body;
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminResult.user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password in database
      await db.update(adminUsers)
        .set({ passwordHash: newPasswordHash })
        .where(eq(adminUsers.id, adminResult.user.id));

      // Send mobile notification if enabled and phone number is configured
      if (notifyMobile && config.app.features.enableSMSNotifications) {
        try {
          const adminProfile = await authService.getAdminProfile();
          if (adminProfile.success && adminProfile.user?.phoneNumber) {
            const phoneNumber = `${adminProfile.user.countryCode || '+91'}${adminProfile.user.phoneNumber}`;
            await notificationService.sendSMS(
              phoneNumber,
              "Your admin password has been successfully changed."
            );
          }
        } catch (smsError) {
          console.log("SMS notification failed:", smsError);
        }
      }

      res.json({ 
        message: "Password changed successfully",
        notificationSent: notifyMobile && config.app.features.enableSMSNotifications
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Get admin profile
  app.get("/api/admin/profile", async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const sessionToken = authHeader && authHeader.split(' ')[1];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authorization required" });
      }

      // Validate session
      const sessionResult = await authService.validateSession(sessionToken);
      if (!sessionResult.success) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const profileResult = await authService.getAdminProfile();
      if (profileResult.success) {
        res.json(profileResult.user);
      } else {
        res.status(404).json({ message: "Admin profile not found" });
      }
    } catch (error) {
      console.error("Get admin profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update admin profile (including mobile number)
  app.put("/api/admin/profile", [
    body('email').optional().isEmail(),
    body('phoneNumber').optional().isMobilePhone(),
    body('countryCode').optional().trim()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const authHeader = req.headers['authorization'];
      const sessionToken = authHeader && authHeader.split(' ')[1];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authorization required" });
      }

      // Validate session
      const sessionResult = await authService.validateSession(sessionToken);
      if (!sessionResult.success) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const { email, phoneNumber, countryCode } = req.body;
      const updates: any = {};

      if (email !== undefined) updates.email = email;
      if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
      if (countryCode !== undefined) updates.countryCode = countryCode;

      const result = await authService.updateAdminProfile(updates);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Update admin profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get all admin users (legacy endpoint)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const profileResult = await authService.getAdminProfile();
      if (profileResult.success) {
        res.json([profileResult.user]);
      } else {
        res.json([]);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const { WebSocketServer } = await import('ws');
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: any) => {
    console.log('Client connected to WebSocket');
    wsConnections.add(ws);
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      wsConnections.delete(ws);
    });
    
    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      wsConnections.delete(ws);
    });
  });
  
  return httpServer;
}

// Notification functions
async function sendWelcomeEmail(email: string, firstName: string) {
  if (!config.app.features.enableEmailNotifications) return;
  
  try {
    // Implementation depends on email service configured
    console.log(`Sending welcome email to ${email}`);
    // TODO: Implement actual email sending based on configured service
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

async function sendWelcomeSMS(phone?: string) {
  if (!config.app.features.enableSMSNotifications || !phone) return;
  
  try {
    console.log(`Sending welcome SMS to ${phone}`);
    // TODO: Implement actual SMS sending based on configured service
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
  }
}

async function sendContactNotification(contact: any) {
  if (!config.app.features.enableEmailNotifications) return;
  
  try {
    console.log(`Sending contact notification for ${contact.email}`);
    // TODO: Implement actual notification sending
  } catch (error) {
    console.error('Failed to send contact notification:', error);
  }
}

async function sendPasswordChangeNotification(adminUser: any) {
  if (!config.app.features.enableSMSNotifications) return;
  
  try {
    console.log(`Sending password change notification to admin ${adminUser.username}`);
    // TODO: Implement actual SMS sending based on configured service
    // This would typically send to a registered mobile number for the admin
  } catch (error) {
    console.error('Failed to send password change notification:', error);
  }
}
