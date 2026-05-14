import {
  intelligenceChatWireSchema,
  type IntelligenceChatRequest,
  type IntelligenceChatWire,
} from "@tugobo/shared";

export async function fetchIntelligenceChat(
  messages: IntelligenceChatRequest["messages"],
  signal: AbortSignal
): Promise<{ ok: true; data: IntelligenceChatWire } | { ok: false }> {
  let json: unknown;
  try {
    const res = await fetch("/api/intelligence/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages } satisfies IntelligenceChatRequest),
      signal,
    });
    json = await res.json();
  } catch {
    return { ok: false };
  }
  const parsed = intelligenceChatWireSchema.safeParse(json);
  if (!parsed.success) return { ok: false };
  return { ok: true, data: parsed.data };
}
