import { NextResponse } from "next/server";
import {
  hasManychatLocalDevSecret,
  isManychatLocalDevOutboundPayload,
  isValidManychatInternalToken,
  parseManychatOutboundPayload,
  sendManychatOutboundMessage,
} from "@/lib/server/integrations/manychat-outbound";
import { validateManychatSecret } from "@/lib/server/conversations/service";
import { recordManychatDevRuntimeEvent } from "@/lib/server/integrations/manychat-dev-events";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = parseManychatOutboundPayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { success: false, error: parsed.error, message: parsed.message },
      { status: 400 }
    );
  }

  const normalized = parsed.data;

  if (isManychatLocalDevOutboundPayload(normalized)) {
    if (!hasManychatLocalDevSecret(normalized) && !isValidManychatInternalToken(normalized.internalAuthToken)) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "Shared secret validation failed." },
        { status: 403 }
      );
    }

    const result = await sendManychatOutboundMessage(normalized);
    recordManychatDevRuntimeEvent({
      messageId: normalized.clientMessageId,
      hotelId: normalized.hotelId,
      provider: "manychat",
      channel: normalized.channel,
      senderType: "staff",
      externalUserId: normalized.externalUserId,
      externalId: `manychat:${normalized.channel}:${normalized.externalUserId}`,
      message: normalized.message,
    });

    return NextResponse.json({
      success: result.deliveryStatus !== "failed",
      provider: result.provider,
      deliveryStatus: result.deliveryStatus,
      mockMode: result.mockMode,
      externalMessageId: result.externalMessageId,
    });
  }

  if (!isValidManychatInternalToken(normalized.internalAuthToken)) {
    if (!normalized.secret) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "Shared secret or internal token is required." },
        { status: 403 }
      );
    }

    try {
      await validateManychatSecret({
        hotelId: normalized.hotelId,
        channel: normalized.channel,
        secret: normalized.secret,
      });
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown_error";

      if (code === "hotel_not_found") {
        return NextResponse.json(
          { success: false, error: "hotel_not_found", message: "Unknown hotel_id." },
          { status: 404 }
        );
      }

      if (code === "channel_not_connected") {
        return NextResponse.json(
          {
            success: false,
            error: "channel_not_connected",
            message: "No connected Manychat channel found for this hotel and channel.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: "forbidden", message: "Shared secret validation failed." },
        { status: 403 }
      );
    }
  }

  const result = await sendManychatOutboundMessage(normalized);
  const status = result.deliveryStatus === "failed" ? 502 : 200;

  return NextResponse.json(
    {
      success: result.deliveryStatus !== "failed",
      provider: result.provider,
      deliveryStatus: result.deliveryStatus,
      mockMode: result.mockMode,
      externalMessageId: result.externalMessageId,
    },
    { status }
  );
}
