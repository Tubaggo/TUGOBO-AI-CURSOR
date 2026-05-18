import { NextResponse } from "next/server";
import {
  aiRespondRequestSchema,
  generateHotelAssistantResponse,
  type AiRespondResult,
} from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const parsed = aiRespondRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const result: AiRespondResult = await generateHotelAssistantResponse(parsed.data);

  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  return NextResponse.json(result);
}
