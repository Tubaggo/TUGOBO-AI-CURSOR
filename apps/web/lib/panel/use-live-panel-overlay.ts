"use client";

import { useMemo } from "react";
import {
  useOperationalRuntime,
  selectMounted,
  selectConversations,
  selectRevenueMetrics,
  selectReservations,
} from "@/stores/operational-runtime";
import { buildCognitionSnapshot } from "@/lib/runtime/conversation-runtime";
import {
  selectGuests,
  selectRecoveryJourneys,
} from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import type { ConversationStatus } from "@/app/dashboard/_components/mock-data";

export type LiveQueueStats = {
  activeCount: string;
  pendingRevenue: string;
  confirmedCount: string;
};

export type LiveConvOverlay = {
  status?: ConversationStatus;
  lastMessage?: string;
  unread?: number;
  paymentRisk?: boolean;
  recoveryActive?: boolean;
};

export function useLivePanelOverlay(selectedConvId: string) {
  const mounted = useOperationalRuntime(selectMounted);
  const threads = useOperationalRuntime(selectConversations);
  const guests = useOperationalRuntime(selectGuests);
  const journeys = useOperationalRuntime(selectRecoveryJourneys);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const reservations = useOperationalRuntime(selectReservations);

  const queueStats: LiveQueueStats = useMemo(
    () => ({
      activeCount: String(threads.filter((t) => t.status !== "resolved").length),
      pendingRevenue: formatEur(metrics.revenueAtRisk, true),
      confirmedCount: String(
        reservations.filter((r) => r.currentStage === "confirmation" || r.currentStage === "upsell").length
      ),
    }),
    [threads, metrics.revenueAtRisk, reservations]
  );

  const convOverlays = useMemo(() => {
    const map: Record<string, LiveConvOverlay> = {};
    for (const t of threads) {
      map[t.id] = {
        status: t.status as ConversationStatus,
        lastMessage: t.lastMessage,
        unread: t.unread,
        paymentRisk: t.flags.paymentRisk,
        recoveryActive: t.flags.recoveryActive,
      };
    }
    return map;
  }, [threads]);

  const cognition = useMemo(() => {
    const thread = threads.find((t) => t.id === selectedConvId);
    if (!thread) return null;
    const guest = guests.find((g) => g.id === thread.guestId);
    const journey = journeys.find((j) => j.conversationId === thread.id);
    return buildCognitionSnapshot(thread, guest, journey);
  }, [threads, guests, journeys, selectedConvId]);

  const liveMetrics = useMemo(
    () => ({
      directRevenue: metrics.aiInfluencedRevenue,
      otaSavings: metrics.otaCommissionAvoided,
      activeOps: threads.filter((t) => t.status !== "resolved").length,
      pendingApprovals: reservations.filter(
        (r) => r.currentStage === "quote" || r.currentStage === "payment_pending"
      ).length,
    }),
    [metrics, threads, reservations]
  );

  return { mounted, queueStats, convOverlays, cognition, liveMetrics };
}
