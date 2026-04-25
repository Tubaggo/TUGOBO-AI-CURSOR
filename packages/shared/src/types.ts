// ─── Domain enums ────────────────────────────────────────────────────────────

export type ChannelType = "whatsapp_twilio" | "whatsapp_meta";

export type MessageDirection = "inbound" | "outbound";

export type ConversationStatus =
  | "open"
  | "ai_active"
  | "human_takeover"
  | "resolved";

export type LeadStatus =
  | "new"
  | "qualified"
  | "quoted"
  | "confirmed"
  | "lost";

export type ReservationStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "refunded";

export type UserRole = "owner" | "staff";

// ─── Shared message contract (channel-agnostic) ───────────────────────────────

export interface InboundMessage {
  externalId: string;
  channelType: ChannelType;
  fromPhone: string;
  toPhone: string;
  body: string;
  mediaUrls?: string[];
  timestamp: Date;
  hotelId: string;
  channelId: string;
}

export interface OutboundMessage {
  toPhone: string;
  fromPhone: string;
  body: string;
  mediaUrl?: string;
}

// ─── Shared agent context ─────────────────────────────────────────────────────

export interface HotelContext {
  hotelId: string;
  hotelName: string;
  locale: string;
  timezone: string;
  businessHours: BusinessHours;
  persona: string;
}

export interface BusinessHours {
  /** key: 0=Sun … 6=Sat, value: "HH:MM-HH:MM" or null for closed */
  [day: number]: string | null;
}
