import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ingestGuestMessage,
  runAiReplyForConversation,
} from "@/lib/server/conversations/service";
import { isLiveOpsEnabled, requirePilotHotelId } from "@/lib/server/pilot-hotel";

export const runtime = "nodejs";

const ingestSchema = z.object({
  channel: z.enum(["web_chat", "whatsapp", "instagram", "manual"]),
  guestName: z.string().min(1).max(120),
  message: z.string().min(1).max(4000),
  externalSessionId: z.string().max(200).optional(),
  conversationId: z.string().uuid().optional(),
  guestPhone: z.string().max(40).optional(),
  language: z.string().max(8).optional(),
  skipAi: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!isLiveOpsEnabled()) {
    return NextResponse.json({ ok: false, live: false, error: "live_ops_disabled" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  try {
    const hotelId = requirePilotHotelId();
    const { conversationId, messageId } = await ingestGuestMessage({
      hotelId,
      ...parsed.data,
    });

    if (!parsed.data.skipAi) {
      void runAiReplyForConversation(conversationId, parsed.data.message).catch((err) => {
        console.error("[INGEST_AI]", {
          error: err instanceof Error ? err.message : String(err),
          conversationId,
        });
      });
    }

    return NextResponse.json({
      ok: true,
      live: true,
      conversationId,
      messageId,
    });
  } catch (err) {
    console.error("[INGEST]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ ok: false, error: "ingest_failed" }, { status: 500 });
  }
}
