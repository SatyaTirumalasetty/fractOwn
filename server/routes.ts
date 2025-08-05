import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertPropertySchema, updatePropertySchema, insertAdminUserSchema, properties } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "./db";

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

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
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
      
      const adminUser = await storage.getAdminUserByUsername(username);
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password hash
      const { passwordHash: _, ...safeUser } = adminUser;
      res.json({ user: safeUser, message: "Login successful" });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get all admin users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      // Don't return password hashes
      const safeUsers = adminUsers.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
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
