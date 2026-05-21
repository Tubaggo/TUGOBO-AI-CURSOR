import { NextResponse } from "next/server";
import { listConnectedChannels } from "@/lib/server/channels/service";
import { MANYCHAT_LOCAL_TEST_HOTEL_ID } from "@/lib/server/integrations/manychat-config";
import { resolvePilotHotelId } from "@/lib/server/pilot-hotel";

export const runtime = "nodejs";

function resolveSettingsHotelId(): string | null {
  const pilotHotelId = resolvePilotHotelId();
  if (pilotHotelId) return pilotHotelId;
  if (process.env.NODE_ENV !== "production") return MANYCHAT_LOCAL_TEST_HOTEL_ID;
  return null;
}

export async function GET() {
  const hotelId = resolveSettingsHotelId();

  if (!hotelId) {
    return NextResponse.json(
      {
        ok: false,
        error: "hotel_not_configured",
        message: "Hotel workspace is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    const channels = await listConnectedChannels(hotelId);
    return NextResponse.json({ ok: true, hotelId, channels });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "channel_settings_unavailable",
        message: "Channel settings are not available.",
      },
      { status: 503 }
    );
  }
}
