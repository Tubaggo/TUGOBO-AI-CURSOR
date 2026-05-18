import {
  hotelAssistantResponseSchema,
  type HotelAssistantResponse,
  type AiOperationMode,
} from "./types";
import { mergeHumanTakeover } from "./confidence";

const PRICE_PATTERN = /(?:€|\$|₺|tl|eur|usd)\s*\d+|\d+\s*(?:€|\$|₺|tl)/i;
const CONFIRM_PATTERN = /(?:kesinleştir|onayladık|rezervasyonunuz tamam|booked|confirmed your)/i;

export function parseAssistantResponse(raw: string): HotelAssistantResponse | null {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) text = fence[1].trim();

  try {
    const parsed = JSON.parse(text) as unknown;
    const result = hotelAssistantResponseSchema.safeParse(parsed);
    if (!result.success) return null;
    return sanitizeResponse(result.data);
  } catch {
    return null;
  }
}

export function sanitizeResponse(
  response: HotelAssistantResponse,
  mode: AiOperationMode = "demo"
): HotelAssistantResponse {
  let safe = mergeHumanTakeover({
    ...response,
    reply: response.reply.trim().slice(0, 2000),
    guestSummary: response.guestSummary.trim().slice(0, 500),
    riskSignals: response.riskSignals.slice(0, 8),
    confidence: Math.max(0, Math.min(1, response.confidence)),
  });

  if (mode === "live") {
    if (PRICE_PATTERN.test(safe.reply) && safe.confidence > 0.75) {
      safe = {
        ...safe,
        confidence: Math.min(safe.confidence, 0.55),
        requiresHuman: true,
        reply: safe.reply.replace(PRICE_PATTERN, "[fiyat ekiple doğrulanacak]"),
        riskSignals: [...safe.riskSignals, "live_price_claim"],
      };
    }
    if (CONFIRM_PATTERN.test(safe.reply)) {
      safe = {
        ...safe,
        requiresHuman: true,
        reservationStage: "human_review",
        riskSignals: [...safe.riskSignals, "premature_confirmation"],
        reply:
          "Talebinizi aldım. Rezervasyonu ekibimiz kontrol edip kısa sürede size dönüş yapacak.",
      };
    }
  }

  return safe;
}

export function buildFallbackResponse(
  mode: AiOperationMode,
  language = "tr"
): HotelAssistantResponse {
  const reply =
    language === "tr"
      ? "Mesajınızı aldım. Ekibimiz kısa süre içinde size yardımcı olacak."
      : "We received your message. Our team will assist you shortly.";

  return sanitizeResponse(
    {
      reply,
      intent: "unclear",
      reservationStage: "human_review",
      confidence: 0.35,
      requiresHuman: true,
      suggestedAction: "escalate_to_human",
      riskSignals: mode === "live" ? ["ai_unavailable"] : ["parse_failed"],
      paymentStatus: "unknown",
      guestSummary: "AI yanıtı alınamadı — ekip manuel devam edebilir.",
      language,
    },
    mode
  );
}
