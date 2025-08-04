import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  totalValue: integer("total_value").notNull(), // in rupees
  minInvestment: integer("min_investment").notNull(), // in rupees
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(), // percentage

  fundingProgress: integer("funding_progress").notNull().default(0), // percentage 0-100
  imageUrl: text("image_url").notNull(),
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

export const updatePropertySchema = createInsertSchema(properties).omit({
  id: true,
}).partial();

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
