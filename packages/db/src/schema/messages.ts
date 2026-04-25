import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import type { MessageDirection } from "@tugobo/shared";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  /** External provider message ID (Twilio SID, Meta message ID) */
  externalId: text("external_id"),
  direction: text("direction").$type<MessageDirection>().notNull(),
  body: text("body").notNull(),
  mediaUrl: text("media_url"),
  /** AI metadata: model used, tokens, latency, agent that produced this */
  aiMeta: jsonb("ai_meta").$type<{
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    agentName?: string;
    runId?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
