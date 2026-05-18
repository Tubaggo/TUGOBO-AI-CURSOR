"use client";

import { ingestChannelMessage } from "@/lib/stores/operation-conversation-store";

const WEB_CHAT_EXTERNAL_KEY = "tugobo-web-chat-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "web-chat-anon";
  const existing = sessionStorage.getItem(WEB_CHAT_EXTERNAL_KEY);
  if (existing) return existing;
  const id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem(WEB_CHAT_EXTERNAL_KEY, id);
  return id;
}

export function bridgeWebChatToPanel(message: string, guestName = "Web Chat Misafiri"): string {
  return ingestChannelMessage({
    channel: "web_chat",
    guestName,
    message,
    externalId: getOrCreateSessionId(),
    language: "TR",
  });
}
