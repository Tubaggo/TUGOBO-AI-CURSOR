import { timingSafeEqual } from "node:crypto";
import {
  and,
  channels,
  db,
  desc,
  eq,
  inArray,
  type DB,
} from "@tugobo/db";
import type {
  ConnectedChannelProvider,
  ConnectedChannelStatus,
  ConnectedChannelType,
} from "@tugobo/shared";
import {
  MANYCHAT_LOCAL_TEST_HOTEL_ID,
  resolveManychatBridgeConfig,
  sanitizeManychatBridgeMetadata,
} from "@/lib/server/integrations/manychat-config";

export type ManagedChannelType = Extract<ConnectedChannelType, "web_chat" | "instagram" | "whatsapp">;
export type ChannelHealthStatus = "active" | "pending" | "disabled" | "error";

export type ConnectedChannelDisplay = {
  channelType: ManagedChannelType;
  displayName: "Web Chat" | "Instagram" | "WhatsApp";
  status: ChannelHealthStatus;
  lastConnectedAt: string | null;
  lastError: string | null;
  webhookState: "ready" | "not_configured";
};

export type ServerConnectedChannelConfig = {
  id: string | null;
  hotelId: string;
  channelType: ManagedChannelType;
  provider: ConnectedChannelProvider;
  status: ChannelHealthStatus;
  inboundSecret?: string;
  outboundUrl?: string;
  outboundToken?: string;
  externalAccountId?: string;
  lastConnectedAt: Date | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
};

type UpdateConnectedChannelStatusInput = {
  hotelId: string;
  channelType: ManagedChannelType;
  status: ChannelHealthStatus;
  lastError?: string | null;
};

type ValidateChannelSecretInput = {
  hotelId: string;
  channelType: ManagedChannelType;
  secret: string;
};

type ResolveOutboundConfigInput = {
  hotelId: string;
  channelType: ManagedChannelType;
  externalUserId?: string;
};

const MANAGED_CHANNELS: ManagedChannelType[] = ["web_chat", "instagram", "whatsapp"];

function assertDb(): DB {
  if (!db) throw new Error("database_not_configured");
  return db;
}

function displayName(channelType: ManagedChannelType): ConnectedChannelDisplay["displayName"] {
  if (channelType === "web_chat") return "Web Chat";
  if (channelType === "instagram") return "Instagram";
  return "WhatsApp";
}

export function normalizeChannelStatus(status: ConnectedChannelStatus | string | null | undefined): ChannelHealthStatus {
  if (status === "active" || status === "connected") return "active";
  if (status === "disabled" || status === "disconnected") return "disabled";
  if (status === "error") return "error";
  return "pending";
}

function defaultProviderForChannel(channelType: ManagedChannelType): ConnectedChannelProvider {
  if (channelType === "web_chat") return "web_chat";
  if (channelType === "instagram") return "instagram_dm";
  return "whatsapp_cloud";
}

function metadataRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};
}

function stringValue(input: unknown): string | undefined {
  return typeof input === "string" && input.trim().length > 0 ? input.trim() : undefined;
}

function metadataSecret(metadata: Record<string, unknown>) {
  return stringValue(metadata.inboundSecret) ?? stringValue(metadata.inbound_secret);
}

function secretsMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function toServerConfig(
  row: typeof channels.$inferSelect | null,
  hotelId: string,
  channelType: ManagedChannelType
): ServerConnectedChannelConfig {
  const metadata = metadataRecord(row?.metadata);
  const status = normalizeChannelStatus(row?.status);

  return {
    id: row?.id ?? null,
    hotelId,
    channelType,
    provider: row?.provider ?? defaultProviderForChannel(channelType),
    status,
    inboundSecret: row?.inboundSecret ?? row?.secret ?? metadataSecret(metadata),
    outboundUrl: row?.outboundUrl ?? stringValue(metadata.outboundUrl) ?? stringValue(metadata.outbound_url),
    outboundToken:
      row?.outboundToken ?? stringValue(metadata.outboundToken) ?? stringValue(metadata.outbound_token),
    externalAccountId:
      row?.externalAccountId ??
      stringValue(metadata.externalAccountId) ??
      stringValue(metadata.external_account_id),
    lastConnectedAt: row?.lastConnectedAt ?? (status === "active" ? row?.createdAt ?? null : null),
    lastError: row?.lastError ?? null,
    metadata: sanitizeManychatBridgeMetadata(metadata),
  };
}

