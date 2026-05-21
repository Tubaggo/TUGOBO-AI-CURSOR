import { z } from "zod";
import { MANYCHAT_LOCAL_TEST_HOTEL_ID } from "./manychat-config";
export { MANYCHAT_LOCAL_TEST_HOTEL_ID, MANYCHAT_LOCAL_TEST_SECRET } from "./manychat-config";

const manychatInboundSchema = z.object({
  hotel_id: z.string().trim().min(1).max(120),
  secret: z.string().trim().min(1).max(255),
  provider: z.literal("manychat").optional().default("manychat"),
  channel: z.enum(["instagram", "whatsapp"]),
  external_user_id: z.string().trim().min(1).max(200),
  guest_name: z.string().trim().max(120).nullish(),
  username: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
  message: z.string().trim().min(1).max(4000),
  timestamp: z
    .union([z.string().datetime({ offset: true }), z.string().datetime(), z.number().finite()])
    .optional(),
});

export type NormalizedManychatInboundMessage = {
  hotelId: string;
  secret: string;
  provider: "manychat";
  channel: "instagram" | "whatsapp";
  externalUserId: string;
  guestName: string;
  username?: string;
  guestPhone?: string;
  message: string;
  timestamp: Date;
};

type ParseSuccess = {
  ok: true;
  data: NormalizedManychatInboundMessage;
};

type ParseFailure = {
  ok: false;
  error: "invalid_body" | "invalid_timestamp";
  message: string;
};

export type ManychatParseResult = ParseSuccess | ParseFailure;

function parseTimestamp(input: string | number | undefined): ParseSuccess["data"]["timestamp"] | null {
  if (input === undefined) {
    return new Date();
  }

  const value = typeof input === "number" ? new Date(input) : new Date(input);
  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
}

export function parseManychatInboundPayload(body: unknown): ManychatParseResult {
  const parsed = manychatInboundSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_body",
      message: "Payload validation failed.",
    };
  }

  const timestamp = parseTimestamp(parsed.data.timestamp);
  if (!timestamp) {
    return {
      ok: false,
      error: "invalid_timestamp",
      message: "Payload timestamp is invalid.",
    };
  }

  return {
    ok: true,
    data: {
      hotelId: parsed.data.hotel_id,
      secret: parsed.data.secret,
      provider: "manychat",
      channel: parsed.data.channel,
      externalUserId: parsed.data.external_user_id,
      guestName: parsed.data.guest_name?.trim() || parsed.data.username?.trim() || "Misafir",
      username: parsed.data.username?.trim() || undefined,
      guestPhone: parsed.data.phone?.trim() || undefined,
      message: parsed.data.message,
      timestamp,
    },
  };
}

export function isManychatLocalDevPayload(payload: NormalizedManychatInboundMessage): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    payload.hotelId === MANYCHAT_LOCAL_TEST_HOTEL_ID
  );
}
