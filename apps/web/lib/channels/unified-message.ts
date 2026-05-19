import type { PanelChannelType } from "@tugobo/shared";
import type { MessageSender } from "./types";

/**
 * Channel-agnostic message shape for ingestion → runtime → operator UI.
 * Provider adapters normalize into this before persistence.
 */
export type UnifiedChannelMessage = {
  externalId: string;
  channel: PanelChannelType;
  hotelId: string;
  conversationId?: string;
  sessionId?: string;
  guestName: string;
  guestPhone?: string;
  language?: string;
  role: MessageSender;
  body: string;
  timestamp: string;
  deliveryStatus: "pending" | "sent" | "delivered" | "read" | "failed";
  aiGenerated?: boolean;
  humanOverride?: boolean;
  attachments?: Array<{ url: string; mimeType?: string }>;
};

export type UnifiedOutboundMessage = {
  conversationId: string;
  body: string;
  role: "ai" | "staff";
  humanOverride?: boolean;
};
