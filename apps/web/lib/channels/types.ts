export type ChannelType = "web_chat" | "whatsapp" | "instagram" | "manual";

export type ConversationStage =
  | "new_inquiry"
  | "qualified"
  | "offer_sent"
  | "payment_pending"
  | "payment_problem"
  | "confirmed"
  | "human_review";

export type MessageSender = "guest" | "ai" | "staff" | "system";

export type OperationPriority = "low" | "medium" | "high";

export type AiStatus = "idle" | "checking" | "replying" | "waiting_staff";

export type OperationMessageMeta = {
  aiGenerated?: boolean;
  takeoverSuggested?: boolean;
  reservationValue?: number;
  paymentLinkSent?: boolean;
  roomSuggestion?: string;
  operationalEvent?: string;
  deliveryStatus?: "pending" | "sent" | "mock_sent" | "delivered" | "read" | "failed";
  externalMessageId?: string;
};

export type OperationMessage = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  timestamp: string;
  channel?: ChannelType;
  meta?: OperationMessageMeta;
};

export type OperationConversation = {
  id: string;
  hotelId?: string;
  guestName: string;
  channel: ChannelType;
  provider?:
    | "manychat"
    | "whatsapp_cloud"
    | "instagram"
    | "web_chat"
    | "whatsapp_twilio"
    | "whatsapp_meta";
  stage: ConversationStage;
  statusLabel: string;
  lastMessage: string;
  lastActivityAt: string;
  bookingValue?: number;
  priority: OperationPriority;
  requiresHuman: boolean;
  aiStatus?: AiStatus;
  unreadCount?: number;
  messages: OperationMessage[];
  externalId?: string;
  guestPhone?: string;
  language?: string;
};

export type ChannelFilter =
  | "all"
  | "web_chat"
  | "whatsapp"
  | "instagram"
  | "human_support";

export type IngestChannelMessageInput = {
  hotelId?: string;
  channel: ChannelType;
  provider?:
    | "manychat"
    | "whatsapp_cloud"
    | "instagram"
    | "web_chat"
    | "whatsapp_twilio"
    | "whatsapp_meta";
  guestName: string;
  message: string;
  externalId?: string;
  conversationId?: string;
  guestPhone?: string;
  language?: string;
  unreadCount?: number;
  skipLocalAi?: boolean;
};

export type SimulatedAiResult = {
  replyText: string;
  stage: ConversationStage;
  statusLabel: string;
  suggestedAction: string;
  requiresHuman: boolean;
  aiStatus: AiStatus;
  operationalEvents: string[];
  bookingValue?: number;
  paymentLinkSent?: boolean;
  roomSuggestion?: string;
};
