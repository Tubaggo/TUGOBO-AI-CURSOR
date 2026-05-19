import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import type { UserRole } from "@tugobo/shared";

export const operators = pgTable("operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  /** Supabase auth user id */
  authUserId: uuid("auth_user_id"),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role").$type<UserRole>().notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
