import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  totalValue: bigint("total_value", { mode: "number" }).notNull(), // in rupees
  minInvestment: bigint("min_investment", { mode: "number" }).notNull(), // in rupees
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }), // percentage - nullable

  fundingProgress: integer("funding_progress").notNull().default(0), // percentage 0-100
  imageUrls: text("image_urls").array().notNull().default(sql`ARRAY[]::text[]`),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`), // Store file attachments with metadata
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`), // Dynamic property metadata fields
  propertyType: text("property_type").notNull(), // 'residential' | 'commercial'
  isActive: boolean("is_active").notNull().default(true),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  investmentAmount: text("investment_amount").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  phoneNumber: text("phone_number"), // Optional phone number for notifications
  countryCode: text("country_code").default("+91"), // Default to India
  totpSecret: text("totp_secret"), // For authenticator app
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  backupCodes: text("backup_codes").array(), // Emergency backup codes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin settings table for contact information and site configuration
export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., 'contact_phone', 'contact_email', 'support_hours'
  value: text("value").notNull(),
  category: text("category").notNull().default("contact"), // 'contact', 'site', 'business', 'statistics', 'content', 'homepage'
  description: text("description"), // Human-readable description
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Home page sections toggle configuration
export const homePageSections = pgTable("home_page_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionKey: text("section_key").notNull().unique(), // 'hero', 'properties', 'how_it_works', 'testimonials', 'about', 'risk_disclosure', 'contact'
  sectionName: text("section_name").notNull(), // Display name for admin UI
  isEnabled: boolean("is_enabled").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0), // For ordering sections
  description: text("description"), // Section description for admin reference
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin sessions table for persistent session management
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => adminUsers.id, { onDelete: "cascade" }).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin password reset OTP table
export const adminPasswordResetOtps = pgTable("admin_password_reset_otps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => adminUsers.id, { onDelete: "cascade" }).notNull(),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  countryCode: text("country_code").notNull(), // e.g., "+91"
  phoneNumber: text("phone_number").notNull().unique(),
  email: text("email"),
  isVerified: boolean("is_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User sessions table
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export const insertAdminPasswordResetOtpSchema = createInsertSchema(adminPasswordResetOtps).omit({
  id: true,
  createdAt: true,
});

export const insertHomePageSectionSchema = createInsertSchema(homePageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePropertySchema = createInsertSchema(properties).omit({
  id: true,
}).partial();

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertAdminUserDB = typeof adminUsers.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminPasswordResetOtp = z.infer<typeof insertAdminPasswordResetOtpSchema>;
export type AdminPasswordResetOtp = typeof adminPasswordResetOtps.$inferSelect;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type InsertHomePageSection = z.infer<typeof insertHomePageSectionSchema>;
export type HomePageSection = typeof homePageSections.$inferSelect;
