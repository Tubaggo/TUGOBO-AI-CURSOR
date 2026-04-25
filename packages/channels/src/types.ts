import type { InboundMessage, OutboundMessage } from "@tugobo/shared";

/**
 * Every channel adapter must implement this interface.
 * Swap Twilio for Meta (or any future channel) without touching agent code.
 */
export interface ChannelAdapter {
  /** Human-readable name for logs */
  readonly name: string;

  /**
   * Parse a raw webhook payload into a normalised InboundMessage.
   * Returns null if the payload is not a message (e.g. delivery receipt).
   */
  parseWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<InboundMessage | null>;

  /**
   * Validate webhook authenticity.
   * Throws if invalid.
   */
  validateSignature(
    rawBody: string,
    headers: Record<string, string>
  ): Promise<void>;

  /**
   * Send a message out via this channel.
   */
  send(message: OutboundMessage): Promise<{ externalId: string }>;
}
