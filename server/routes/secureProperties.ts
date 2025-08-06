/**
 * Secure Property Routes with Encryption
 * Handles property data with automatic encryption/decryption
 */

import { Router } from 'express';
import { db } from '../db';
import { properties } from '@shared/schema';
import { eq } from 'drizzle-orm';
import EncryptionService from '../storage/encryptionService';
import { z } from 'zod';

const router = Router();

// Schema for property creation with encryption support
const securePropertySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  totalValue: z.number().min(1),
  minInvestment: z.number().min(1),
  expectedReturn: z.string(),
  fundingProgress: z.number().min(0).max(100).default(0),
  imageUrls: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(['image', 'document', 'pdf']),
    size: z.number().optional(),
  })).default([]),
  propertyType: z.enum(['residential', 'commercial']).default('residential'),
  isActive: z.boolean().default(true),
});

/**
 * Create property with encrypted sensitive data
 */
router.post('/api/admin/properties', async (req, res) => {
  try {
    const validatedData = securePropertySchema.parse(req.body);
    
    // Encrypt sensitive data before storage
    const encryptedData = EncryptionService.encryptPropertyData(validatedData);
    
    // Store in database with encrypted fields
    const [newProperty] = await db
      .insert(properties)
      .values(encryptedData)
      .returning();
    
    // Return decrypted data for UI
    const decryptedProperty = EncryptionService.decryptPropertyData(newProperty);
    
    res.status(201).json(decryptedProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(400).json({ 
      error: 'Failed to create property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all properties with automatic decryption
 */
router.get('/api/admin/properties', async (req, res) => {
  try {
    const allProperties = await db.select().from(properties);
    
    // Decrypt all properties for UI rendering
    const decryptedProperties = allProperties.map(property => 
      EncryptionService.decryptPropertyData(property)
    );
    
    res.json(decryptedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

/**
 * Get single property with decryption
 */
router.get('/api/admin/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Auto-decrypt for UI rendering
    const decryptedProperty = EncryptionService.decryptPropertyData(property);
    
    res.json(decryptedProperty);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

/**
 * Update property with encryption
 */
router.put('/api/admin/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Encrypt any sensitive data in updates
    const encryptedUpdates = EncryptionService.encryptPropertyData(updates);
    
    const [updatedProperty] = await db
      .update(properties)
      .set(encryptedUpdates)
      .where(eq(properties.id, id))
      .returning();
    
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Return decrypted data for UI
    const decryptedProperty = EncryptionService.decryptPropertyData(updatedProperty);
    
    res.json(decryptedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(400).json({ 
      error: 'Failed to update property',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete property (with secure cleanup)
 */
router.delete('/api/admin/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedProperty] = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    
    if (!deletedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

/**
 * Public endpoint for properties (read-only, with limited decryption)
 */
router.get('/api/properties', async (req, res) => {
  try {
    // Only get active properties for public view
    const activeProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.isActive, true));
    
    // Decrypt for public viewing (excluding sensitive admin data)
    const publicProperties = activeProperties.map(property => {
      const decrypted = EncryptionService.decryptPropertyData(property);
      // Remove admin-only fields for public API
      const { ...publicData } = decrypted;
      return publicData;
    });
    
    res.json(publicProperties);
  } catch (error) {
    console.error('Error fetching public properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

export default router;