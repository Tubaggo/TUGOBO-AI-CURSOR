import type { useOperationalStore } from "./useOperationalStore";

export type OperationalStoreState = ReturnType<typeof useOperationalStore.getState>;

/** Revenue metrics slice (legacy name: metrics) */
export const selectRevenue = (s: OperationalStoreState) => s.revenue;
export const selectRevenueMetrics = selectRevenue;

export const selectAiImpact = (s: OperationalStoreState) => s.aiImpact;
export const selectOtaMetrics = (s: OperationalStoreState) => s.ota;
export const selectRecoveryJourneys = (s: OperationalStoreState) => s.activeRecoveries;
export const selectActiveRecoveries = selectRecoveryJourneys;
export const selectRevenueStories = (s: OperationalStoreState) => s.revenueEvents;
export const selectRevenueEvents = selectRevenueStories;
export const selectReservations = (s: OperationalStoreState) => s.reservations;
export const selectGuests = (s: OperationalStoreState) => s.guests;
export const selectThreads = (s: OperationalStoreState) => s.threads;
export const selectConversations = selectThreads;
export const selectConversationById =
  (conversationId: string) => (s: OperationalStoreState) =>
    s.threads.find((thread) => thread.id === conversationId);
export const selectAuditLog = (s: OperationalStoreState) => s.auditEvents;
export const selectAuditEvents = selectAuditLog;
export const selectAiActions = (s: OperationalStoreState) => s.aiActions;
export const selectAlerts = (s: OperationalStoreState) => s.alerts;
export const selectUnreadAlertCount = (s: OperationalStoreState) =>
  s.alerts.filter((a) => !a.read).length;
export const selectOperationsFeed = (s: OperationalStoreState) => s.operationsFeed;
export const selectMounted = (s: OperationalStoreState) => s.mounted;
export const selectUnifiedTimeline = (s: OperationalStoreState) => s.unifiedTimeline;
export const selectLastPropagation = (s: OperationalStoreState) => s.lastPropagation;
export const selectMutationPulseAt = (s: OperationalStoreState) => s.mutationPulseAt;
