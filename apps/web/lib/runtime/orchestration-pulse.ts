import type { AIBrainOverview } from "@/lib/types/ai-brain";
import type { EscalationEvent } from "@/lib/types/ai-brain";
import type { AIActiveWorkflow } from "@/lib/types/ai-brain";

export type OrchestrationFocusItem = {
  id: string;
  label: string;
};

export type OrchestrationPulseMetrics = {
  activeOrchestrations: number;
  escalationCount: number;
  runningAutomations: number;
  runtimeStatus: AIBrainOverview["runtime"]["status"];
  focusItems: OrchestrationFocusItem[];
};

const DEFAULT_FOCUS: OrchestrationFocusItem[] = [
  { id: "monitor", label: "Monitoring guest operations" },
  { id: "sync", label: "Syncing reservation context across modules" },
];

export function deriveOrchestrationPulse(
  overview: AIBrainOverview,
  escalations: EscalationEvent[]
): OrchestrationPulseMetrics {
  const activeEscalations = escalations.filter((e) => !e.resolved).length;
  const running = overview.activeWorkflows.filter((w) => w.status === "running");
  const awaiting = overview.activeWorkflows.filter(
    (w) => w.status === "awaiting_human" || w.status === "escalated"
  );

  const focusItems = buildFocusItems(overview.activeWorkflows, overview.runtime.status);

  return {
    activeOrchestrations: running.length + awaiting.length,
    escalationCount: activeEscalations,
    runningAutomations: running.length,
    runtimeStatus: overview.runtime.status,
    focusItems: focusItems.length > 0 ? focusItems : DEFAULT_FOCUS,
  };
}

function buildFocusItems(
  workflows: AIActiveWorkflow[],
  runtimeStatus: AIBrainOverview["runtime"]["status"]
): OrchestrationFocusItem[] {
  const items: OrchestrationFocusItem[] = [];

  for (const wf of workflows) {
    if (wf.status === "running" && wf.id.includes("payment")) {
      items.push({ id: wf.id, label: "Monitoring payment recovery" });
    } else if (wf.status === "running" && wf.id.includes("ota")) {
      items.push({ id: wf.id, label: "Resolving OTA conversion risk" });
    } else if (wf.status === "running" && wf.id.includes("vip")) {
      items.push({ id: wf.id, label: "VIP arrival orchestration active" });
    } else if (wf.status === "escalated" || wf.status === "awaiting_human") {
      items.push({ id: wf.id, label: "Escalation supervision active" });
    } else if (wf.status === "paused") {
      items.push({ id: wf.id, label: `Workflow paused — ${wf.name}` });
    } else if (wf.status === "blocked") {
      items.push({ id: wf.id, label: `Workflow blocked — ${wf.name}` });
    }
  }

  if (runtimeStatus === "attention") {
    items.push({ id: "attention", label: "Elevated supervision posture" });
  }
  if (runtimeStatus === "degraded") {
    items.push({ id: "degraded", label: "Runtime degraded — reviewing friction signals" });
  }

  return items;
}

export const PRESENCE_HINTS = [
  "Syncing reservation context…",
  "Escalation graph updated",
  "AI confidence recalculated",
  "Guest memory refreshed",
  "Policy triggers evaluated",
  "Cross-module orchestration pulse",
] as const;

export function pickPresenceHint(pulseAt: number, index: number): string {
  if (pulseAt <= 0) return PRESENCE_HINTS[0];
  const i = (Math.floor(pulseAt / 4000) + index) % PRESENCE_HINTS.length;
  return PRESENCE_HINTS[i] ?? PRESENCE_HINTS[0];
}
