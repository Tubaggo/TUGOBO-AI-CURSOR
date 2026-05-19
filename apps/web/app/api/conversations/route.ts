import { NextResponse } from "next/server";
import { listLiveConversations } from "@/lib/server/conversations/service";
import { isLiveOpsEnabled, resolvePilotHotelId } from "@/lib/server/pilot-hotel";

export const runtime = "nodejs";

export async function GET() {
  if (!isLiveOpsEnabled()) {
    return NextResponse.json({ ok: true, live: false, conversations: [] });
  }

  const hotelId = resolvePilotHotelId();
  if (!hotelId) {
    return NextResponse.json({ ok: false, error: "pilot_hotel_not_configured" }, { status: 503 });
  }

  try {
    const conversations = await listLiveConversations(hotelId);
    return NextResponse.json({ ok: true, live: true, conversations });
  } catch (err) {
    console.error("[CONVERSATIONS_LIST]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, error: "list_failed" }, { status: 500 });
  }
}
