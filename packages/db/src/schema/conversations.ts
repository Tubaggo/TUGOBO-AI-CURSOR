import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import { contacts } from "./contacts";
import { channels } from "./channels";
import type { ConversationStatus } from "@tugobo/shared";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id),
  channelId: uuid("channel_id")
    .notNull()
    .references(() => channels.id),
  status: text("status")
    .$type<ConversationStatus>()
    .notNull()
    .default("ai_active"),
  assigneeId: uuid("assignee_id"),
  aiPaused: boolean("ai_paused").notNull().default(false),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
