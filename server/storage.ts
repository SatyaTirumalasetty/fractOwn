import {
  Property,
  properties,
  contacts,
  adminUsers,
  adminSettings,
  adminSessions,
  adminPasswordResetOtps,
  users,
  type InsertProperty,
  type InsertContact,
  type Contact,
  type AdminUser,
  type User,
  type InsertUser,
  type UpdateProperty,
  type InsertAdminPasswordResetOtp,
  type AdminPasswordResetOtp
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";

export interface IStorage {
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: UpdateProperty): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Contact operations
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: string): Promise<boolean>;
  
  // Admin operations
  getAdminUsers(): Promise<AdminUser[]>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  
  // Admin settings operations
  getAdminSetting(key: string): Promise<string | null>;
  setAdminSetting(key: string, value: string, category?: string, description?: string): Promise<void>;
  getAdminSettingsByCategory(category: string): Promise<Array<{key: string, value: string, description?: string}>>;
  
  // Session operations
  createAdminSession(adminId: string, sessionToken: string, expiresAt: Date): Promise<void>;
  validateAdminSession(sessionToken: string): Promise<string | null>; // returns adminId if valid
  deleteAdminSession(sessionToken: string): Promise<void>;
  
  // Password reset operations
  createPasswordResetOtp(adminId: string, phoneNumber: string, otp: string, expiresAt: Date): Promise<void>;
  validatePasswordResetOtp(phoneNumber: string, otp: string): Promise<string | null>; // returns adminId if valid
  markPasswordResetOtpAsUsed(phoneNumber: string, otp: string): Promise<void>;
  updateAdminPassword(adminId: string, passwordHash: string): Promise<void>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Property operations
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
  async createAdminUser(insertAdminUser: any): Promise<AdminUser> {
    const [adminUser] = await db
      .insert(adminUsers)
      .values(insertAdminUser)
      .returning();
    return adminUser;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<string | null> {
    const [setting] = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.key, key));
    return setting?.value || null;
  }

  async setAdminSetting(key: string, value: string, category: string = "contact", description?: string): Promise<void> {
    await db.insert(adminSettings)
      .values({
        key,
        value,
        category,
        description,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: {
          value,
          category,
          description,
          updatedAt: new Date()
        }
      });
  }

  async getAdminSettingsByCategory(category: string): Promise<Array<{key: string, value: string, description?: string}>> {
    const settings = await db.select({
      key: adminSettings.key,
      value: adminSettings.value,
      description: adminSettings.description
    })
    .from(adminSettings)
    .where(eq(adminSettings.category, category));
    
    return settings.map(setting => ({
      key: setting.key,
      value: setting.value,
      description: setting.description || undefined
    }));
  }

  // Session operations
  async createAdminSession(adminId: string, sessionToken: string, expiresAt: Date): Promise<void> {
    await db.insert(adminSessions).values({
      adminId,
      sessionToken,
      expiresAt
    });
  }

  async validateAdminSession(sessionToken: string): Promise<string | null> {
    const [session] = await db.select()
      .from(adminSessions)
      .where(and(
        eq(adminSessions.sessionToken, sessionToken),
        gt(adminSessions.expiresAt, new Date())
      ));
    return session?.adminId || null;
  }

  async deleteAdminSession(sessionToken: string): Promise<void> {
    await db.delete(adminSessions)
      .where(eq(adminSessions.sessionToken, sessionToken));
  }

  // Password reset operations
  async createPasswordResetOtp(adminId: string, phoneNumber: string, otp: string, expiresAt: Date): Promise<void> {
    await db.insert(adminPasswordResetOtps).values({
      adminId,
      phoneNumber,
      otp,
      expiresAt
    });
  }

  async validatePasswordResetOtp(phoneNumber: string, otp: string): Promise<string | null> {
    const [otpRecord] = await db.select()
      .from(adminPasswordResetOtps)
      .where(and(
        eq(adminPasswordResetOtps.phoneNumber, phoneNumber),
        eq(adminPasswordResetOtps.otp, otp),
        eq(adminPasswordResetOtps.isUsed, false),
        gt(adminPasswordResetOtps.expiresAt, new Date())
      ));
    return otpRecord?.adminId || null;
  }

  async markPasswordResetOtpAsUsed(phoneNumber: string, otp: string): Promise<void> {
    await db.update(adminPasswordResetOtps)
      .set({ isUsed: true })
      .where(and(
        eq(adminPasswordResetOtps.phoneNumber, phoneNumber),
        eq(adminPasswordResetOtps.otp, otp)
      ));
  }

  async updateAdminPassword(adminId: string, passwordHash: string): Promise<void> {
    await db.update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, adminId));
  }



  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
