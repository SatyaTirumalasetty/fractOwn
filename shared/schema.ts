import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean } from "drizzle-orm/pg-core";
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
  rentalYield: decimal("rental_yield", { precision: 5, scale: 2 }).notNull(), // percentage
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
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
