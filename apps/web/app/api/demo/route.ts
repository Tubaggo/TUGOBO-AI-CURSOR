import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      name?: string;
      hotel?: string;
      phone?: string;
      email?: string;
      type?: string;
      rooms?: string;
    };

    // Log sanitized lead data (NEVER log phone/email — PII)
    console.log("[DEMO_LEAD]", {
      hotel: body.hotel ?? "unknown",
      type: body.type ?? "unknown",
      rooms: body.rooms ?? "unknown",
      hasPhone: Boolean(body.phone),
      hasEmail: Boolean(body.email),
      timestamp: new Date().toISOString(),
    });

    // TODO: In production, choose one or more:
    //   1. Insert into a `leads` DB table via @tugobo/db
    //   2. Send a notification via Inngest event: inngest.send({ name: "demo/lead.created", data: {...} })
    //   3. Trigger a Slack/email webhook with sanitized data

    return NextResponse.json({ ok: true });
  } catch {
    // Always return ok — UX must not fail on backend errors
    return NextResponse.json({ ok: true });
  }
}
