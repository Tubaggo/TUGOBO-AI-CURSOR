import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import OpenAI from "openai";
import { logger } from "@tugobo/shared";

// Twilio sends application/x-www-form-urlencoded
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = Object.fromEntries(new URLSearchParams(rawBody));

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      logger.error("Twilio credentials not configured");
      return new NextResponse("Server misconfiguration", { status: 500 });
    }

    const signature = req.headers.get("x-twilio-signature") ?? "";
    const url = process.env.NEXT_PUBLIC_APP_URL + "/api/webhooks/twilio";

    const isValid = twilio.validateRequest(authToken, signature, url, params);
    if (!isValid && process.env.NODE_ENV === "production") {
      logger.warn("Invalid Twilio signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const messageSid = params["MessageSid"];
    const body = params["Body"] ?? "";

    if (!messageSid || !body) {
      return new NextResponse("", { status: 200 });
    }

    logger.info("Twilio inbound message received", {
      sid: messageSid,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.error("OpenAI API key not configured");
      return new NextResponse("Server misconfiguration", { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful hotel concierge AI. Be warm, professional, and concise. " +
            "Respond in the same language the guest uses. " +
            "Keep your reply under 4 sentences for this initial test.",
        },
        { role: "user", content: body },
      ],
      max_tokens: 256,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ??
      "Thank you for your message. A member of our team will be in touch shortly.";

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message><Body>${escapeXml(reply)}</Body></Message>
</Response>`;

    logger.info("Sending Twilio TwiML reply", { sid: messageSid });

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    logger.error("Twilio webhook error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
