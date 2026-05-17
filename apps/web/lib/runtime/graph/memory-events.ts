import type { GuestIntelligence, GuestMemory } from "./types";

export type MemoryRuntimeEventVariant =
  | "updated"
  | "pattern"
  | "confidence"
  | "escalation"
  | "recovery"
  | "preference";

export type MemoryRuntimeEvent = {
  id: string;
  variant: MemoryRuntimeEventVariant;
  label: string;
  detail: string;
};

const VARIANT_LABELS: Record<MemoryRuntimeEventVariant, string> = {
  updated: "Memory updated",
  pattern: "Pattern matched",
  confidence: "Confidence increased",
  escalation: "Escalation sensitivity detected",
  recovery: "Recovery tolerance upgraded",
  preference: "Preference signal",
};

function classifyLine(line: string): MemoryRuntimeEventVariant {
  const lower = line.toLowerCase();
  if (lower.includes("recovery") && (lower.includes("succeeded") || lower.includes("pattern"))) return "pattern";
  if (lower.includes("confidence") || lower.includes("probability")) return "confidence";
  if (lower.includes("escalation") || lower.includes("policy") || lower.includes("sensitive")) return "escalation";
  if (lower.includes("recovery") || lower.includes("split")) return "recovery";
  if (lower.includes("prefers") || lower.includes("whatsapp") || lower.includes("channel")) return "preference";
  return "updated";
}

export function memoryToRuntimeEvents(
  memory: GuestMemory,
  intelligence: GuestIntelligence
): MemoryRuntimeEvent[] {
  const lines: { line: string; section: string }[] = [
    ...memory.operational.map((line) => ({ line, section: "operational" })),
    ...memory.recoveryHistory.map((line) => ({ line, section: "recovery" })),
    ...memory.aiNotes.map((line) => ({ line, section: "ai" })),
    ...memory.orchestration.map((line) => ({ line, section: "orch" })),
    ...memory.preferences.map((line) => ({ line, section: "pref" })),
    ...memory.escalationHistory.map((line) => ({ line, section: "esc" })),
    ...memory.financial.map((line) => ({ line, section: "fin" })),
  ];

  const events = lines.slice(0, 6).map((item, i) => {
    const variant = classifyLine(item.line);
    return {
      id: `mem-ev-${item.section}-${i}`,
      variant,
      label: VARIANT_LABELS[variant],
      detail: item.line,
    };
  });

  if (intelligence.recoverySuccessRatio >= 70) {
    events.unshift({
      id: "mem-ev-confidence",
      variant: "confidence",
      label: VARIANT_LABELS.confidence,
      detail: `Recovery confidence ${intelligence.recoverySuccessRatio}% · AI runtime ${intelligence.aiConfidenceScore}%`,
    });
  }

  return events.slice(0, 7);
}
