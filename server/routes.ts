import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { insertContactSchema, insertPropertySchema, updatePropertySchema, insertAdminUserSchema, properties, users, insertUserSchema, adminUsers, contacts, homePageSections, insertHomePageSectionSchema } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { ProductionProtection, productionProtectionMiddleware } from "./production-protection";
import { seedSiteStatistics, getStatisticsStatus } from "./seed-statistics";
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
import { cryptoService } from "./security/crypto";
import { authRateLimiter, totpRateLimiter, adminRateLimiter, generalRateLimiter } from "./security/rate-limiter";
import { SecurityValidator, validationMiddleware } from "./security/validator";
import { performanceMonitor, databaseMonitor } from "./performance/monitor";
import { sessionCache, propertyCache, configCache } from "./performance/cache";
import { totpSecurityManager, TOTP_CONFIG } from "./security/totp-security";
import securePropertiesRouter from "./routes/secureProperties";

// Load configuration
import config from '../config/app.config.js';

// WebSocket connections for real-time updates - optimized memory management
let wsConnections: Set<any> = new Set();

function broadcastUpdate(type: string, data?: any) {
  if (wsConnections.size === 0) return; // Skip if no connections
  
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  const deadConnections: any[] = [];
  
  wsConnections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      try {
        ws.send(message);
      } catch (error) {
        deadConnections.push(ws);
      }
    } else {
      deadConnections.push(ws);
    }
  });
  
  // Clean up dead connections
  deadConnections.forEach(ws => wsConnections.delete(ws));
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
  
  // Enhanced input validation and sanitization
  app.use(validationMiddleware);
  
  // Data sanitization against NoSQL injection attacks
  app.use(mongoSanitize({
    replaceWith: '_', // Replace prohibited characters with underscore
    onSanitize: ({ req, key }) => {
      console.log(`Sanitized field '${key}' in ${req.method} ${req.path}`);
    }
  }));

  // Performance monitoring middleware
  app.use(performanceMonitor.createMiddleware());

  // Enhanced rate limiting with security focus
  app.use('/api/admin/login', authRateLimiter);
  app.use('/api/admin/totp', totpRateLimiter);
  app.use('/api/admin', adminRateLimiter);
  app.use('/api', generalRateLimiter);

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
      console.log("Creating property with data:", req.body);
      
      // Clean and validate request body
      const cleanedBody = {
        ...req.body,
        // Convert empty string to null for numeric fields
        expectedReturn: req.body.expectedReturn === '' ? null : req.body.expectedReturn,
        fundingProgress: req.body.fundingProgress || 0
      };
      
      const validatedData = insertPropertySchema.parse(cleanedBody);
      console.log("Validated data:", validatedData);
      
      const property = await storage.createProperty(validatedData);
      broadcastUpdate('PROPERTY_CREATED', property);
      res.status(201).json(property);
    } catch (error) {
      console.error("Property creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        message: "Failed to create property",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
      
      // Get admin user
      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create session
      const crypto = await import('crypto');
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createAdminSession(admin.id, sessionToken, expiresAt);

      // Set HTTP-only cookie
      res.cookie('adminSessionToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        message: "Admin login successful",
        sessionToken: sessionToken
      });
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

  // Admin settings endpoints
  app.get("/api/admin/settings/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getAdminSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Failed to fetch admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      const { key, value, category = "contact", description } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ message: "Key and value are required" });
      }

      await storage.setAdminSetting(key, value, category, description);
      res.json({ message: "Setting updated successfully" });
    } catch (error) {
      console.error("Failed to update admin setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Get public contact information (for homepage)
  app.get("/api/contact-info", async (req, res) => {
    try {
      const contactSettings = await storage.getAdminSettingsByCategory("contact");
      const contactInfo = contactSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      res.json(contactInfo);
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });

  // Home Page Sections Management API endpoints
  
  // Get all home page sections (public endpoint for frontend)
  app.get("/api/homepage-sections", async (req, res) => {
    try {
      const sections = await db.select().from(homePageSections).orderBy(sql`display_order ASC`);
      res.json(sections);
    } catch (error) {
      console.error("Failed to fetch homepage sections:", error);
      res.status(500).json({ message: "Failed to fetch homepage sections" });
    }
  });

  // Admin endpoint: Get all home page sections for management
  app.get("/api/admin/homepage-sections", async (req, res) => {
    try {
      const sections = await db.select().from(homePageSections).orderBy(sql`display_order ASC`);
      res.json(sections);
    } catch (error) {
      console.error("Failed to fetch homepage sections:", error);
      res.status(500).json({ message: "Failed to fetch homepage sections" });
    }
  });

  // Admin endpoint: Update home page section
  app.put("/api/admin/homepage-sections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isEnabled, displayOrder } = req.body;
      
      const updateData: any = {};
      if (typeof isEnabled === 'boolean') updateData.isEnabled = isEnabled;
      if (typeof displayOrder === 'number') updateData.displayOrder = displayOrder;
      if (Object.keys(updateData).length > 0) updateData.updatedAt = new Date();
      
      const [updatedSection] = await db
        .update(homePageSections)
        .set(updateData)
        .where(eq(homePageSections.id, id))
        .returning();
      
      if (!updatedSection) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      broadcastUpdate('HOMEPAGE_SECTION_UPDATED', updatedSection);
      res.json(updatedSection);
    } catch (error) {
      console.error("Failed to update homepage section:", error);
      res.status(500).json({ message: "Failed to update homepage section" });
    }
  });

  // Admin endpoint: Bulk update home page sections
  app.put("/api/admin/homepage-sections", async (req, res) => {
    try {
      const { sections } = req.body;
      
      if (!Array.isArray(sections)) {
        return res.status(400).json({ message: "Sections array is required" });
      }
      
      const updatedSections = [];
      
      for (const sectionUpdate of sections) {
        const { id, isEnabled, displayOrder } = sectionUpdate;
        
        const updateData: any = {};
        if (typeof isEnabled === 'boolean') updateData.isEnabled = isEnabled;
        if (typeof displayOrder === 'number') updateData.displayOrder = displayOrder;
        if (Object.keys(updateData).length > 0) updateData.updatedAt = new Date();
        
        const [updatedSection] = await db
          .update(homePageSections)
          .set(updateData)
          .where(eq(homePageSections.id, id))
          .returning();
        
        if (updatedSection) {
          updatedSections.push(updatedSection);
        }
      }
      
      broadcastUpdate('HOMEPAGE_SECTIONS_UPDATED', updatedSections);
      res.json(updatedSections);
    } catch (error) {
      console.error("Failed to bulk update homepage sections:", error);
      res.status(500).json({ message: "Failed to update homepage sections" });
    }
  });

  // Admin password reset - request OTP
  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      if (!admin.phoneNumber) {
        return res.status(400).json({ message: "No phone number registered for this admin account" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createPasswordResetOtp(admin.id, admin.phoneNumber, otp, expiresAt);

      // In a real app, send SMS here
      console.log(`Password reset OTP for ${admin.username}: ${otp}`);
      
      res.json({ 
        message: "OTP sent successfully", 
        phoneNumber: admin.phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') // masked phone number
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Admin password reset - verify OTP and reset password
  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      const { username, otp, newPassword } = req.body;
      
      if (!username || !otp || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const admin = await storage.getAdminUserByUsername(username);
      if (!admin || !admin.phoneNumber) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      const adminId = await storage.validatePasswordResetOtp(admin.phoneNumber, otp);
      if (!adminId || adminId !== admin.id) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Hash the new password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and mark OTP as used
      await storage.updateAdminPassword(admin.id, hashedPassword);
      await storage.markPasswordResetOtpAsUsed(admin.phoneNumber, otp);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // TOTP Routes for Authenticator-based Password Reset
  
  // Enhanced authentication middleware with security hardening
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      // Check both cookies and Authorization header with validation
      let sessionToken = null;
      
      if (req.cookies && req.cookies.adminSessionToken) {
        sessionToken = req.cookies.adminSessionToken;
      } else if (req.headers.authorization) {
        sessionToken = req.headers.authorization.replace('Bearer ', '');
      }
      
      if (!sessionToken) {
        console.log("No session token found in cookies or headers");
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate session token format for security
      if (!SecurityValidator.validateSessionToken(sessionToken)) {
        console.log("Invalid session token format");
        return res.status(401).json({ message: "Invalid session format" });
      }

      console.log("Validating session token:", sessionToken.substring(0, 10) + "...");
      const adminId = await storage.validateAdminSession(sessionToken);
      
      if (!adminId) {
        console.log("Session token validation failed");
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      console.log("Authentication successful for admin:", adminId);
      req.user = { id: adminId };
      
      // Set security headers
      res.setHeader('X-Admin-Session', 'active');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      
      next();
    } catch (error) {
      console.error("Authentication middleware error:", error);
      res.status(500).json({ message: "Authentication error" });
    }
  };

  // Generate TOTP secret and QR code for setup - Enhanced Security
  app.post("/api/admin/totp/generate", requireAuth, async (req, res) => {
    try {
      const speakeasy = await import('speakeasy');
      const qrcode = await import('qrcode');
      
      // Generate cryptographically secure secret
      const secret = speakeasy.generateSecret({
        name: `fractOWN Admin (${req.user.id.substring(0, 8)})`,
        issuer: 'fractOWN',
        length: 32
      });

      // Encrypt the secret before storing
      const encryptedSecret = cryptoService.encrypt(secret.base32);
      await storage.updateAdminTOTPSecret(req.user.id, encryptedSecret);

      // Generate QR code with enhanced options
      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 256
      });

      // Enhanced security validation
      const setupValidation = totpSecurityManager.validateTOTPSetup(req.user.id, req.ip || 'unknown');
      if (!setupValidation.allowed) {
        return res.status(429).json({ message: setupValidation.reason });
      }

      // Log security event
      totpSecurityManager.logSecurityEvent({
        adminId: req.user.id,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        action: 'generate',
        success: true
      });

      console.log(`TOTP secret generated for admin: ${req.user.id.substring(0, 8)}... from IP: ${req.ip}`);

      res.json({
        secret: secret.base32, // Return unencrypted for QR setup only
        qrCode: qrCodeDataURL,
        backupInstructions: 'Save this secret in a secure location. You can also scan the QR code with your authenticator app.'
      });
    } catch (error) {
      console.error("TOTP generation error:", error);
      res.status(500).json({ message: "Failed to generate TOTP secret" });
    }
  });

  // Verify TOTP token and enable TOTP authentication - Enhanced Security
  app.post("/api/admin/totp/verify", requireAuth, async (req, res) => {
    try {
      const { token } = req.body;
      
      // Enhanced token validation
      if (!SecurityValidator.validateTOTPToken(token)) {
        console.log(`Invalid TOTP token format from IP: ${req.ip}`);
        return res.status(400).json({ message: "Valid 6-digit token required" });
      }

      const encryptedSecret = await storage.getAdminTOTPSecret(req.user.id);
      if (!encryptedSecret) {
        return res.status(400).json({ message: "No TOTP secret found. Please generate first." });
      }

      // Decrypt the secret for verification
      const secret = cryptoService.decrypt(encryptedSecret);

      const speakeasy = await import('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Reduced window for better security (30 seconds)
      });

      if (!verified) {
        // Log failed security event
        totpSecurityManager.logSecurityEvent({
          adminId: req.user.id,
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          action: 'verify',
          success: false
        });
        
        console.log(`TOTP verification failed for admin: ${req.user.id.substring(0, 8)}... from IP: ${req.ip}`);
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Generate secure backup codes using security manager
      const backupCodes = totpSecurityManager.generateSecureBackupCodes();
      
      // Hash backup codes before storage
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(code => cryptoService.hashBackupCode(code))
      );

      // Enable TOTP with hashed backup codes
      await storage.enableAdminTOTP(req.user.id, hashedBackupCodes);

      // Log successful security event
      totpSecurityManager.logSecurityEvent({
        adminId: req.user.id,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        action: 'verify',
        success: true
      });

      console.log(`TOTP enabled for admin: ${req.user.id.substring(0, 8)}... from IP: ${req.ip}`);

      // Clear the plain secret from memory (security best practice)
      cryptoService.secureWipe(secret);

      res.json({
        message: "TOTP authentication enabled successfully",
        backupCodes, // Return plain codes for user to save
        securityNotice: "Save these backup codes in a secure location. They can be used if you lose access to your authenticator app."
      });
    } catch (error) {
      console.error("TOTP verification error:", error);
      res.status(500).json({ message: "Failed to verify TOTP token" });
    }
  });

  // TOTP-based password reset (alternative to SMS OTP)
  app.post("/api/admin/forgot-password-totp", async (req, res) => {
    try {
      const { username, totpCode, backupCode, newPassword } = req.body;
      
      if (!username || !newPassword) {
        return res.status(400).json({ message: "Username and new password are required" });
      }

      if (!totpCode && !backupCode) {
        return res.status(400).json({ message: "TOTP code or backup code is required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      // Check if TOTP is enabled
      const secret = await storage.getAdminTOTPSecret(admin.id);
      if (!secret && !admin.backupCodes) {
        return res.status(400).json({ message: "TOTP authentication not set up for this account" });
      }

      let isValid = false;

      // Verify TOTP code or backup code
      if (totpCode) {
        const speakeasy = await import('speakeasy');
        isValid = speakeasy.totp.verify({
          secret: secret,
          encoding: 'base32',
          token: totpCode,
          window: 2
        });
      } else if (backupCode) {
        isValid = await storage.validateBackupCode(admin.id, backupCode);
      }

      if (!isValid) {
        return res.status(400).json({ message: "Invalid authentication code" });
      }

      // Hash and update password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateAdminPassword(admin.id, hashedPassword);

      res.json({ message: "Password reset successfully using authenticator" });
    } catch (error) {
      console.error("TOTP password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get TOTP status for admin dashboard
  app.get("/api/admin/totp/status", requireAuth, async (req, res) => {
    try {
      const { adminUsers } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const { db } = await import("./db");
      
      const [admin] = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.id, req.user.id));
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({
        totpEnabled: admin.totpEnabled || false,
        backupCodesCount: admin.backupCodes?.length || 0
      });
    } catch (error) {
      console.error("TOTP status error:", error);
      res.status(500).json({ message: "Failed to get TOTP status" });
    }
  });

  // Disable TOTP authentication with enhanced security
  app.post("/api/admin/totp/disable", requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      
      // Require password confirmation for disabling TOTP
      if (!password) {
        return res.status(400).json({ message: "Password confirmation required to disable TOTP" });
      }

      // Validate password
      const { db } = await import("./db");
      const { adminUsers } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.user.id));
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      await db.update(adminUsers)
        .set({ 
          totpEnabled: false,
          totpSecret: null,
          backupCodes: []
        })
        .where(eq(adminUsers.id, req.user.id));

      // Log security event
      totpSecurityManager.logSecurityEvent({
        adminId: req.user.id,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        action: 'disabled',
        success: true
      });

      console.log(`TOTP disabled for admin: ${req.user.id.substring(0, 8)}... from IP: ${req.ip}`);

      res.json({ 
        message: "TOTP authentication disabled successfully",
        securityNotice: "Two-factor authentication has been disabled. Your account security has been reduced."
      });
    } catch (error) {
      console.error("TOTP disable error:", error);
      res.status(500).json({ message: "Failed to disable TOTP" });
    }
  });

  // Admin security dashboard - View security events and performance metrics
  app.get("/api/admin/security/dashboard", requireAuth, async (req, res) => {
    try {
      const securityStats = totpSecurityManager.getSecurityStats();
      const adminSecurityEvents = totpSecurityManager.getAdminSecurityEvents(req.user.id, 20);
      const performanceStats = performanceMonitor.getStats();
      const memoryStats = performanceMonitor.getMemoryStats();
      
      res.json({
        security: {
          stats: securityStats,
          recentEvents: adminSecurityEvents
        },
        performance: performanceStats,
        memory: memoryStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Security dashboard error:", error);
      res.status(500).json({ message: "Failed to load security dashboard" });
    }
  });

  // Admin dashboard stats route
  app.get("/api/admin/dashboard-stats/:period", requireAuth, async (req, res) => {
    try {
      const { period } = req.params;
      const validPeriods = ['7d', '30d', '90d'];
      
      if (!validPeriods.includes(period)) {
        return res.status(400).json({ message: "Invalid period. Use 7d, 30d, or 90d" });
      }

      // Calculate date range
      const days = parseInt(period.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get basic dashboard stats
      const allProperties = await db.select().from(properties);
      const allContacts = await db.select().from(contacts);
      const totalProperties = allProperties.length;
      const totalContacts = allContacts.length;
      const activeProperties = allProperties.filter(p => p.isActive).length;

      const stats = {
        totalProperties,
        totalContacts,
        activeProperties,
        period: period,
        generatedAt: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to load dashboard stats" });
    }
  });

  // Mount secure properties router for encrypted data handling
  app.use(securePropertiesRouter);

  // Object storage routes for file uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      console.log("Getting upload URL for object storage...");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL", details: error.message });
    }
  });

  // Admin logo upload endpoint (no content-type validation needed for upload URL request)
  app.post("/api/admin/logo/upload", requireAuth, (req, res) => {
    // Skip content-type validation for this endpoint
    (async () => {
      try {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } catch (error) {
        console.error("Error getting logo upload URL:", error);
        res.status(500).json({ error: "Failed to get upload URL for logo", details: error.message });
      }
    })();
  });

  // Update site logo setting
  app.post("/api/admin/logo/save", requireAuth, async (req, res) => {
    try {
      const { logoUrl } = req.body;
      if (!logoUrl) {
        return res.status(400).json({ message: "Logo URL is required" });
      }
      
      await storage.setAdminSetting("site_logo", logoUrl, "site", "Website logo");
      res.json({ message: "Logo updated successfully", logoUrl });
    } catch (error) {
      console.error("Failed to save logo setting:", error);
      res.status(500).json({ message: "Failed to save logo" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      console.log("Serving object:", req.path);
      console.log("PRIVATE_OBJECT_DIR:", process.env.PRIVATE_OBJECT_DIR);
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      console.log("Object file found, streaming to response");
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found", path: req.path });
      }
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

  // Serve public assets
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // =========================== SITE STATISTICS API ===========================
  
  // Get all site statistics with production protection
  app.get("/api/site-statistics", productionProtectionMiddleware("fetch site statistics"), async (req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT key, value, label, category, format_type 
        FROM site_statistics 
        ORDER BY category, key
      `);
      
      // Handle different result formats from different database drivers
      const rows = Array.isArray(result) ? result : (result.rows || []);
      
      // Add environment context for debugging (non-sensitive info only)
      const env = ProductionProtection.getEnvironmentInfo();
      res.setHeader('X-Environment', env.isProduction ? 'production' : 'development');
      
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch site statistics:', error);
      res.status(500).json({ error: 'Failed to fetch site statistics' });
    }
  });

  // Update site statistics (admin only) with audit logging
  app.put("/api/admin/site-statistics/:key", productionProtectionMiddleware("update site statistics"), async (req, res) => {
    try {
      const { key } = req.params;
      const { value, label } = req.body;
      const env = ProductionProtection.getEnvironmentInfo();
      
      // Log the update for audit trail
      console.log(`📊 Statistics update: ${key} = "${value}" in ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      
      const result = await db.execute(sql`
        UPDATE site_statistics 
        SET value = ${value}, label = ${label || null}, updated_at = NOW() 
        WHERE key = ${key} 
        RETURNING *
      `);
      
      // Handle different result formats from different database drivers
      const rows = Array.isArray(result) ? result : (result.rows || []);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Statistic not found' });
      }
      
      // Broadcast real-time update
      broadcastUpdate('statistic-updated', { key, value, label, environment: env.isProduction ? 'production' : 'development' });
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Failed to update site statistic:', error);
      res.status(500).json({ error: 'Failed to update site statistic' });
    }
  });

  // =========================== CUSTOM FIELDS API ===========================
  
  // Get all custom field definitions
  app.get("/api/admin/custom-fields", async (req, res) => {
    try {
      // For now, return empty array since we're storing in localStorage
      // In production, this would query a database table for custom field definitions
      res.json([]);
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      res.status(500).json({ error: 'Failed to fetch custom fields' });
    }
  });

  // Create custom field definition
  app.post("/api/admin/custom-fields", async (req, res) => {
    try {
      const customField = req.body;
      // For now, just return success since we're handling persistence client-side
      // In production, this would save to a database table
      res.json({ success: true, field: customField });
    } catch (error) {
      console.error('Failed to create custom field:', error);
      res.status(500).json({ error: 'Failed to create custom field' });
    }
  });

  // Update custom field definition
  app.put("/api/admin/custom-fields/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customField = req.body;
      // For now, just return success since we're handling persistence client-side
      // In production, this would update a database table
      res.json({ success: true, field: customField });
    } catch (error) {
      console.error('Failed to update custom field:', error);
      res.status(500).json({ error: 'Failed to update custom field' });
    }
  });

  // Delete custom field definition
  app.delete("/api/admin/custom-fields/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // For now, just return success since we're handling persistence client-side
      // In production, this would delete from a database table
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      res.status(500).json({ error: 'Failed to delete custom field' });
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

  // =========================== PRODUCTION PROTECTION API ===========================
  
  // Get environment and protection status (admin only)
  app.get("/api/admin/environment-status", async (req, res) => {
    try {
      const env = ProductionProtection.getEnvironmentInfo();
      const statsStatus = await getStatisticsStatus();
      
      res.json({
        environment: {
          type: env.isProduction ? 'production' : 'development',
          nodeEnv: env.nodeEnv,
          isReplitDeployment: env.isReplitDeployment,
          hostname: env.hostname,
          deploymentId: env.deploymentId
        },
        protection: {
          seedingBlocked: env.isProduction,
          dataProtected: env.isProduction,
          statisticsProtected: env.isProduction
        },
        statistics: statsStatus
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Manual statistics initialization (production-safe)
  app.post('/api/admin/initialize-statistics', requireSessionAuth, async (req, res) => {
    try {
      const { initializeSiteStatistics } = await import("./seed-statistics");
      const result = await initializeSiteStatistics();
      
      console.log(`📊 Manual statistics initialization: ${result.message}`);
      res.json({
        success: result.success,
        message: result.message,
        environment: result.environment,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error initializing statistics:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to initialize statistics",
        details: error.message 
      });
    }
  });

  // =========================== INITIALIZATION ===========================
  
  // Initialize site statistics with production protection
  try {
    const { initializeSiteStatistics } = await import("./seed-statistics");
    const statsResult = await initializeSiteStatistics();
    console.log(`📊 Statistics initialization: ${statsResult.message}`);
  } catch (error) {
    console.error("Failed to initialize statistics:", error);
  }

  const httpServer = createServer(app);
  return httpServer;
}
