import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { hotels } from "./hotels";
import type {
  ConnectedChannelProvider,
  ConnectedChannelStatus,
  ConnectedChannelType,
} from "@tugobo/shared";

export const connectedChannels = pgTable("connected_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  hotelId: uuid("hotel_id")
    .notNull()
    .references(() => hotels.id, { onDelete: "cascade" }),
  provider: text("provider").$type<ConnectedChannelProvider>().notNull(),
  channelType: text("channel_type").$type<ConnectedChannelType>().notNull(),
  status: text("status").$type<ConnectedChannelStatus>().notNull().default("connected"),
  secret: text("secret"),
  inboundSecret: text("inbound_secret"),
  outboundToken: text("outbound_token"),
  outboundUrl: text("outbound_url"),
  externalAccountId: text("external_account_id"),
  metadata: jsonb("metadata").notNull().default({}),
  externalAddress: text("external_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const channels = connectedChannels;

export type ConnectedChannel = typeof connectedChannels.$inferSelect;
export type NewConnectedChannel = typeof connectedChannels.$inferInsert;
export type Channel = ConnectedChannel;
export type NewChannel = NewConnectedChannel;
