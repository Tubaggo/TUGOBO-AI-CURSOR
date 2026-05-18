"use client";

import { create } from "zustand";
import {
  INITIAL_CONVERSATION_AI_STATE,
  type ConversationAiState,
  type HotelAssistantResponse,
  type AiProcessingStatus,
} from "@/lib/ai/types";
import {
  aiStatusLabel,
  deriveProcessingStatus,
  type AiConfidenceBand,
  getConfidenceBand,
} from "@/lib/ai/confidence";

type ConversationAiStore = {
  byConversation: Record<string, ConversationAiState>;
  getState: (conversationId: string) => ConversationAiState;
  setChecking: (conversationId: string) => void;
  applyResponse: (
    conversationId: string,
    response: HotelAssistantResponse,
    humanTakeoverActive?: boolean
  ) => void;
  setError: (conversationId: string, message: string) => void;
  setHumanActive: (conversationId: string) => void;
  resetConversation: (conversationId: string) => void;
};

function patch(
  map: Record<string, ConversationAiState>,
  id: string,
  next: Partial<ConversationAiState>
): Record<string, ConversationAiState> {
  return {
    ...map,
    [id]: { ...(map[id] ?? INITIAL_CONVERSATION_AI_STATE), ...next, updatedAt: Date.now() },
  };
}

export const useConversationAiStore = create<ConversationAiStore>((set, get) => ({
  byConversation: {},

  getState: (conversationId) =>
    get().byConversation[conversationId] ?? INITIAL_CONVERSATION_AI_STATE,

  setChecking: (conversationId) =>
    set((s) =>
      patch(s.byConversation, conversationId, {
        status: "checking",
        statusLabel: aiStatusLabel("checking"),
        lastError: null,
      })
    ),

  applyResponse: (conversationId, response, humanTakeoverActive = false) => {
    const status: AiProcessingStatus = deriveProcessingStatus(response, humanTakeoverActive);
    set((s) =>
      patch(s.byConversation, conversationId, {
        status,
        statusLabel: aiStatusLabel(status),
        lastResponse: response,
        lastError: null,
        requiresHuman: response.requiresHuman,
        confidence: response.confidence,
        intent: response.intent,
        reservationStage: response.reservationStage,
        suggestedAction: response.suggestedAction,
        guestSummary: response.guestSummary,
        paymentStatus: response.paymentStatus,
        riskSignals: response.riskSignals,
      })
    );
  },

  setError: (conversationId, message) =>
    set((s) =>
      patch(s.byConversation, conversationId, {
        status: "error",
        statusLabel: aiStatusLabel("error"),
        lastError: message,
      })
    ),

  setHumanActive: (conversationId) =>
    set((s) =>
      patch(s.byConversation, conversationId, {
        status: "human_active",
        statusLabel: aiStatusLabel("human_active"),
        requiresHuman: true,
      })
    ),

  resetConversation: (conversationId) =>
    set((s) => {
      const next = { ...s.byConversation };
      delete next[conversationId];
      return { byConversation: next };
    }),
}));

export function selectConfidenceBand(
  conversationId: string
): AiConfidenceBand | null {
  const state = useConversationAiStore.getState().getState(conversationId);
  if (state.confidence === null) return null;
  return getConfidenceBand(state.confidence);
}
