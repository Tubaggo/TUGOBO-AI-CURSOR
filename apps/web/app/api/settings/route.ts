import { NextResponse } from "next/server";

type HotelSettings = {
  hotelName?: string;
  timezone?: string;
  language?: string;
  email?: string;
  persona?: string;
  aiName?: string;
  escalationThreshold?: string;
  hours?: Record<number, { open: boolean; from: string; to: string }>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as HotelSettings;

    // Sanitized log — never log contact details
    console.log("[SETTINGS_SAVE]", {
      hotelName: body.hotelName,
      timezone: body.timezone,
      aiName: body.aiName,
      hasPersona: Boolean(body.persona),
      timestamp: new Date().toISOString(),
    });

    // TODO: Persist to DB via @tugobo/db
    // Example (once auth + hotel_id middleware is in place):
    //
    // import { db } from "@tugobo/db";
    // import { hotels } from "@tugobo/db/schema";
    // const hotelId = getHotelIdFromSession(req);
    // await db.update(hotels)
    //   .set({ name: body.hotelName, timezone: body.timezone, updatedAt: new Date() })
    //   .where(eq(hotels.id, hotelId));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Save failed" }, { status: 500 });
  }
}
