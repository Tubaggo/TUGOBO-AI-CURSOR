import type {
  ConversationThread,
  Guest,
  RecoveryFlow,
  AIAction,
} from "../entities";
import type { PropagationNode, UnifiedTimelineEntry } from "./types";

export type RuntimeStreamNodeKind =
  | "event"
  | "reasoning"
  | "memory"
  | "propagation"
  | "orchestration"
  | "financial"
  | "outcome"
  | "transition";

export type RuntimeStreamNode = {
  id: string;
  kind: RuntimeStreamNodeKind;
  title: string;
  detail?: string;
  timestamp: string;
  financialEur?: number;
  confidence?: number;
  propagationNodes?: PropagationNode[];
};

type BuildStreamInput = {
  conversation: ConversationThread;
  guest?: Guest;
  journeys: RecoveryFlow[];
  timeline: UnifiedTimelineEntry[];
  aiActions: AIAction[];
};

const KIND_FROM_PHASE: Record<RecoveryFlow["steps"][number]["phase"], RuntimeStreamNodeKind> = {
  risk: "event",
  ai_intervention: "reasoning",
  escalation: "orchestration",
  recovery: "financial",
  confirmation: "outcome",
};

export function buildThreadRuntimeStream(input: BuildStreamInput): RuntimeStreamNode[] {
  const { conversation, guest, journeys, timeline, aiActions } = input;
  const nodes: RuntimeStreamNode[] = [];

  const journey = journeys.find((j) => j.conversationId === conversation.id);
  if (journey) {
    for (const step of journey.steps) {
      nodes.push({
        id: `rj-${journey.id}-${step.id}`,
        kind: KIND_FROM_PHASE[step.phase],
        title: step.title,
        detail: step.detail,
        timestamp: step.timestamp,
        financialEur: step.revenueDeltaEur !== undefined ? Math.abs(step.revenueDeltaEur) : undefined,
        confidence: step.phase === "ai_intervention" ? guest?.intelligence.aiConfidenceScore : undefined,
      });
    }
    if (journey.reasoning && journey.status === "active") {
      nodes.push({
        id: `rj-reasoning-${journey.id}`,
        kind: "reasoning",
        title: journey.reasoning.headline,
        detail: journey.reasoning.factors.join(" · "),
        timestamp: journey.steps[journey.steps.length - 1]?.timestamp ?? "Now",
        confidence: journey.reasoning.confidence,
      });
    }
    if (guest && journey.status === "active") {
      nodes.push({
        id: `mem-pattern-${conversation.id}`,
        kind: "memory",
        title: "Memory runtime matched prior successful recovery pattern",
        detail: guest.memory.recoveryHistory[0] ?? "Pattern library synchronized",
        timestamp: "11:25",
      });
    }
    if (journey.status === "active") {
      nodes.push({
        id: `orch-armed-${journey.id}`,
        kind: "orchestration",
        title: "Recovery workflow armed",
        detail: "Alternate payment link selected · human ops standby SLA 12m",
        timestamp: "11:26",
      });
    }
  }

  const threadTimeline = timeline.filter(
    (e) => e.conversationId === conversation.id || e.guestId === conversation.guestId
  );
  for (const entry of threadTimeline) {
    nodes.push({
      id: `tl-${entry.id}`,
      kind: entry.financialImpactEur ? "financial" : "event",
      title: entry.title,
      detail: entry.detail,
      timestamp: entry.timestamp,
      financialEur: entry.financialImpactEur,
      propagationNodes: entry.propagationNodes,
    });
    if (entry.propagationNodes.length > 0) {
      nodes.push({
        id: `prop-${entry.id}`,
        kind: "propagation",
        title: "Operational graph synchronized",
        detail: entry.propagationNodes.map((n) => n.replace(/_/g, " ")).join(" → "),
        timestamp: entry.timestamp,
        propagationNodes: entry.propagationNodes,
      });
    }
  }

  for (const action of aiActions.filter((a) => a.conversationId === conversation.id)) {
    if (!nodes.some((n) => n.title === action.action)) {
      nodes.push({
        id: `ai-${action.id}`,
        kind: "reasoning",
        title: action.action,
        detail: action.rationale,
        timestamp: action.timestamp,
        financialEur: action.financialImpactEur,
      });
    }
  }

  if (conversation.attributions.length > 0) {
    const attr = conversation.attributions[0];
    nodes.push({
      id: `fin-outcome-${conversation.id}`,
      kind: "outcome",
      title: conversation.flags.recoveryActive ? "Revenue secured" : attr.label,
      detail: conversation.flags.recoveryActive ? "Booking retained · graph layers updated" : attr.detail,
      timestamp: conversation.time,
      financialEur: attr.amountEur,
    });
  }

  if (guest && conversation.flags.memoryAttached) {
    const memLine = guest.memory.aiNotes[0] ?? guest.memory.orchestration[0];
    if (memLine && !nodes.some((n) => n.kind === "memory" && n.detail === memLine)) {
      nodes.push({
        id: `mem-live-${conversation.id}`,
        kind: "memory",
        title: "Memory updated",
        detail: memLine,
        timestamp: "Live",
      });
    }
  }

  if (nodes.length === 0) {
    nodes.push({
      id: `idle-${conversation.id}`,
      kind: "transition",
      title: "Orchestration monitoring",
      detail: conversation.lastMessage,
      timestamp: conversation.time,
    });
  }

  return dedupeStreamNodes(nodes);
}

function dedupeStreamNodes(nodes: RuntimeStreamNode[]): RuntimeStreamNode[] {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    const key = `${n.kind}:${n.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
