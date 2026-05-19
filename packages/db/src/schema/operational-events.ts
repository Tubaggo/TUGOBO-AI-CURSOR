import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import { conversations } from "./conversations";

export const operationalEvents = pgTable("operational_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "cascade",
  }),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type OperationalEvent = typeof operationalEvents.$inferSelect;
export type NewOperationalEvent = typeof operationalEvents.$inferInsert;
