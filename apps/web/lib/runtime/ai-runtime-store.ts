"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { applyRuntimeEvent } from "./orchestration-engine";
import type { LiveOperationalEvent } from "./live-events";
import { deriveOrchestrationPulse, type OrchestrationPulseMetrics } from "./orchestration-pulse";
import { createRuntimeEvent, type RuntimeEventPayload, type RuntimeEventType } from "./runtime-events";
import { assignReservation, updateReservationStage } from "@/lib/data/reservations";
import { buildRuntimeSeed } from "./seed-runtime";
import type { Conversation } from "@/lib/types/conversations";
import type { AIRuntimeState, AIActionMemoryEntry, RuntimeOperationalStatus } from "./types";

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
  liveEvents: [],
  conversations: [],
  conversationSummaries: [],
  reservations: [],
  guests: [],
  escalations: [],
  auditEvents: [],
  aiActionMemory: [],
  operationalFocusLabel: "Monitoring operational signals",
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
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const liveEvents = useAIRuntimeStore((s) => s.liveEvents);
  return useMemo(() => {
    const events = hydrated ? liveEvents : EMPTY_LIVE_EVENTS;
    return limit !== undefined ? events.slice(0, limit) : events;
  }, [hydrated, liveEvents, limit]);
}

export function useOrchestrationPulseMetrics(): OrchestrationPulseMetrics {
  const { hydrated, overview, escalations } = useAIRuntimeStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      overview: s.overview,
      escalations: s.escalations,
    }))
  );

  return useMemo(() => {
    if (!hydrated) {
      return deriveOrchestrationPulse(overview, []);
    }
    return deriveOrchestrationPulse(overview, escalations);
  }, [hydrated, overview, escalations]);
}

export function useOperationalFocusLabel(): string {
  return useAIRuntimeStore((s) => s.operationalFocusLabel);
}

export function useAiActionMemorySlice(limit: number): AIActionMemoryEntry[] {
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const memory = useAIRuntimeStore((s) => s.aiActionMemory);
  return useMemo(() => {
    if (!hydrated) return [];
    return memory.slice(0, limit);
  }, [hydrated, memory, limit]);
}

/** Filters memory by entity without unstable store selectors — derive in component via useMemo on slice + ids. */
export function filterActionMemoryByRefs(
  memory: AIActionMemoryEntry[],
  refs: {
    conversationId?: string;
    reservationId?: string;
    guestId?: string;
  },
  limit = 12
): AIActionMemoryEntry[] {
  return memory
    .filter((m) => {
      if (refs.conversationId && m.conversationId === refs.conversationId) return true;
      if (refs.reservationId && m.reservationId === refs.reservationId) return true;
      if (refs.guestId && m.guestId === refs.guestId) return true;
      return false;
    })
    .slice(0, limit);
}
