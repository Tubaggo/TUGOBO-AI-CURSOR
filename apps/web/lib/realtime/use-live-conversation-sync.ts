"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveConversation, LiveMessage } from "@/lib/conversation/models";
import {
  liveConversationToOperation,
  liveMessageToOperation,
} from "@/lib/conversation/live-sync";
import { useOperationConversationStore } from "@/lib/stores/operation-conversation-store";
import { resolvePilotHotelIdClient } from "@/lib/runtime/live/config";
import {
  subscribeConversationMessages,
  subscribeHotelConversations,
} from "./subscribe";

type LiveOpsState = {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return res.json() as Promise<T>;
}

export function useLiveConversationSync(selectedId: string | null): LiveOpsState {
  const hotelId = resolvePilotHotelIdClient();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  const mergeLiveList = useCallback((items: LiveConversation[]) => {
    const store = useOperationConversationStore.getState();
    const liveIds = new Set(items.map((c) => c.id));
    const preserved = store.conversations.filter((c) => !liveIds.has(c.id));
    const merged = [
      ...items.map((live) => liveConversationToOperation(live)),
      ...preserved,
    ];
    useOperationConversationStore.setState({ conversations: merged });
  }, []);

  const appendLiveMessage = useCallback(
    async (conversationId: string) => {
      const data = await fetchJson<{ ok: boolean; messages?: LiveMessage[] }>(
        `/api/conversations/${conversationId}/messages`
      );
      if (!data.ok || !data.messages) return;

      useOperationConversationStore.setState((state) => ({
        conversations: state.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: data.messages!.map(liveMessageToOperation),
            lastMessage:
              data.messages![data.messages!.length - 1]?.content ?? c.lastMessage,
            lastActivityAt:
              data.messages![data.messages!.length - 1]?.timestamp ?? c.lastActivityAt,
          };
        }),
      }));
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!hotelId) {
      setEnabled(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJson<{
        ok: boolean;
        live?: boolean;
        conversations?: LiveConversation[];
      }>("/api/conversations");

      if (!data.ok || !data.live) {
        setEnabled(false);
        return;
      }

      setEnabled(true);
      mergeLiveList(data.conversations ?? []);

      const sel = selectedRef.current;
      if (sel && data.conversations?.some((c) => c.id === sel)) {
        await appendLiveMessage(sel);
        void fetch(`/api/conversations/${sel}/messages`, { method: "PATCH" });
      }
    } catch {
      setError("sync_failed");
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [appendLiveMessage, hotelId, mergeLiveList]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !hotelId) return;

    const unsubHotel = subscribeHotelConversations(hotelId, {
      onConversation: () => {
        void refresh();
      },
    });

    return unsubHotel;
  }, [enabled, hotelId, refresh]);

  useEffect(() => {
    if (!enabled || !selectedId) return;

    const unsub = subscribeConversationMessages(selectedId, {
      onMessage: () => {
        void appendLiveMessage(selectedId);
        useOperationConversationStore.setState((state) => ({
          pulsingConversationIds: { ...state.pulsingConversationIds, [selectedId]: true },
        }));
      },
    });

    void appendLiveMessage(selectedId);

    return unsub;
  }, [appendLiveMessage, enabled, selectedId]);

  return { enabled, loading, error, refresh };
}
