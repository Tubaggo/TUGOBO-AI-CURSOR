import twilio from "twilio";
import type { ChannelAdapter } from "./types";
import type { InboundMessage, OutboundMessage } from "@tugobo/shared";
import { logger } from "@tugobo/shared";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  hotelId: string;
  channelId: string;
}

export class WhatsAppTwilioAdapter implements ChannelAdapter {
  readonly name = "whatsapp_twilio";
  private client: ReturnType<typeof twilio>;

  constructor(private config: TwilioConfig) {
    this.client = twilio(config.accountSid, config.authToken);
  }

  async validateSignature(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<void> {
    const signature = headers["x-twilio-signature"];
    const url = headers["x-forwarded-url"] ?? headers["host"];

    if (!signature) {
      throw new Error("Missing X-Twilio-Signature header");
    }

    const params = Object.fromEntries(new URLSearchParams(rawBody));
    const isValid = twilio.validateRequest(
      this.config.authToken,
      signature,
      url,
      params
    );

    if (!isValid) {
      logger.warn("Twilio signature validation failed");
      throw new Error("Invalid Twilio webhook signature");
    }
  }

  async parseWebhook(
    payload: Record<string, unknown>
  ): Promise<InboundMessage | null> {
    // Twilio sends form-encoded data, already parsed into payload by the route handler
    if (payload["SmsStatus"] || payload["MessageStatus"]) {
      // Delivery receipt - not a message
      return null;
    }

    const messageSid = payload["MessageSid"] as string;
    const from = (payload["From"] as string)?.replace("whatsapp:", "");
    const to = (payload["To"] as string)?.replace("whatsapp:", "");
    const body = (payload["Body"] as string) ?? "";

    if (!messageSid || !from) return null;

    const numMedia = parseInt((payload["NumMedia"] as string) ?? "0", 10);
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = payload[`MediaUrl${i}`] as string;
      if (url) mediaUrls.push(url);
    }

    return {
      externalId: messageSid,
      channelType: "whatsapp_twilio",
      fromPhone: from,
      toPhone: to,
      body,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      timestamp: new Date(),
      hotelId: this.config.hotelId,
      channelId: this.config.channelId,
    };
  }

  async send(message: OutboundMessage): Promise<{ externalId: string }> {
    const result = await this.client.messages.create({
      from: `whatsapp:${this.config.fromNumber}`,
      to: `whatsapp:${message.toPhone}`,
      body: message.body,
      ...(message.mediaUrl ? { mediaUrl: [message.mediaUrl] } : {}),
    });

    logger.info("Twilio message sent", { sid: result.sid });
    return { externalId: result.sid };
  }
}
