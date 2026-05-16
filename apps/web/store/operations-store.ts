"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  InterventionLogEntry,
  OperationPhaseState,
  StaffAssignment,
  StaffNoteEntry,
} from "@/lib/entities";
import { assignReservation, updateReservationStage } from "@/lib/data/reservations";
import type { Conversation } from "@/lib/types/conversations";
import { applyRuntimeEvent } from "@/lib/runtime/orchestration-engine";
import { deriveOperationPhases } from "@/lib/runtime/operation-phase";
import { buildRuntimeSeed } from "@/lib/runtime/seed-runtime";
import type { AIRuntimeState, AIActionMemoryEntry, RuntimeOperationalStatus } from "@/lib/runtime/types";
import type { LiveOperationalEvent } from "@/lib/runtime/live-events";
import { LIVE_EVENT_CATALOG } from "@/lib/runtime/live-events";
import { deriveOrchestrationPulse, type OrchestrationPulseMetrics } from "@/lib/runtime/orchestration-pulse";
import {
  applyHeartbeatToEvents,
  nextHeartbeatEvent,
} from "@/lib/runtime/heartbeat-events";
import {
  createRuntimeEvent,
  type RuntimeEventPayload,
  type RuntimeEventType,
} from "@/lib/runtime/runtime-events";

type StaffAssignmentPayload = {
  staffName: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  role?: "owner" | "collaborator" | "supervisor";
  state?: "assigned" | "handoff" | "supervisor_routed";
  note?: string;
};

type OperationsActions = {
  hydrate: () => void;
  /** Low-frequency ambient pulse — appends live event without entity mutation. */
  emitHeartbeat: () => void;
  dispatch: (type: RuntimeEventType, payload: RuntimeEventPayload) => void;
  setReservationStage: (
    reservationId: string,
    stage: AIRuntimeState["reservations"][0]["status"]
  ) => void;
  assignReservationStaff: (reservationId: string, staffName: string) => void;
  assignOperationalStaff: (args: StaffAssignmentPayload) => void;
  recordStaffNote: (note: Omit<StaffNoteEntry, "id" | "createdAt">) => void;
  logSupervisorIntervention: (entry: Omit<InterventionLogEntry, "id" | "createdAt">) => void;
};

export type OperationsStore = AIRuntimeState & OperationsActions;

/** Alias — legacy hooks reference AI runtime naming. */
export type AIRuntimeStore = OperationsStore;

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
  operationalActions: [],
  aiActionMemory: [],
  staffAssignments: [],
  staffNotes: [],
  interventions: [],
  guestAiMemory: {},
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

const EMPTY_ENTITY_STATUSES: RuntimeOperationalStatus[] = [];
const EMPTY_OPERATION_PHASES: OperationPhaseState[] = [];
const EMPTY_AI_ACTION_MEMORY: AIActionMemoryEntry[] = [];

export const useOperationsStore = create<OperationsStore>((set, get) => ({
  ...initialState,

  hydrate: () => {
    if (get().hydrated) return;
    set(buildRuntimeSeed());
  },

  emitHeartbeat: () => {
    const event = nextHeartbeatEvent();
    set((state) => ({
      ...state,
      lastPulseAt: Date.now(),
      operationalFocusLabel: event.title,
      liveEvents: applyHeartbeatToEvents(state.liveEvents, event),
      overview: {
        ...state.overview,
        asOfIso: new Date().toISOString(),
        runtime: {
          ...state.overview.runtime,
          lastHealthCheckAt: new Date().toISOString(),
        },
      },
    }));
  },

  dispatch: (type, payload) => {
    const event = createRuntimeEvent(type, payload);
    set((state) => {
      let next = applyRuntimeEvent(state, event);
      const catalog = LIVE_EVENT_CATALOG[type];
      next = {
        ...next,
        operationalActions: [
          {
            id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            label: catalog.title,
            runtimeEventType: type,
            outcome: "propagated" as const,
            createdAt: new Date().toISOString(),
            conversationId: payload.conversationId,
            reservationId: payload.reservationId,
            guestId: payload.guestId,
          },
          ...next.operationalActions,
        ].slice(0, 64),
      };
      return next;
    });
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
      staffAssignments: [
        {
          id: `assign_${Date.now()}`,
          entityKey: reservationId,
          staffName,
          role: "owner" as const,
          state: "assigned" as const,
          note: "Reservation desk ownership",
          updatedAt: new Date().toISOString(),
          reservationId,
        },
        ...state.staffAssignments,
      ].slice(0, 48),
    }));
  },

  assignOperationalStaff: (args) => {
    const entityKey = args.conversationId ?? args.reservationId ?? args.guestId ?? "entity";
    set((state) => ({
      ...state,
      lastPulseAt: Date.now(),
      staffAssignments: [
        {
          id: `assign_${Date.now()}`,
          entityKey,
          staffName: args.staffName,
          role: (args.role ?? "collaborator") satisfies StaffAssignment["role"],
          state: (args.state ?? "assigned") satisfies StaffAssignment["state"],
          note: args.note,
          updatedAt: new Date().toISOString(),
          conversationId: args.conversationId,
          reservationId: args.reservationId,
          guestId: args.guestId,
        },
        ...state.staffAssignments,
      ].slice(0, 48),
    }));
  },

  recordStaffNote: (note) => {
    set((state) => ({
      ...state,
      staffNotes: [
        {
          id: `note_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...note,
        },
        ...state.staffNotes,
      ].slice(0, 96),
    }));
  },

  logSupervisorIntervention: (entry) => {
    set((state) => ({
      ...state,
      interventions: [
        {
          id: `intr_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...entry,
        },
        ...state.interventions,
      ].slice(0, 64),
    }));
  },
}));

