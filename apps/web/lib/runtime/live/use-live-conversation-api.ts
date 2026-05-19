"use client";

import { isLiveConversationId } from "@/lib/conversation/live-sync";
import { isLiveOpsClientEnabled } from "./config";

export function useLiveConversationApi() {
  const enabled = isLiveOpsClientEnabled();

  async function postTakeover(conversationId: string, action: "takeover" | "release_to_ai") {
    if (!enabled || !isLiveConversationId(conversationId)) return false;
    const res = await fetch(`/api/conversations/${conversationId}/takeover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    return res.ok;
  }

  async function postOperatorMessage(conversationId: string, body: string) {
    if (!enabled || !isLiveConversationId(conversationId)) return false;
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    return res.ok;
  }

  return {
    enabled,
    isLiveId: isLiveConversationId,
    postTakeover,
    postOperatorMessage,
  };
}
