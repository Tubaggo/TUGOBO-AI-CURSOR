// ─── Domain enums ────────────────────────────────────────────────────────────

export type HotelWorkspaceStatus = "active" | "inactive" | "trial" | "archived";

export type HotelWorkspacePlan = "starter" | "growth" | "enterprise";

export type ConnectedChannelProvider =
  | "manychat"
  | "whatsapp_cloud"
  | "instagram"
  | "web_chat"
  | "whatsapp_twilio"
  | "whatsapp_meta";

export type ConnectedChannelType =
  | "whatsapp"
  | "instagram"
  | "web_chat"
  | "manual";

export type ConnectedChannelStatus =
  | "draft"
  | "connected"
  | "disconnected"
  | "error";

export type ChannelType = ConnectedChannelProvider;

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
  externalMessageId: string;
  provider: ConnectedChannelProvider;
  channelType: ConnectedChannelType;
  fromPhone: string;
  toPhone: string;
  content: string;
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
  hotelSlug?: string;
  hotelStatus?: HotelWorkspaceStatus;
  hotelPlan?: HotelWorkspacePlan;
  locale: string;
  timezone: string;
  businessHours: BusinessHours;
  persona: string;
}

export interface BusinessHours {
  /** key: 0=Sun … 6=Sat, value: "HH:MM-HH:MM" or null for closed */
  [day: number]: string | null;
}
