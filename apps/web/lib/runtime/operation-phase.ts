import type { Reservation } from "@/app/app/_types";
import type { OperationPhaseState } from "@/lib/entities";
import type { AIRuntimeState, RuntimeOperationalStatus } from "./types";

const STATUS_TO_PHASE: Partial<Record<RuntimeOperationalStatus, OperationPhaseState>> = {
  ai_active: "AI_ACTIVE",
  human_active: "HUMAN_REVIEW",
  escalated: "ESCALATED",
  payment_risk: "PAYMENT_RISK",
  vip_flow: "VIP_FLOW",
  workflow_blocked: "ACTION_BLOCKED",
  workflow_paused: "WAITING_GUEST",
  confidence_low: "HUMAN_REVIEW",
};

function reservationPhase(res: Reservation | undefined): OperationPhaseState | null {
  if (!res) return null;
  if (res.status === "confirmed" && res.paymentStatus === "paid") return "CONFIRMED";
  if (res.paymentStatus === "payment_failed" || res.paymentStatus === "overdue") {
    return "PAYMENT_RISK";
  }
  return null;
}

function otaPhase(state: AIRuntimeState, entityId: string): OperationPhaseState | null {
  const wf = state.overview.activeWorkflows.find(
    (w) => w.id === "wf_ota_direct" && w.linkedId === entityId
  );
  if (wf && (wf.status === "running" || wf.status === "paused")) {
    return "OTA_RECOVERY";
  }
  return null;
}

/** Derives sprint phase vocabulary from unified runtime snapshot + entity id (conversation, reservation, or guest). */
export function deriveOperationPhases(state: AIRuntimeState, entityId: string): OperationPhaseState[] {
  const statuses = state.entityStatuses[entityId] ?? [];
  const phases = new Set<OperationPhaseState>();

  for (const s of statuses) {
    const p = STATUS_TO_PHASE[s];
    if (p) phases.add(p);
  }

  const conv = state.conversations.find((c) => c.id === entityId);
  const res =
    state.reservations.find((r) => r.id === entityId) ??
    state.reservations.find((r) => r.conversationId === entityId) ??
    (conv?.reservationId ? state.reservations.find((r) => r.id === conv.reservationId) : undefined);

  const guest =
    state.guests.find((g) => g.id === entityId) ??
    (conv ? state.guests.find((g) => g.id === conv.guestId) : undefined);

  const rp = reservationPhase(res);
  if (rp) phases.add(rp);

  const ota = otaPhase(state, entityId) ?? (res ? otaPhase(state, res.id) : null);
  if (ota) phases.add(ota);

  if (guest?.loyaltyTier === "vip" || guest?.tags.some((t) => /vip/i.test(t))) {
    phases.add("VIP_FLOW");
  }

  if (phases.size === 0 && conv?.aiState === "ai_active") {
    phases.add("AI_ACTIVE");
  }

  return [...phases];
}
