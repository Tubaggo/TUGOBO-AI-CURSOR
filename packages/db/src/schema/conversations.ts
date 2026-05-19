import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import { contacts } from "./contacts";
import { channels } from "./channels";
import type {
  ConversationStatus,
  ConversationPaymentState,
  ConversationReservationState,
  EscalationState,
  PanelChannelType,
} from "@tugobo/shared";

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
  /** Panel-facing channel (web_chat, whatsapp, instagram) */
  panelChannel: text("panel_channel").$type<PanelChannelType>().notNull().default("web_chat"),
  externalSessionId: text("external_session_id"),
  unreadCount: integer("unread_count").notNull().default(0),
  escalationState: text("escalation_state")
    .$type<EscalationState>()
    .notNull()
    .default("none"),
  reservationState: text("reservation_state")
    .$type<ConversationReservationState>()
    .notNull()
    .default("none"),
  paymentState: text("payment_state")
    .$type<ConversationPaymentState>()
    .notNull()
    .default("none"),
  operatorJoinedAt: timestamp("operator_joined_at"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
