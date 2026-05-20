import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import type {
  ConnectedChannelProvider,
  MessageDeliveryStatus,
  MessageRole,
} from "@tugobo/shared";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  /** External provider message ID (Twilio SID, Meta message ID) */
  externalMessageId: text("external_message_id"),
  senderType: text("sender_type").$type<MessageRole>().notNull().default("guest"),
  provider: text("provider").$type<ConnectedChannelProvider>(),
  deliveryStatus: text("delivery_status")
    .$type<MessageDeliveryStatus>()
    .notNull()
    .default("sent"),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  humanOverride: boolean("human_override").notNull().default(false),
  /** AI metadata: model used, tokens, latency, agent that produced this */
  aiMeta: jsonb("ai_meta").$type<{
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    agentName?: string;
    runId?: string;
    provider?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
