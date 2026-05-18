import { memoryVariantLabel } from "@/lib/i18n/operational-copy";
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

function variantLabel(variant: MemoryRuntimeEventVariant): string {
  return memoryVariantLabel(variant);
}

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
      label: variantLabel(variant),
      detail: item.line,
    };
  });

  if (intelligence.recoverySuccessRatio >= 70) {
    events.unshift({
      id: "mem-ev-confidence",
      variant: "confidence",
      label: variantLabel("confidence"),
      detail: `Kurtarma ${intelligence.recoverySuccessRatio}% · tamamlama desteği ${intelligence.aiConfidenceScore}%`,
    });
  }

  return events.slice(0, 7);
}
