/** UI / panel channel identifiers (distinct from provider ChannelType). */
export type PanelChannelType = "web_chat" | "whatsapp" | "instagram" | "manual";

export type MessageRole = "guest" | "ai" | "staff" | "system";

export type MessageDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type EscalationState =
  | "none"
  | "suggested"
  | "active"
  | "resolved";

export type ConversationReservationState =
  | "none"
  | "inquiry"
  | "quoted"
  | "payment_pending"
  | "confirmed"
  | "cancelled";

export type ConversationPaymentState =
  | "none"
  | "pending"
  | "failed"
  | "completed";
