import { NextResponse } from "next/server";
import { z } from "zod";
import { applyTakeover } from "@/lib/server/conversations/service";
import { isLiveOpsEnabled } from "@/lib/server/pilot-hotel";

export const runtime = "nodejs";

const takeoverSchema = z.object({
  action: z.enum(["takeover", "release_to_ai"]),
  operatorId: z.string().uuid().optional(),
});

type RouteContext = { params: Promise<{ conversationId: string }> };

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

  const parsed = takeoverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  try {
    const conversation = await applyTakeover(
      conversationId,
      parsed.data.action,
      parsed.data.operatorId
    );
    return NextResponse.json({ ok: true, conversation });
  } catch (err) {
    console.error("[TAKEOVER]", {
      error: err instanceof Error ? err.message : String(err),
      conversationId,
    });
    return NextResponse.json({ ok: false, error: "takeover_failed" }, { status: 500 });
  }
}
