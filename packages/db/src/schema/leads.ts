import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Inbound demo / sales leads captured from the landing page modal.
 * No hotel_id — these are prospects, not yet tenants.
 */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  hotelName: text("hotel_name").notNull(),
  // Phone is PII. Store only in DB — never log or include in emails.
  phone: text("phone").notNull(),
  rooms: text("rooms"),
  source: text("source").notNull().default("landing_modal"),
  // Lifecycle: new → contacted → demo_scheduled → converted | lost
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
