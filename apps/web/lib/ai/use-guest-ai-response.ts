"use client";

import type { ChatMsg } from "@/app/dashboard/_components/chat-threads";
import type { Conversation } from "@/app/dashboard/_components/mock-data";
import type { ConvReservation } from "@/app/dashboard/_components/chat-threads";
import { useConversationAiStore } from "@/lib/stores/conversation-ai-store";
import type { AiOperationMode, AiRespondRequest, HotelAssistantResponse } from "./types";
import { getConfidenceBand } from "./confidence";

export type GuestAiPipelineCallbacks = {
  onGuestMessage?: (msg: ChatMsg) => void;
  onAiReply?: (msg: ChatMsg, response: HotelAssistantResponse) => void;
  onTypingChange?: (typing: boolean) => void;
  onHumanRecommended?: (response: HotelAssistantResponse) => void;
  onError?: (message: string) => void;
};

export type GuestAiContext = {
  conversation: Conversation;
  reservation?: ConvReservation;
  mode: AiOperationMode;
  humanTakeoverActive: boolean;
  recentMessages?: ChatMsg[];
};

function buildRecentMessages(messages: ChatMsg[] | undefined) {
  if (!messages?.length) return undefined;
  return messages
    .filter((m) => m.dir !== "system")
    .slice(-8)
    .map((m) => ({
      role: m.dir === "in" ? ("guest" as const) : m.by === "human" ? ("staff" as const) : ("ai" as const),
      content: m.body,
    }));
}

function mapReservationContext(reservation?: ConvReservation) {
  if (!reservation) return undefined;
  const paymentStatus =
    reservation.status === "confirmed"
      ? ("completed" as const)
      : reservation.status === "pending_payment"
        ? ("pending" as const)
        : ("not_applicable" as const);
  return {
    roomType: reservation.room,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    totalAmount: reservation.total,
    currency: reservation.currency,
    paymentStatus,
    ref: reservation.ref,
    stage:
      reservation.status === "confirmed"
        ? ("confirmed" as const)
        : reservation.status === "pending_payment"
          ? ("payment_pending" as const)
          : reservation.status === "quoted"
            ? ("offer_sent" as const)
            : ("new_inquiry" as const),
  };
}

export async function requestGuestAiResponse(
  guestMessage: string,
  ctx: GuestAiContext,
  callbacks: GuestAiPipelineCallbacks = {}
): Promise<HotelAssistantResponse | null> {
  const store = useConversationAiStore.getState();
  const convId = ctx.conversation.id;

  if (ctx.humanTakeoverActive) {
    store.setHumanActive(convId);
    return null;
  }

  store.setChecking(convId);
  callbacks.onTypingChange?.(true);

  const payload: AiRespondRequest = {
    conversationId: convId,
    message: guestMessage,
    mode: ctx.mode,
    guest: {
      name: ctx.conversation.contact.name,
      language: ctx.conversation.language,
    },
    reservationContext: mapReservationContext(ctx.reservation),
    hotelPolicy: {
      hotelName: "Grand Hotel Demo",
      checkInTime: "14:00",
      checkOutTime: "12:00",
    },
    recentMessages: buildRecentMessages(ctx.recentMessages),
  };

  try {
    const res = await fetch("/api/ai/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as {
      ok: boolean;
      data?: HotelAssistantResponse;
      fallback?: HotelAssistantResponse;
      error?: string;
    };

    const response = json.ok && json.data ? json.data : json.fallback;
    if (!response) {
      const errMsg = "AI yanıtı alınamadı. Ekip manuel devam edebilir.";
      store.setError(convId, errMsg);
      callbacks.onError?.(errMsg);
      callbacks.onTypingChange?.(false);
      return null;
    }

    store.applyResponse(convId, response, ctx.humanTakeoverActive);

    const band = getConfidenceBand(response.confidence);
    const shouldAutoReply =
      !response.requiresHuman && band === "auto_reply" && !ctx.humanTakeoverActive;

    callbacks.onTypingChange?.(false);

    if (response.requiresHuman || band !== "auto_reply") {
      callbacks.onHumanRecommended?.(response);
    }

    if (shouldAutoReply) {
      const now = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const aiMsg: ChatMsg = {
        id: `ai-${Date.now()}`,
        dir: "out",
        by: "ai",
        body: response.reply,
        time: now,
      };
      callbacks.onAiReply?.(aiMsg, response);
    }

    return response;
  } catch {
    const errMsg = "AI yanıtı alınamadı. Ekip manuel devam edebilir.";
    store.setError(convId, errMsg);
    callbacks.onError?.(errMsg);
    callbacks.onTypingChange?.(false);
    return null;
  }
}

export function useConversationAi(conversationId: string) {
  return useConversationAiStore((s) => s.getState(conversationId));
}
