import type { InboundMessage } from "@tugobo/shared";
import type { ChannelAdapter } from "./types";

export type WebChatAdapterConfig = {
  hotelId: string;
  channelId: string;
};

/**
 * Web chat channel adapter — normalizes panel/API payloads for the conversation runtime.
 * Outbound delivery is handled by the web panel (not a third-party API).
 */
export class WebChatAdapter implements ChannelAdapter {
  readonly name = "web_chat";

  constructor(private readonly config: WebChatAdapterConfig) {}

  async parseWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ): Promise<InboundMessage | null> {
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    const sessionId =
      typeof payload.sessionId === "string" ? payload.sessionId : undefined;
    if (!body || !sessionId) return null;

    return {
      externalId: `web-${sessionId}-${Date.now()}`,
      channelType: "whatsapp_twilio",
      fromPhone: `session:${sessionId}`,
      toPhone: `web@${this.config.hotelId.slice(0, 8)}`,
      body,
      timestamp: new Date(),
      hotelId: this.config.hotelId,
      channelId: this.config.channelId,
    };
  }

  async validateSignature(): Promise<void> {
    /* Web chat uses same-origin / signed session tokens in production */
  }

  async send(): Promise<{ externalId: string }> {
    return { externalId: `web-out-${Date.now()}` };
  }
}
