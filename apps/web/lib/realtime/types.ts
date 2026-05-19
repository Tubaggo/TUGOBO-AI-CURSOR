export type RealtimeTable = "messages" | "conversations";

export type RealtimePayload<T extends Record<string, unknown>> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
};

export type ConversationRealtimeHandlers = {
  onMessage?: (payload: RealtimePayload<{ id: string; conversation_id: string }>) => void;
  onConversation?: (payload: RealtimePayload<{ id: string }>) => void;
};
