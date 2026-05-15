/** Channel surface for guest threads (extend when wiring adapters). */
export const CONVERSATION_CHANNELS = ["whatsapp", "instagram", "web_chat"] as const;

export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

/** Operational pipeline state for the thread. */
export const CONVERSATION_STATUSES = [
  "ai_handling",
  "human_takeover",
  "awaiting_payment",
  "reservation_pending",
  "escalated",
] as const;

export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

/** Who is actively replying / in control. */
export const AI_HANDLING_STATES = ["ai_active", "human_active", "paused"] as const;

export type AiHandlingState = (typeof AI_HANDLING_STATES)[number];

export const MESSAGE_AUTHOR_TYPES = ["guest", "ai", "staff"] as const;

export type MessageAuthorType = (typeof MESSAGE_AUTHOR_TYPES)[number];

export const CONVERSATION_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type ConversationPriority = (typeof CONVERSATION_PRIORITIES)[number];

export type Message = {
  id: string;
  conversationId: string;
  authorType: MessageAuthorType;
  content: string;
  createdAt: string;
};

export type Guest = {
  id: string;
  name: string;
  language: string;
  nationality: string;
  tags: string[];
  returningGuest: boolean;
  totalStays: number;
  preferredRoom: string | null;
};

export type AIInsight = {
  confidence: number;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  escalationSuggested: boolean;
  upsellOpportunity: string | null;
  summary: string;
};

export type ReservationContext = {
  id: string | null;
  checkIn: string;
  checkOut: string;
  roomType: string;
  paymentStatus: "unpaid" | "deposit" | "paid" | "overdue";
  bookingValueEur: number;
  sourceChannel: ConversationChannel;
};

export type Conversation = {
  id: string;
  hotelId: string;
  guestId: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  aiState: AiHandlingState;
  assignedTo: string | null;
  unreadCount: number;
  priority: ConversationPriority;
  reservationId: string | null;
  lastMessageAt: string;
  /** Denormalized for inbox rows — mirrors last guest/AI/staff line. */
  lastMessagePreview: string;
  escalationFlag: boolean;
  guest: Guest;
  messages: Message[];
  aiInsight: AIInsight;
  reservation: ReservationContext;
};

/** Inbox row — stable for future Supabase `select` projections. */
export type ConversationSummary = Pick<
  Conversation,
  | "id"
  | "hotelId"
  | "guestId"
  | "channel"
  | "status"
  | "aiState"
  | "assignedTo"
  | "unreadCount"
  | "priority"
  | "reservationId"
  | "lastMessageAt"
  | "lastMessagePreview"
  | "escalationFlag"
> & {
  guestName: string;
};

export type SendMessageInput = {
  conversationId: string;
  authorType: MessageAuthorType;
  content: string;
};

export type AssignConversationInput = {
  conversationId: string;
  staffName: string | null;
};

export type EscalateConversationInput = {
  conversationId: string;
  reason: string;
};
