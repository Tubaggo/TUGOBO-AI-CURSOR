import type {
  AiIntent,
  AiProcessingStatus,
  AiReservationStage,
  AiSuggestedAction,
  HotelAssistantResponse,
} from "./types";

export type AiConfidenceBand = "auto_reply" | "suggest_approval" | "human_recommended";

export function getConfidenceBand(confidence: number): AiConfidenceBand {
  if (confidence >= 0.8) return "auto_reply";
  if (confidence >= 0.6) return "suggest_approval";
  return "human_recommended";
}

export function confidencePercent(confidence: number): number {
  return Math.round(Math.max(0, Math.min(1, confidence)) * 100);
}

export const AI_RESERVATION_STAGE_LABELS_TR: Record<AiReservationStage, string> = {
  new_inquiry: "Yeni talep",
  qualified: "Nitelendirildi",
  offer_sent: "Teklif gönderildi",
  payment_pending: "Ödeme bekleniyor",
  payment_problem: "Ödeme sorunu",
  confirmed: "Onaylandı",
  human_review: "İnsan desteği gerekiyor",
};

export function aiReservationStageLabel(stage: AiReservationStage): string {
  return AI_RESERVATION_STAGE_LABELS_TR[stage];
}

export function deriveProcessingStatus(
  response: HotelAssistantResponse,
  humanTakeoverActive: boolean
): AiProcessingStatus {
  if (humanTakeoverActive) return "human_active";
  if (response.requiresHuman || getConfidenceBand(response.confidence) === "human_recommended") {
    return "human_recommended";
  }
  if (getConfidenceBand(response.confidence) === "suggest_approval") {
    return "awaiting_approval";
  }
  if (response.intent === "payment_question" || response.intent === "payment_failed") {
    return "tracking_payment";
  }
  if (
    response.suggestedAction === "prepare_quote" ||
    response.intent === "quote_request"
  ) {
    return "preparing_offer";
  }
  if (
    response.suggestedAction === "check_availability" ||
    response.intent === "availability_question" ||
    response.intent === "reservation_inquiry"
  ) {
    return "checking";
  }
  return "idle";
}

export const AI_STATUS_LABELS_TR: Record<AiProcessingStatus, string> = {
  idle: "",
  checking: "AI müsaitlik kontrol ediyor…",
  preparing_offer: "AI teklif hazırlıyor…",
  tracking_payment: "AI ödeme durumunu takip ediyor…",
  awaiting_approval: "AI öneri hazırladı — ekip onayı bekleniyor",
  human_recommended: "İnsan desteği öneriliyor",
  human_active: "Ekip devraldı",
  error: "AI yanıtı alınamadı. Ekip manuel devam edebilir.",
};

export function aiStatusLabel(status: AiProcessingStatus): string {
  return AI_STATUS_LABELS_TR[status];
}

export function suggestedActionLabel(action: AiSuggestedAction): string {
  const labels: Record<AiSuggestedAction, string> = {
    check_availability: "Müsaitlik kontrolü",
    prepare_quote: "Teklif hazırla",
    send_payment_link: "Ödeme linki gönder",
    follow_up_payment: "Ödeme takibi",
    escalate_to_human: "İnsan desteğine aktar",
    answer_faq: "Bilgi yanıtı",
    confirm_booking_status: "Rezervasyon durumunu doğrula",
    none: "İzlemede",
  };
  return labels[action];
}

export function intentToOpsHint(intent: AiIntent): string | null {
  const hints: Partial<Record<AiIntent, string>> = {
    reservation_inquiry: "Rezervasyon talebi algılandı",
    payment_failed: "Ödeme sorunu — ekip müdahalesi gerekebilir",
    complaint: "Şikayet — insan desteği önerilir",
    human_help_request: "Misafir insan temsilci istiyor",
  };
  return hints[intent] ?? null;
}

export function mergeHumanTakeover(
  response: HotelAssistantResponse
): HotelAssistantResponse {
  if (getConfidenceBand(response.confidence) === "human_recommended") {
    return {
      ...response,
      requiresHuman: true,
      reservationStage:
        response.reservationStage === "confirmed"
          ? response.reservationStage
          : "human_review",
      suggestedAction:
        response.suggestedAction === "none"
          ? "escalate_to_human"
          : response.suggestedAction,
    };
  }
  return response;
}
