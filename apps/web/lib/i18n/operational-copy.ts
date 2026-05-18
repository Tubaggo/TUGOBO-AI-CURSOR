import type { PanelLocale } from "./config";
import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import type { AttributionKind } from "@/lib/runtime/entities";

type Messages = typeof tr;

function messagesFor(locale: PanelLocale): Messages {
  return locale === "en" ? en : tr;
}

export function lifecycleStageLabel(stage: string, locale: PanelLocale = "tr"): string {
  const stages = messagesFor(locale).lifecycle.stages as Record<string, string>;
  return stages[stage] ?? stage.replace(/_/g, " ");
}

export function attributionKindLabel(kind: AttributionKind | string, locale: PanelLocale = "tr"): string {
  const kinds = messagesFor(locale).attribution.kinds as Record<string, string>;
  return kinds[kind] ?? kind.replace(/_/g, " ");
}

export function recoveryKindLabel(kind: string, locale: PanelLocale = "tr"): string {
  const kinds = messagesFor(locale).recovery.kinds as Record<string, string>;
  return kinds[kind] ?? kind;
}

export function recoveryPhaseLabel(phase: string, locale: PanelLocale = "tr"): string {
  const phases = messagesFor(locale).recovery.phases as Record<string, string>;
  return phases[phase] ?? phase;
}

export function memoryVariantLabel(variant: string, locale: PanelLocale = "tr"): string {
  const variants = messagesFor(locale).guests.memoryVariants as Record<string, string>;
  return variants[variant] ?? variant;
}

export function graphNodeLabel(node: string, locale: PanelLocale = "tr"): string {
  const nodes = messagesFor(locale).graph.nodes as Record<string, string>;
  return nodes[node] ?? node;
}

export function orchestrationStatusLabel(status: string, locale: PanelLocale = "tr"): string {
  const statuses = messagesFor(locale).alerts.statuses as Record<string, string>;
  return statuses[status] ?? status.replace(/_/g, " ");
}

export function severityBadgeLabel(severity: string, locale: PanelLocale = "tr"): string {
  const badges = messagesFor(locale).alerts.severity as Record<string, string>;
  return badges[severity] ?? severity;
}
