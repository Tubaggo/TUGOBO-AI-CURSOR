import { NextResponse } from "next/server";
import { inngest } from "@tugobo/core";
import { db, leads } from "@tugobo/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      hotel?: string;
      phone?: string;
      rooms?: string;
    };

    const name = (body.name ?? "").trim() || "Unknown";
    const hotelName = (body.hotel ?? "").trim() || "Unknown";
    const phone = (body.phone ?? "").trim();
    const rooms = body.rooms ?? null;

    // ── 1. Persist to database ─────────────────────────────────────────────
    // `db` is null when DATABASE_URL is not configured (dev without Supabase).
    // In production this will always be non-null.
    let leadId: string | null = null;

    if (db) {
      try {
        const [row] = await db
          .insert(leads)
          .values({ name, hotelName, phone, rooms: rooms ?? undefined })
          .returning({ id: leads.id });
        leadId = row?.id ?? null;
      } catch (dbErr) {
        // Log without PII
        console.error("[DEMO_LEAD] DB insert failed:", {
          error: dbErr instanceof Error ? dbErr.message : String(dbErr),
          hotelName,
          rooms,
        });
      }
    } else {
      console.warn("[DEMO_LEAD] DB not configured — skipping insert (set DATABASE_URL)");
    }

    // ── 2. Fire Inngest event (async email notification) ───────────────────
    // Non-blocking — failure here must never affect the UX response.
    try {
      await inngest.send({
        name: "demo/lead.created",
        data: {
          leadId,
          hotelName,
          rooms,
          hasPhone: Boolean(phone),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (inngestErr) {
      console.warn("[DEMO_LEAD] Inngest event failed (ok in dev without Inngest running):", {
        error: inngestErr instanceof Error ? inngestErr.message : String(inngestErr),
      });
    }

    return NextResponse.json({ ok: true, leadId });
  } catch {
    // Always succeed — UX must not show an error on backend failures
    return NextResponse.json({ ok: true });
  }
}