/** @deprecated Prefer useOperationsStore — kept for module compatibility. */
export const useAIRuntimeStore = useOperationsStore;

export function useRuntimeEntityStatuses(
  entityId: string | undefined
): RuntimeOperationalStatus[] {
  return useOperationsStore((s) => {
    if (!entityId) return EMPTY_ENTITY_STATUSES;
    return s.entityStatuses[entityId] ?? EMPTY_ENTITY_STATUSES;
  });
}

export function useOperationPhasesForEntity(
  entityId: string | undefined
): OperationPhaseState[] {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const entityStatuses = useOperationsStore((s) => s.entityStatuses);
  const conversations = useOperationsStore((s) => s.conversations);
  const reservations = useOperationsStore((s) => s.reservations);
  const guests = useOperationsStore((s) => s.guests);
  const activeWorkflows = useOperationsStore((s) => s.overview.activeWorkflows);

  return useMemo(() => {
    if (!entityId || !hydrated) return EMPTY_OPERATION_PHASES;
    return deriveOperationPhases(
      {
        entityStatuses,
        conversations,
        reservations,
        guests,
        overview: { activeWorkflows },
      } as AIRuntimeState,
      entityId
    );
  }, [
    entityId,
    hydrated,
    entityStatuses,
    conversations,
    reservations,
    guests,
    activeWorkflows,
  ]);
}

export function useRuntimeConversation(id: string): Conversation | undefined {
  return useOperationsStore((s) => s.conversations.find((c) => c.id === id));
}

export function useRuntimeConversationDetail(activeId: string | null): Conversation | null {
  return useOperationsStore((s) => {
    if (!activeId) return null;
    return s.conversations.find((c) => c.id === activeId) ?? null;
  });
}

export function useRuntimePulse(): number {
  return useOperationsStore((s) => s.lastPulseAt);
}

const EMPTY_LIVE_EVENTS: LiveOperationalEvent[] = [];

export function useLiveOperationalEvents(limit?: number): LiveOperationalEvent[] {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const liveEvents = useOperationsStore((s) => s.liveEvents);
  return useMemo(() => {
    const events = hydrated ? liveEvents : EMPTY_LIVE_EVENTS;
    return limit !== undefined ? events.slice(0, limit) : events;
  }, [hydrated, liveEvents, limit]);
}

export function useOrchestrationPulseMetrics(): OrchestrationPulseMetrics {
  const { hydrated, overview, escalations } = useOperationsStore(
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
  return useOperationsStore((s) => s.operationalFocusLabel);
}

export function useAiActionMemorySlice(limit: number): AIActionMemoryEntry[] {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const memory = useOperationsStore((s) => s.aiActionMemory);
  return useMemo(() => {
    if (!hydrated) return EMPTY_AI_ACTION_MEMORY;
    return memory.slice(0, limit);
  }, [hydrated, memory, limit]);
}

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
