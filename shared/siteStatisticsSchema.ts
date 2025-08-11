import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const siteStatistics = pgTable("site_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  category: text("category").notNull().default("statistics"),
  formatType: text("format_type").default("number"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSiteStatisticSchema = createInsertSchema(siteStatistics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SiteStatistic = typeof siteStatistics.$inferSelect;
export type InsertSiteStatistic = typeof siteStatistics.$inferInsert;