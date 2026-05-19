"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ConversationRealtimeHandlers, RealtimePayload } from "./types";

type Unsubscribe = () => void;

function mapPayload<T extends Record<string, unknown>>(
  record: { eventType: string; new: T; old: T }
): RealtimePayload<T> {
  return {
    eventType: record.eventType as RealtimePayload<T>["eventType"],
    new: record.new ?? null,
    old: record.old ?? null,
  };
}

export function subscribeHotelConversations(
  hotelId: string,
  handlers: ConversationRealtimeHandlers
): Unsubscribe {
  const supabase = createClient();
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel(`hotel-conversations:${hotelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `hotel_id=eq.${hotelId}`,
      },
      (payload) => {
        handlers.onConversation?.(
          mapPayload(
            payload as unknown as {
              eventType: string;
              new: { id: string };
              old: { id: string };
            }
          )
        );
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeConversationMessages(
  conversationId: string,
  handlers: Pick<ConversationRealtimeHandlers, "onMessage">
): Unsubscribe {
  const supabase = createClient();
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel(`conversation-messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        handlers.onMessage?.(
          mapPayload(
            payload as unknown as {
              eventType: string;
              new: { id: string; conversation_id: string };
              old: { id: string; conversation_id: string };
            }
          )
        );
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function isRealtimeAvailable(client: SupabaseClient | null): boolean {
  return client !== null;
}
