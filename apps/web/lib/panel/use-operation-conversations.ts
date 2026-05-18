"use client";

import { useMemo } from "react";
import type { Conversation } from "@/app/dashboard/_components/mock-data";
import type { ChatMsg, ChatThread } from "@/app/dashboard/_components/chat-threads";
import {
  operationMessageToChatMsg,
  operationToPanelConversation,
} from "@/lib/channels/panel-bridge";
import type { ChannelFilter } from "@/lib/channels/types";
import { useOperationConversationStore } from "@/lib/stores/operation-conversation-store";

export function useOperationConversationsPanel() {
  const conversations = useOperationConversationStore((s) => s.conversations);
  const channelFilter = useOperationConversationStore((s) => s.channelFilter);
  const pulsingIds = useOperationConversationStore((s) => s.pulsingConversationIds);
  const setChannelFilter = useOperationConversationStore((s) => s.setChannelFilter);
  const selectConversation = useOperationConversationStore((s) => s.selectConversation);
  const clearPulse = useOperationConversationStore((s) => s.clearPulse);

  const panelConversations = useMemo(
    () => conversations.map(operationToPanelConversation),
    [conversations]
  );

  const threadsById = useMemo(() => {
    const out: Record<string, ChatThread> = {};
    for (const op of conversations) {
      out[op.id] = {
        messages: op.messages.map(operationMessageToChatMsg),
        aiTyping: op.aiStatus === "checking" || op.aiStatus === "replying",
      };
    }
    return out;
  }, [conversations]);

  const filteredByChannel = useMemo(() => {
    return (list: Conversation[]) =>
      list.filter((c) => {
        if (channelFilter === "all") return true;
        if (channelFilter === "human_support") {
          const op = conversations.find((o) => o.id === c.id);
          return op?.requiresHuman ?? c.status === "human_takeover";
        }
        const op = conversations.find((o) => o.id === c.id);
        if (!op) {
          if (channelFilter === "web_chat") return c.channel === "web";
          if (channelFilter === "whatsapp") return c.channel === "whatsapp" || !c.channel;
          if (channelFilter === "instagram") return c.channel === "instagram";
          return false;
        }
        return op.channel === channelFilter;
      });
  }, [channelFilter, conversations]);

  function messagesForOperationConv(convId: string): ChatMsg[] {
    const op = conversations.find((c) => c.id === convId);
    if (!op) return [];
    return op.messages.map(operationMessageToChatMsg);
  }

  function getOperationSummary(convId: string) {
    return conversations.find((c) => c.id === convId);
  }

  function isPulsing(convId: string): boolean {
    return convId in pulsingIds;
  }

  return {
    panelConversations,
    threadsById,
    channelFilter,
    setChannelFilter: setChannelFilter as (f: ChannelFilter) => void,
    selectConversation,
    clearPulse,
    filteredByChannel,
    messagesForOperationConv,
    getOperationSummary,
    isPulsing,
    rawConversations: conversations,
  };
}
