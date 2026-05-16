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
import {
  applyNotificationFromRuntimeEvent,
  buildInitialNotifications,
  resetNotificationIdSequence,
  type OperationalNotification,
} from "@/lib/runtime/operational-notifications";
import { resetDemoSequence } from "@/lib/runtime/demo-mode";

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
  resetRuntime: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  assignEscalationOwner: (escalationId: string, staffName: string) => void;
  resolveEscalation: (escalationId: string) => void;
  markEscalationHumanTakeover: (escalationId: string) => void;
  executeReservationOperation: (
    reservationId: string,
    operation:
      | "send_payment_link"
      | "payment_failed"
      | "payment_success"
      | "confirm"
      | "assign_staff"
      | "human_takeover"
  ) => void;
};

export type OperationsStore = AIRuntimeState & OperationsActions;

/** Alias — legacy hooks reference AI runtime naming. */
export type AIRuntimeStore = OperationsStore;

const initialState: AIRuntimeState = {
  hydrated: false,
  lastPulseAt: 0,
  liveEvents: [],
  notifications: [],
  demoStableMode: true,
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

let runtimeIdCounter = 0;
function nextRuntimeId(prefix: string): string {
  runtimeIdCounter += 1;
  return `${prefix}_${runtimeIdCounter}`;
}

export const useOperationsStore = create<OperationsStore>((set, get) => ({
  ...initialState,

  hydrate: () => {
    if (get().hydrated) return;
    const seed = buildRuntimeSeed();
    resetNotificationIdSequence();
    runtimeIdCounter = 0;
    set({
      ...seed,
      notifications: buildInitialNotifications(seed),
    });
  },

  resetRuntime: () => {
    resetNotificationIdSequence();
    resetDemoSequence();
    runtimeIdCounter = 0;
    const seed = buildRuntimeSeed();
    set({
      ...seed,
      notifications: buildInitialNotifications(seed),
    });
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
        notifications: applyNotificationFromRuntimeEvent(state.notifications, event, next),
        operationalActions: [
          {
            id: nextRuntimeId("op"),
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
          id: nextRuntimeId("intr"),
          createdAt: new Date().toISOString(),
          ...entry,
        },
        ...state.interventions,
      ].slice(0, 64),
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      ...state,
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  assignEscalationOwner: (escalationId, staffName) => {
    set((state) => ({
      ...state,
      lastPulseAt: Date.now(),
      escalations: state.escalations.map((e) =>
        e.id === escalationId ? { ...e, assignedOwner: staffName } : e
      ),
      notifications: state.notifications.map((n) =>
        n.escalationId === escalationId
          ? { ...n, assignedStaff: staffName, actionStatus: "in_progress" as const }
          : n
      ),
      staffAssignments: [
        {
          id: nextRuntimeId("assign"),
          entityKey: escalationId,
          staffName,
          role: "owner" as const,
          state: "assigned" as const,
          note: "Escalation queue ownership",
          updatedAt: new Date().toISOString(),
        },
        ...state.staffAssignments,
      ].slice(0, 48),
    }));
  },

  resolveEscalation: (escalationId) => {
    const now = new Date().toISOString();
    const esc = get().escalations.find((e) => e.id === escalationId);
    get().dispatch("ESCALATION_RESOLVED", {
      conversationId: esc?.conversationId,
      reservationId: esc?.reservationId,
      guestId: esc?.guestId,
      triggerLabel: "Manual resolution",
    });
    set((state) => ({
      ...state,
      escalations: state.escalations.map((e) =>
        e.id === escalationId
          ? {
              ...e,
              resolved: true,
              resolvedAt: now,
              aiConfidenceAfter: Math.min(0.95, (e.aiConfidenceBefore ?? 0.7) + 0.12),
            }
          : e
      ),
      notifications: state.notifications.map((n) =>
        n.escalationId === escalationId
          ? { ...n, actionStatus: "resolved" as const, read: true }
          : n
      ),
      operationalFocusLabel: "Escalation cleared — confidence recovery logged",
    }));
  },

  markEscalationHumanTakeover: (escalationId) => {
    const esc = get().escalations.find((e) => e.id === escalationId);
    if (esc?.conversationId) {
      get().dispatch("HUMAN_TAKEOVER", {
        conversationId: esc.conversationId,
        reservationId: esc.reservationId,
        guestId: esc.guestId,
      });
    }
    set((state) => ({
      ...state,
      escalations: state.escalations.map((e) =>
        e.id === escalationId ? { ...e, humanTakeoverActive: true } : e
      ),
    }));
  },

  executeReservationOperation: (reservationId, operation) => {
    const state = get();
    const reservation = state.reservations.find((r) => r.id === reservationId);
    if (!reservation) return;

    const payload = {
      reservationId,
      conversationId: reservation.conversationId ?? undefined,
      guestId: reservation.guestId,
    };

    switch (operation) {
      case "send_payment_link":
        set((s) => ({
          ...s,
          reservations: s.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  paymentStatus: "awaiting_payment" as const,
                }
              : r
          ),
        }));
        get().dispatch("PAYMENT_LINK_SENT", payload);
        break;
      case "payment_failed":
        set((s) => ({
          ...s,
          reservations: s.reservations.map((r) =>
            r.id === reservationId
              ? { ...r, paymentStatus: "payment_failed" as const }
              : r
          ),
        }));
        get().dispatch("PAYMENT_LINK_FAILED", payload);
        break;
      case "payment_success":
        set((s) => ({
          ...s,
          reservations: s.reservations.map((r) =>
            r.id === reservationId
              ? { ...r, paymentStatus: "paid" as const }
              : r
          ),
        }));
        get().dispatch("PAYMENT_COMPLETED", payload);
        break;
      case "confirm":
        get().setReservationStage(reservationId, "confirmed");
        get().dispatch("PAYMENT_COMPLETED", {
          ...payload,
          triggerLabel: "Reservation confirmed by desk",
        });
        break;
      case "assign_staff":
        get().assignReservationStaff(reservationId, "Ops Lead");
        break;
      case "human_takeover":
        if (reservation.conversationId) {
          get().dispatch("HUMAN_TAKEOVER", payload);
        }
        break;
      default: {
        const _exhaustive: never = operation;
        return _exhaustive;
      }
    }
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

export function useOperationalNotifications(limit?: number): OperationalNotification[] {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const notifications = useOperationsStore((s) => s.notifications);
  return useMemo(() => {
    if (!hydrated) return [];
    return limit !== undefined ? notifications.slice(0, limit) : notifications;
  }, [hydrated, notifications, limit]);
}

export function useUnreadNotificationCount(): number {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const notifications = useOperationsStore((s) => s.notifications);
  return useMemo(() => {
    if (!hydrated) return 0;
    return notifications.filter((n) => !n.read && n.actionStatus !== "dismissed").length;
  }, [hydrated, notifications]);
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
