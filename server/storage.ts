import { type Property, type InsertProperty, type Contact, type InsertContact, type AdminUser, type InsertAdminUser, type InsertAdminUserDB, type UpdateProperty, properties, contacts, adminUsers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: UpdateProperty): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  deleteContact(id: string): Promise<boolean>;
  
  // Admin Users
  createAdminUser(user: InsertAdminUserDB): Promise<AdminUser>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUsers(): Promise<AdminUser[]>;
}

export class DatabaseStorage implements IStorage {
  // Properties
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.isActive, true));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async updateProperty(id: string, updateProperty: UpdateProperty): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updateProperty)
      .where(eq(properties.id, id))
      .returning();
    return property || undefined;
  }

  async deleteProperty(id: string): Promise<boolean> {
    // Hard delete instead of soft delete for admin
    const result = await db.delete(properties).where(eq(properties.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contacts
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Admin Users
  async createAdminUser(insertAdminUser: InsertAdminUserDB): Promise<AdminUser> {
    const [adminUser] = await db
      .insert(adminUsers)
      .values(insertAdminUser)
      .returning();
    return adminUser;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [adminUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return adminUser || undefined;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }
}

export const storage = new DatabaseStorage();
