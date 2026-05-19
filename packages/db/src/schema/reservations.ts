import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import { contacts } from "./contacts";
import { conversations } from "./conversations";
import type { ReservationStatus } from "@tugobo/shared";

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  status: text("status").$type<ReservationStatus>().notNull().default("pending_payment"),
  ref: text("ref"),
  roomType: text("room_type"),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  guestCount: integer("guest_count"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
  currency: text("currency").default("TRY"),
  timeline: jsonb("timeline")
    .$type<
      Array<{
        at: string;
        kind: string;
        label: string;
      }>
    >()
    .default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
