import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import { conversations } from "./conversations";
import { operators } from "./operators";
import type { EscalationState } from "@tugobo/shared";

export const escalations = pgTable("escalations", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  state: text("state").$type<EscalationState>().notNull().default("active"),
  reason: text("reason"),
  assigneeId: uuid("assignee_id").references(() => operators.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Escalation = typeof escalations.$inferSelect;
export type NewEscalation = typeof escalations.$inferInsert;
