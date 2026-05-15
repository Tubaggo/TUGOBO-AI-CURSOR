"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { applyRuntimeEvent } from "./orchestration-engine";
import type { LiveOperationalEvent } from "./live-events";
import { deriveOrchestrationPulse, type OrchestrationPulseMetrics } from "./orchestration-pulse";
import { createRuntimeEvent, type RuntimeEventPayload, type RuntimeEventType } from "./runtime-events";
import { assignReservation, updateReservationStage } from "@/lib/data/reservations";
import { buildRuntimeSeed } from "./seed-runtime";
import type { Conversation } from "@/lib/types/conversations";
import type { AIRuntimeState, RuntimeOperationalStatus } from "./types";

type AIRuntimeActions = {
  hydrate: () => void;
  dispatch: (type: RuntimeEventType, payload: RuntimeEventPayload) => void;
  setReservationStage: (
    reservationId: string,
    stage: AIRuntimeState["reservations"][0]["status"]
  ) => void;
  assignReservationStaff: (reservationId: string, staffName: string) => void;
};

export type AIRuntimeStore = AIRuntimeState & AIRuntimeActions;

const initialState: AIRuntimeState = {
  hydrated: false,
  lastPulseAt: 0,
  conversations: [],
  conversationSummaries: [],
  reservations: [],
  guests: [],
  escalations: [],
  auditEvents: [],
  overview: {
    asOfIso: new Date(0).toISOString(),
    runtime: {
      status: "healthy",
      uptimePct: 99.4,
      avgResponseMs: 840,
      activeWorkflows: 0,
      knowledgeCoveragePct: 87,
      lastHealthCheckAt: new Date(0).toISOString(),
    },
    escalationActivity: { active: 0, unresolved24h: 0, resolvedToday: 0 },
    activeWorkflows: [],
    confidenceDistribution: [],
    humanTakeoverRatio: 0,
    aiRevenueInfluenceEur: 0,
    aiRevenueInfluencePct: 0,
    policyTriggers: [],
    actionFeed: [],
    activePersonaId: "persona_luxury",
  },
  conversationMeta: {},
  entityStatuses: {},
};

/** Stable fallback — `?? []` inside selectors creates a new ref every read and loops SSR hydration. */
const EMPTY_ENTITY_STATUSES: RuntimeOperationalStatus[] = [];

export const useAIRuntimeStore = create<AIRuntimeStore>((set, get) => ({
  ...initialState,

  hydrate: () => {
    if (get().hydrated) return;
    set(buildRuntimeSeed());
  },

  dispatch: (type, payload) => {
    const event = createRuntimeEvent(type, payload);
    set((state) => applyRuntimeEvent(state, event));
  },

  setReservationStage: (reservationId, stage) => {
    set((state) => ({
      ...state,
      lastPulseAt: Date.now(),
      reservations: updateReservationStage(state.reservations, reservationId, stage),
    }));
  },

  assignReservationStaff: (reservationId, staffName) => {
    set((state) => ({
      ...state,
      lastPulseAt: Date.now(),
      reservations: assignReservation(state.reservations, reservationId, staffName),
    }));
  },
}));

export function useRuntimeEntityStatuses(
  entityId: string | undefined
): RuntimeOperationalStatus[] {
  return useAIRuntimeStore((s) => {
    if (!entityId) return EMPTY_ENTITY_STATUSES;
    return s.entityStatuses[entityId] ?? EMPTY_ENTITY_STATUSES;
  });
}

export function useRuntimeConversation(id: string): Conversation | undefined {
  return useAIRuntimeStore((s) => s.conversations.find((c) => c.id === id));
}

export function useRuntimeConversationDetail(
  activeId: string | null
): Conversation | null {
  return useAIRuntimeStore((s) => {
    if (!activeId) return null;
    return s.conversations.find((c) => c.id === activeId) ?? null;
  });
}

export function useRuntimePulse(): number {
  return useAIRuntimeStore((s) => s.lastPulseAt);
}

const EMPTY_LIVE_EVENTS: LiveOperationalEvent[] = [];

export function useLiveOperationalEvents(limit?: number): LiveOperationalEvent[] {
  return useAIRuntimeStore((s) => {
    const events = s.hydrated ? s.liveEvents : EMPTY_LIVE_EVENTS;
    return limit !== undefined ? events.slice(0, limit) : events;
  });
}

export function useOrchestrationPulseMetrics(): OrchestrationPulseMetrics {
  const overview = useAIRuntimeStore((s) => s.overview);
  const escalations = useAIRuntimeStore((s) => s.escalations);
  const hydrated = useAIRuntimeStore((s) => s.hydrated);

  return useMemo(() => {
    if (!hydrated) {
      return deriveOrchestrationPulse(overview, []);
    }
    return deriveOrchestrationPulse(overview, escalations);
  }, [hydrated, overview, escalations]);
}
