import { ManychatOutboundAdapter, type OutboundDeliveryResult } from "@tugobo/channels";
import { logger } from "@tugobo/shared";
import { z } from "zod";
import { MANYCHAT_LOCAL_TEST_HOTEL_ID, MANYCHAT_LOCAL_TEST_SECRET } from "./manychat";

export const MANYCHAT_OUTBOUND_PROVIDER = "manychat" as const;

const manychatOutboundSchema = z.object({
  hotel_id: z.string().trim().min(1).max(120),
  conversation_id: z.string().trim().min(1).max(200),
  external_user_id: z.string().trim().min(1).max(200),
  channel: z.enum(["instagram", "whatsapp"]),
  message: z.string().trim().min(1).max(4000),
  secret: z.string().trim().min(1).max(255).optional(),
  internal_auth_token: z.string().trim().min(1).max(255).optional(),
  provider_metadata: z.record(z.unknown()).optional(),
});

export type NormalizedManychatOutboundMessage = {
  hotelId: string;
  conversationId: string;
  externalUserId: string;
  channel: "instagram" | "whatsapp";
  message: string;
  secret?: string;
  internalAuthToken?: string;
  providerMetadata?: Record<string, unknown>;
};

type ParseSuccess = {
  ok: true;
  data: NormalizedManychatOutboundMessage;
};

type ParseFailure = {
  ok: false;
  error: "invalid_body";
  message: string;
};

export type ManychatOutboundParseResult = ParseSuccess | ParseFailure;

type ManychatOutboundMetadata = {
  outboundApiUrl?: unknown;
  outboundApiToken?: unknown;
  apiUrl?: unknown;
  apiToken?: unknown;
};

function stringValue(input: unknown): string | undefined {
  return typeof input === "string" && input.trim().length > 0 ? input.trim() : undefined;
}

function metadataConfig(metadata: Record<string, unknown> | undefined) {
  const values = (metadata ?? {}) as ManychatOutboundMetadata;
  return {
    apiUrl: stringValue(values.outboundApiUrl) ?? stringValue(values.apiUrl),
    apiToken: stringValue(values.outboundApiToken) ?? stringValue(values.apiToken),
  };
}

export function parseManychatOutboundPayload(body: unknown): ManychatOutboundParseResult {
  const parsed = manychatOutboundSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_body",
      message: "Payload validation failed.",
    };
  }

  return {
    ok: true,
    data: {
      hotelId: parsed.data.hotel_id,
      conversationId: parsed.data.conversation_id,
      externalUserId: parsed.data.external_user_id,
      channel: parsed.data.channel,
      message: parsed.data.message,
      secret: parsed.data.secret,
      internalAuthToken: parsed.data.internal_auth_token,
      providerMetadata: parsed.data.provider_metadata,
    },
  };
}

export function isManychatLocalDevOutboundPayload(payload: NormalizedManychatOutboundMessage): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    payload.hotelId === MANYCHAT_LOCAL_TEST_HOTEL_ID
  );
}

export function isValidManychatInternalToken(token: string | undefined): boolean {
  const expected =
    process.env.MANYCHAT_OUTBOUND_INTERNAL_TOKEN?.trim() ||
    process.env.TUGOBO_INTERNAL_API_TOKEN?.trim();

  return Boolean(expected && token && token === expected);
}

export async function sendManychatOutboundMessage(
  payload: NormalizedManychatOutboundMessage
): Promise<OutboundDeliveryResult> {
  const envApiUrl = process.env.MANYCHAT_OUTBOUND_API_URL?.trim();
  const envApiToken =
    process.env.MANYCHAT_OUTBOUND_API_TOKEN?.trim() ||
    process.env.MANYCHAT_API_TOKEN?.trim();
  const configuredMetadata = metadataConfig(payload.providerMetadata);
  const mockMode =
    process.env.MANYCHAT_OUTBOUND_MOCK_MODE === "true" ||
    (!envApiUrl && !configuredMetadata.apiUrl) ||
    (!envApiToken && !configuredMetadata.apiToken);

  const adapter = new ManychatOutboundAdapter({
    apiUrl: envApiUrl ?? configuredMetadata.apiUrl,
    apiToken: envApiToken ?? configuredMetadata.apiToken,
    mockMode,
  });

  try {
    return await adapter.sendText({
      hotelId: payload.hotelId,
      conversationId: payload.conversationId,
      externalUserId: payload.externalUserId,
      channel: payload.channel,
      message: payload.message,
      metadata: payload.providerMetadata,
    });
  } catch (err) {
    logger.warn("Manychat outbound delivery failed", {
      hotelId: payload.hotelId,
      conversationId: payload.conversationId,
      channel: payload.channel,
      error: err instanceof Error ? err.message : String(err),
    });

    return {
      provider: MANYCHAT_OUTBOUND_PROVIDER,
      deliveryStatus: "failed",
      mockMode: false,
    };
  }
}

export function hasManychatLocalDevSecret(payload: NormalizedManychatOutboundMessage): boolean {
  return payload.secret === MANYCHAT_LOCAL_TEST_SECRET;
}
