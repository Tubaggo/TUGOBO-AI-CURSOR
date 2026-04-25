import type { ChannelAdapter } from "./types";
import type { InboundMessage, OutboundMessage } from "@tugobo/shared";

/**
 * Meta WhatsApp Cloud API adapter.
 * Drop-in replacement for WhatsAppTwilioAdapter - week 2 swap.
 * TODO(Day 10): implement parseWebhook, validateSignature, send
 */
export class WhatsAppMetaAdapter implements ChannelAdapter {
  readonly name = "whatsapp_meta";

  constructor(
    private _config: {
      phoneNumberId: string;
      accessToken: string;
      verifyToken: string;
      hotelId: string;
      channelId: string;
    }
  ) {}

  async validateSignature(
    _rawBody: string,
    _headers: Record<string, string>
  ): Promise<void> {
    throw new Error("WhatsAppMetaAdapter not implemented yet (Day 10)");
  }

  async parseWebhook(
    _payload: Record<string, unknown>,
    _headers: Record<string, string>
  ): Promise<InboundMessage | null> {
    throw new Error("WhatsAppMetaAdapter not implemented yet (Day 10)");
  }

  async send(_message: OutboundMessage): Promise<{ externalId: string }> {
    throw new Error("WhatsAppMetaAdapter not implemented yet (Day 10)");
  }
}
