"use client";

import { ingestChannelMessage } from "@/lib/stores/operation-conversation-store";
import { isLiveOpsClientEnabled } from "@/lib/runtime/live/config";

const WEB_CHAT_EXTERNAL_KEY = "tugobo-web-chat-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "web-chat-anon";
  const existing = sessionStorage.getItem(WEB_CHAT_EXTERNAL_KEY);
  if (existing) return existing;
  const id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem(WEB_CHAT_EXTERNAL_KEY, id);
  return id;
}

async function ingestViaLiveApi(
  message: string,
  guestName: string,
  sessionId: string
): Promise<string | null> {
  try {
    const res = await fetch("/api/conversations/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "web_chat",
        guestName,
        message,
        externalSessionId: sessionId,
        language: "TR",
      }),
    });
    const data = (await res.json()) as { ok?: boolean; conversationId?: string };
    if (data.ok && data.conversationId) return data.conversationId;
  } catch {
    /* fall through to local ingest */
  }
  return null;
}

export function bridgeWebChatToPanel(message: string, guestName = "Web Chat Misafiri"): string {
  const sessionId = getOrCreateSessionId();

  if (isLiveOpsClientEnabled()) {
    void ingestViaLiveApi(message, guestName, sessionId);
  }

  return ingestChannelMessage({
    channel: "web_chat",
    guestName,
    message,
    externalId: sessionId,
    language: "TR",
  });
}
