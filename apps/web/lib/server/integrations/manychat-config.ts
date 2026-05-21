import { timingSafeEqual } from "node:crypto";
import { and, channels, db, eq, type DB } from "@tugobo/db";

export type ManychatBridgeChannel = "instagram" | "whatsapp";
export type ManychatBridgeConfigMode = "live" | "env" | "mock";

export type ManychatBridgeConfig = {
  mode: ManychatBridgeConfigMode;
  inboundSecret?: string;
  outboundUrl?: string;
  outboundToken?: string;
  metadata: Record<string, unknown>;
};

type ResolveManychatBridgeConfigInput = {
  hotelId: string;
  channel: ManychatBridgeChannel;
  externalUserId?: string;
};

type ManychatChannelMetadata = {
  inboundSecret?: unknown;
  inbound_secret?: unknown;
  outboundToken?: unknown;
  outbound_token?: unknown;
  outboundUrl?: unknown;
  outbound_url?: unknown;
  outboundApiUrl?: unknown;
  outboundApiToken?: unknown;
  apiUrl?: unknown;
  apiToken?: unknown;
  externalAccountId?: unknown;
  external_account_id?: unknown;
};

export const MANYCHAT_LOCAL_TEST_HOTEL_ID = "demo-hotel";
export const MANYCHAT_LOCAL_TEST_SECRET = "test-secret";

function stringValue(input: unknown): string | undefined {
  return typeof input === "string" && input.trim().length > 0 ? input.trim() : undefined;
}

function metadataRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input)
    ? { ...(input as Record<string, unknown>) }
    : {};
}

function scrubSensitiveMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const scrubbed = { ...metadata };
  for (const key of [
    "inboundSecret",
    "inbound_secret",
    "outboundToken",
    "outbound_token",
    "outboundUrl",
    "outbound_url",
    "outboundApiUrl",
    "outboundApiToken",
    "apiUrl",
    "apiToken",
  ]) {
    delete scrubbed[key];
  }
  return scrubbed;
}

function readMetadataConfig(metadata: Record<string, unknown>) {
  const values = metadata as ManychatChannelMetadata;
  return {
    inboundSecret: stringValue(values.inboundSecret) ?? stringValue(values.inbound_secret),
    outboundUrl:
      stringValue(values.outboundUrl) ??
      stringValue(values.outbound_url) ??
      stringValue(values.outboundApiUrl) ??
      stringValue(values.apiUrl),
    outboundToken:
      stringValue(values.outboundToken) ??
      stringValue(values.outbound_token) ??
      stringValue(values.outboundApiToken) ??
      stringValue(values.apiToken),
    externalAccountId:
      stringValue(values.externalAccountId) ?? stringValue(values.external_account_id),
  };
}

function envBridgeConfig(): ManychatBridgeConfig | null {
  const outboundUrl =
    process.env.MANYCHAT_BRIDGE_OUTBOUND_URL?.trim() ||
    process.env.MANYCHAT_OUTBOUND_API_URL?.trim();
  const outboundToken =
    process.env.MANYCHAT_BRIDGE_TOKEN?.trim() ||
    process.env.MANYCHAT_OUTBOUND_API_TOKEN?.trim() ||
    process.env.MANYCHAT_API_TOKEN?.trim();
  const inboundSecret = process.env.MANYCHAT_BRIDGE_SECRET?.trim();

  if (!inboundSecret && !outboundUrl && !outboundToken) {
    return null;
  }

  return {
    mode: "env",
    inboundSecret: inboundSecret || undefined,
    outboundUrl: outboundUrl || undefined,
    outboundToken: outboundToken || undefined,
    metadata: {
      source: "env",
    },
  };
}

function localDevMockConfig(input: ResolveManychatBridgeConfigInput): ManychatBridgeConfig | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (input.hotelId !== MANYCHAT_LOCAL_TEST_HOTEL_ID) {
    return null;
  }

  return {
    mode: "mock",
    inboundSecret: MANYCHAT_LOCAL_TEST_SECRET,
    metadata: {
      source: "local-dev",
    },
  };
}

async function findConnectedChannelConfig(
  database: DB,
  input: ResolveManychatBridgeConfigInput
): Promise<ManychatBridgeConfig | null> {
  const [connectedChannel] = await database
    .select({
      inboundSecret: channels.inboundSecret,
      legacySecret: channels.secret,
      outboundUrl: channels.outboundUrl,
      outboundToken: channels.outboundToken,
      externalAccountId: channels.externalAccountId,
      metadata: channels.metadata,
    })
    .from(channels)
    .where(
      and(
        eq(channels.hotelId, input.hotelId),
        eq(channels.provider, "manychat"),
        eq(channels.channelType, input.channel),
        eq(channels.status, "connected")
      )
    )
    .limit(1);

  if (!connectedChannel) {
    return null;
  }

  const metadata = metadataRecord(connectedChannel.metadata);
  const metadataConfig = readMetadataConfig(metadata);
  const externalAccountId =
    connectedChannel.externalAccountId ?? metadataConfig.externalAccountId;

  return {
    mode: "live",
    inboundSecret:
      connectedChannel.inboundSecret ??
      connectedChannel.legacySecret ??
      metadataConfig.inboundSecret,
    outboundUrl: connectedChannel.outboundUrl ?? metadataConfig.outboundUrl,
    outboundToken: connectedChannel.outboundToken ?? metadataConfig.outboundToken,
    metadata: {
      ...scrubSensitiveMetadata(metadata),
      externalAccountId,
      externalUserId: input.externalUserId,
    },
  };
}

export function sanitizeManychatBridgeMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
  return scrubSensitiveMetadata(metadata ?? {});
}

export async function resolveManychatBridgeConfig(
  input: ResolveManychatBridgeConfigInput
): Promise<ManychatBridgeConfig | null> {
  if (db) {
    try {
      const liveConfig = await findConnectedChannelConfig(db, input);
      if (liveConfig) {
        return liveConfig;
      }
    } catch {
      // A missing migration or unavailable connected_channels read should not
      // turn expected bridge config failures into unhandled route errors.
    }
  }

  const envConfig = envBridgeConfig();
  if (envConfig) {
    return {
      ...envConfig,
      metadata: {
        ...envConfig.metadata,
        externalUserId: input.externalUserId,
      },
    };
  }

  return localDevMockConfig(input);
}

export function manychatSecretsMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
