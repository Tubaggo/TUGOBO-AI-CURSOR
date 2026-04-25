import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import type { ChannelType } from "@tugobo/shared";

export const channels = pgTable("channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  type: text("type").$type<ChannelType>().notNull(),
  phoneNumber: text("phone_number").notNull(),
  /** Provider-specific config: accountSid, authToken (encrypted later), etc. */
  config: jsonb("config").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
