"use client";

import { create } from "zustand";
import type { OperationalAlert, OperationalState } from "../entities";
import type { OperationalEventContext } from "../events/types";
import { dispatchOperationalEvent } from "../events/dispatch";
import type { OperationalEventType } from "../events/types";
import { INITIAL_OPERATIONAL_STATE } from "./initial-state";

type OperationalStore = OperationalState & {
  setMounted: (mounted: boolean) => void;
  dispatch: (type: OperationalEventType, context?: OperationalEventContext) => void;
  triggerPaymentFailure: (context?: OperationalEventContext) => void;
  startRecoveryFlow: (context?: OperationalEventContext) => void;
  completeRecovery: (context?: OperationalEventContext) => void;
  confirmBooking: (context?: OperationalEventContext) => void;
  triggerUpsell: (context?: OperationalEventContext) => void;
  triggerVipEscalation: (context?: OperationalEventContext) => void;
  triggerOtaConversion: (context?: OperationalEventContext) => void;
  triggerHumanTakeover: (context?: OperationalEventContext) => void;
  createAlert: (alert: Omit<OperationalAlert, "id" | "timestamp" | "read">) => void;
  logAIAction: (action: string, rationale: string, context?: OperationalEventContext) => void;
  markAlertRead: (alertId: string) => void;
  pulseLiveMetrics: () => void;
  /** @deprecated use dispatch with PAYMENT_FAILED */
  applyMutation: (
    mutation: "PAYMENT_FAILURE" | "PAYMENT_SUCCESS" | "HUMAN_TAKEOVER" | "OTA_RECOVERY" | "ESCALATION_PREVENTED" | "UPSELL_ACCEPTED",
    payload?: { amountEur?: number; guestLabel?: string; reservationId?: string }
  ) => void;
  /** @deprecated use completeRecovery */
  completePaymentRecovery: () => void;
};

const LEGACY_MAP = {
  PAYMENT_FAILURE: "PAYMENT_FAILED",
  PAYMENT_SUCCESS: "RECOVERY_SUCCESS",
  HUMAN_TAKEOVER: "HUMAN_TAKEOVER",
  OTA_RECOVERY: "OTA_CONVERSION",
  ESCALATION_PREVENTED: "VIP_ESCALATION",
  UPSELL_ACCEPTED: "UPSELL_ACCEPTED",
} as const satisfies Record<string, OperationalEventType>;

export const useOperationalStore = create<OperationalStore>((set, get) => ({
  ...INITIAL_OPERATIONAL_STATE,

  setMounted: (mounted) => set({ mounted }),

  dispatch: (type, context) => {
    if (!get().mounted) return;
    set((state) => dispatchOperationalEvent(state, type, context));
  },

  triggerPaymentFailure: (context) => get().dispatch("PAYMENT_FAILED", context),
  startRecoveryFlow: (context) => get().dispatch("RECOVERY_STARTED", context),
  completeRecovery: (context) => get().dispatch("RECOVERY_SUCCESS", context),
  confirmBooking: (context) => get().dispatch("BOOKING_CONFIRMED", context),
  triggerUpsell: (context) => get().dispatch("UPSELL_ACCEPTED", context),
  triggerVipEscalation: (context) => get().dispatch("VIP_ESCALATION", context),
  triggerOtaConversion: (context) => get().dispatch("OTA_CONVERSION", context),
  triggerHumanTakeover: (context) => get().dispatch("HUMAN_TAKEOVER", context),

  createAlert: (alert) => {
    if (!get().mounted) return;
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: `al-${Date.now()}`,
          timestamp: "Just now",
          read: false,
        },
        ...state.alerts,
      ].slice(0, 20),
    }));
  },

  logAIAction: (action, rationale, context) => {
    if (!get().mounted) return;
    set((state) => ({
      aiActions: [
        {
          id: `ai-${Date.now()}`,
          action,
          rationale,
          timestamp: "Just now",
          financialImpactEur: context?.amountEur,
          reservationId: context?.reservationId,
          conversationId: context?.conversationId,
        },
        ...state.aiActions,
      ].slice(0, 16),
      auditEvents: [
        {
          id: `a-${Date.now()}`,
          action,
          actor: "ai" as const,
          rationale,
          timestamp: "Just now",
          financialImpactEur: context?.amountEur,
          reservationId: context?.reservationId,
        },
        ...state.auditEvents,
      ].slice(0, 24),
    }));
  },

  markAlertRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
    })),

  pulseLiveMetrics: () => {
    if (!get().mounted) return;
    set((state) => ({
      aiImpact: {
        ...state.aiImpact,
        confidenceTrend: [
          ...state.aiImpact.confidenceTrend.slice(1),
          state.aiImpact.aiConfidenceStability,
        ],
      },
    }));
  },

  applyMutation: (mutation, payload) => {
    const type = LEGACY_MAP[mutation];
    get().dispatch(type, {
      amountEur: payload?.amountEur,
      guestLabel: payload?.guestLabel,
      reservationId: payload?.reservationId,
    });
  },

  completePaymentRecovery: () => {
    get().completeRecovery({
      amountEur: 780,
      guestLabel: "Hans Mueller",
      guestId: "g2",
      reservationId: "or2",
      conversationId: "c2",
    });
  },
}));
