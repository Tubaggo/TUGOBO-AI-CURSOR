import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import type { BusinessHours } from "@tugobo/shared";

export const hotels = pgTable("hotels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  locale: text("locale").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  businessHours: jsonb("business_hours").$type<BusinessHours>(),
  persona: text("persona").notNull().default(
    "You are a helpful hotel concierge. Be warm, professional and concise."
  ),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