function toDisplay(config: ServerConnectedChannelConfig): ConnectedChannelDisplay {
  return {
    channelType: config.channelType,
    displayName: displayName(config.channelType),
    status: config.status,
    lastConnectedAt: config.lastConnectedAt?.toISOString() ?? null,
    lastError: config.status === "error" ? config.lastError : null,
    webhookState:
      config.channelType === "web_chat" || config.inboundSecret ? "ready" : "not_configured",
  };
}

function localDevDisplayChannels(): ConnectedChannelDisplay[] {
  return [
    {
      channelType: "web_chat",
      displayName: "Web Chat",
      status: "active",
      lastConnectedAt: null,
      lastError: null,
      webhookState: "ready",
    },
    {
      channelType: "instagram",
      displayName: "Instagram",
      status: "active",
      lastConnectedAt: null,
      lastError: null,
      webhookState: "ready",
    },
    {
      channelType: "whatsapp",
      displayName: "WhatsApp",
      status: "pending",
      lastConnectedAt: null,
      lastError: null,
      webhookState: "not_configured",
    },
  ];
}

export function getLocalDevConnectedChannels(hotelId: string): ConnectedChannelDisplay[] | null {
  if (process.env.NODE_ENV === "production") return null;
  return hotelId === MANYCHAT_LOCAL_TEST_HOTEL_ID ? localDevDisplayChannels() : null;
}

export async function getConnectedChannel(
  hotelId: string,
  channelType: ManagedChannelType
): Promise<ServerConnectedChannelConfig | null> {
  if (!db) {
    return null;
  }

  const [row] = await db
    .select()
    .from(channels)
    .where(and(eq(channels.hotelId, hotelId), eq(channels.channelType, channelType)))
    .orderBy(desc(channels.createdAt))
    .limit(1);

  return row ? toServerConfig(row, hotelId, channelType) : null;
}

export async function listConnectedChannels(hotelId: string): Promise<ConnectedChannelDisplay[]> {
  const localDevChannels = getLocalDevConnectedChannels(hotelId);
  if (localDevChannels) {
    return localDevChannels;
  }

  if (!db) {
    return MANAGED_CHANNELS.map((channelType) =>
      toDisplay(toServerConfig(null, hotelId, channelType))
    );
  }

  const rows = await db
    .select()
    .from(channels)
    .where(and(eq(channels.hotelId, hotelId), inArray(channels.channelType, MANAGED_CHANNELS)))
    .orderBy(desc(channels.createdAt));

  return MANAGED_CHANNELS.map((channelType) => {
    const row = rows.find((candidate) => candidate.channelType === channelType) ?? null;
    return toDisplay(toServerConfig(row, hotelId, channelType));
  });
}

export async function updateConnectedChannelStatus(input: UpdateConnectedChannelStatusInput): Promise<void> {
  const database = assertDb();
  const now = new Date();

  await database
    .update(channels)
    .set({
      status: input.status,
      lastConnectedAt: input.status === "active" ? now : undefined,
      lastError: input.status === "error" ? input.lastError ?? "Connection error" : null,
    })
    .where(and(eq(channels.hotelId, input.hotelId), eq(channels.channelType, input.channelType)));
}

export async function validateChannelSecret(input: ValidateChannelSecretInput): Promise<void> {
  if (input.channelType === "instagram" || input.channelType === "whatsapp") {
    const bridgeConfig = await resolveManychatBridgeConfig({
      hotelId: input.hotelId,
      channel: input.channelType,
    });

    if (!bridgeConfig) {
      throw new Error("channel_not_connected");
    }

    if (!bridgeConfig.inboundSecret) {
      throw new Error("channel_secret_missing");
    }

    if (!secretsMatch(bridgeConfig.inboundSecret, input.secret.trim())) {
      throw new Error("invalid_secret");
    }

    return;
  }

  const config = await getConnectedChannel(input.hotelId, input.channelType);

  if (!config) {
    throw new Error("channel_not_connected");
  }

  if (!config.inboundSecret) {
    throw new Error("channel_secret_missing");
  }

  if (!secretsMatch(config.inboundSecret, input.secret.trim())) {
    throw new Error("invalid_secret");
  }
}

export async function resolveOutboundConfig(input: ResolveOutboundConfigInput) {
  if (input.channelType === "instagram" || input.channelType === "whatsapp") {
    return resolveManychatBridgeConfig({
      hotelId: input.hotelId,
      channel: input.channelType,
      externalUserId: input.externalUserId,
    });
  }

  return null;
}
