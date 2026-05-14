import { NextResponse } from "next/server";
import { z } from "zod";
import { HOTEL_OPERATING_INTELLIGENCE_WEB_DEEPSEEK_V1 } from "@tugobo/core/prompts";
import { env } from "@tugobo/shared/env";
import {
  hotelIntelligenceInsightsSchema,
  intelligenceChatRequestSchema,
} from "@tugobo/shared";

export const runtime = "nodejs";

const DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com";

const modelJsonEnvelopeSchema = z.object({
  reply: z.string().min(1),
  insights: z.unknown().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ enabled: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = intelligenceChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ enabled: false, error: "invalid_body" }, { status: 400 });
  }

  const key = env.DEEPSEEK_API_KEY;
  if (!key) {
    return NextResponse.json({
      enabled: false,
      error: "deepseek_not_configured",
    });
  }

  const baseUrl = (env.DEEPSEEK_BASE_URL ?? DEEPSEEK_DEFAULT_BASE).replace(/\/$/, "");
  const system = HOTEL_OPERATING_INTELLIGENCE_WEB_DEEPSEEK_V1();

  const outboundMessages = [
    { role: "system" as const, content: system },
    ...parsed.data.messages,
  ];

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: outboundMessages,
        response_format: { type: "json_object" },
        temperature: 0.35,
        max_tokens: 2_048,
      }),
    });

    if (!res.ok) {
      console.error("[INTELLIGENCE_CHAT] upstream_http", { status: res.status });
      return NextResponse.json({ enabled: false, error: "upstream" });
    }

    const upstream = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const raw = upstream.choices?.[0]?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) {
      return NextResponse.json({ enabled: false, error: "empty_completion" });
    }

    let obj: unknown;
    try {
      obj = JSON.parse(raw) as unknown;
    } catch {
      return NextResponse.json({
        enabled: true,
        reply: raw.trim(),
        insights: null,
        model: "deepseek-chat",
      });
    }

    const envParsed = modelJsonEnvelopeSchema.safeParse(obj);
    if (!envParsed.success) {
      return NextResponse.json({
        enabled: true,
        reply: typeof raw === "string" ? raw.trim() : "Yanıt işlenemedi.",
        insights: null,
        model: "deepseek-chat",
      });
    }

    const { reply, insights: rawInsights } = envParsed.data;
    let insights: z.infer<typeof hotelIntelligenceInsightsSchema> | null = null;
    if (rawInsights !== null && rawInsights !== undefined) {
      const ins = hotelIntelligenceInsightsSchema.safeParse(rawInsights);
      if (ins.success) {
        insights = ins.data;
      }
    }

    return NextResponse.json({
      enabled: true,
      reply,
      insights,
      model: "deepseek-chat",
    });
  } catch (e) {
    console.error("[INTELLIGENCE_CHAT] exception", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ enabled: false, error: "exception" });
  }
}
