import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getConversationMessages,
  markConversationRead,
  sendOperatorMessage,
} from "@/lib/server/conversations/service";
import { isLiveOpsEnabled } from "@/lib/server/pilot-hotel";

export const runtime = "nodejs";

const sendSchema = z.object({
  body: z.string().min(1).max(4000),
});

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  if (!isLiveOpsEnabled()) {
    return NextResponse.json({ ok: true, live: false, messages: [] });
  }

  const { conversationId } = await context.params;

  try {
    const messages = await getConversationMessages(conversationId);
    return NextResponse.json({ ok: true, live: true, messages });
  } catch (err) {
    console.error("[MESSAGES_GET]", {
      error: err instanceof Error ? err.message : String(err),
      conversationId,
    });
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  if (!isLiveOpsEnabled()) {
    return NextResponse.json({ ok: false, live: false, error: "live_ops_disabled" }, { status: 503 });
  }

  const { conversationId } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  try {
    const message = await sendOperatorMessage(conversationId, parsed.data.body);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    console.error("[MESSAGES_SEND]", {
      error: err instanceof Error ? err.message : String(err),
      conversationId,
    });
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}

export async function PATCH(_req: Request, context: RouteContext) {
  if (!isLiveOpsEnabled()) {
    return NextResponse.json({ ok: false, live: false }, { status: 503 });
  }

  const { conversationId } = await context.params;

  try {
    await markConversationRead(conversationId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "mark_read_failed" }, { status: 500 });
  }
}
