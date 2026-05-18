import type { PanelLocale } from "./config";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import type { ReservationStage } from "@/lib/runtime/chat-bridge";
import type { EscalationLevel } from "@/lib/runtime/graph/types";

type Messages = typeof tr;

function messagesFor(locale: PanelLocale): Messages {
  return locale === "en" ? en : tr;
}

export function reservationStageLabel(stage: ReservationStage, locale: PanelLocale = "tr"): string {
  return messagesFor(locale).runtime.stages[stage];
}

export function escalationLabel(level: EscalationLevel, locale: PanelLocale = "tr"): string {
  return messagesFor(locale).runtime.escalation[level];
}

export function escalationRiskLabel(
  level: "Low" | "Medium" | "High" | "Critical",
  locale: PanelLocale = "tr"
): string {
  const key = level.toLowerCase() as "low" | "medium" | "high" | "critical";
  return messagesFor(locale).runtime.escalationRisk[key];
}
