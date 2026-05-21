"use client";

import { isLiveConversationId } from "@/lib/conversation/live-sync";
import type { LiveMessage } from "@/lib/conversation/models";
import { isLiveOpsClientEnabled } from "./config";

type OperatorMessageResult = {
  ok: boolean;
  message?: LiveMessage;
};

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

  async function postOperatorMessage(conversationId: string, body: string): Promise<OperatorMessageResult> {
    if (!enabled || !isLiveConversationId(conversationId)) return { ok: false };
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) return { ok: false };

    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      message?: LiveMessage;
    } | null;

    return {
      ok: Boolean(data?.ok),
      message: data?.message,
    };
  }

  return {
    enabled,
    isLiveId: isLiveConversationId,
    postTakeover,
    postOperatorMessage,
  };
}
