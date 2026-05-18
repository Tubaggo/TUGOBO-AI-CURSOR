"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { CognitionSnapshot } from "@/lib/runtime/conversation-runtime";
import {
  inferReservationStage,
  resolveReservation,
} from "@/lib/runtime/chat-bridge";
import { escalationRiskLabel, reservationStageLabel } from "@/lib/i18n/runtime-copy";
import type { ConversationThread, Guest } from "@/lib/runtime/entities";
import { formatEur } from "@/lib/operational/format";
import { cn } from "@/lib/utils";
import { Bot, CreditCard, Radio, Shield, Sparkles, Target } from "lucide-react";

export function OperationIntelligencePanel({
  thread,
  cognition,
  pulseActive,
}: {
  thread: ConversationThread;
  guest?: Guest;
  cognition: CognitionSnapshot;
  pulseActive?: boolean;
}) {
  const t = useTranslations("panel");
  const tCommon = useTranslations("common");
  const reservation = resolveReservation(thread.id);
  const stage = inferReservationStage(thread, reservation);
  const aiConfidence = cognition.financial.revenueConfidence;
  const escalationLevel = cognition.escalation.escalationProbability;
  const humanRequired = cognition.escalation.humanRequired;

  const supervisionLabel = humanRequired
    ? t("supervision.staffLed")
    : thread.flags.recoveryActive
      ? t("supervision.recoveryActive")
      : t("supervision.aiSupervising");

  const riskLevel =
    escalationLevel === "Critical" || escalationLevel === "High"
      ? escalationLevel
      : escalationLevel === "Medium"
        ? "Medium"
        : "Low";

  return (
    <aside
      className={cn(
        "flex h-full w-[284px] shrink-0 flex-col border-l border-white/[0.04] bg-zinc-950/50",
        pulseActive && "runtime-cognition-glow"
      )}
    >
      <div className="shrink-0 border-b border-white/[0.04] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
          {t("operationSummary")}
        </p>
        <p className="mt-0.5 text-[11px] text-white/32">{t("companionHint")}</p>
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-lg border px-2.5 py-2",
            humanRequired
              ? "border-rose-500/20 bg-rose-500/[0.06]"
              : "border-blue-500/15 bg-blue-500/[0.05]"
          )}
        >
          <Radio className={cn("h-3 w-3 shrink-0", humanRequired ? "text-rose-400" : "text-blue-400")} />
          <span className="text-[10px] font-medium text-white/55">{supervisionLabel}</span>
        </div>
      </div>

      <div className="conv-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <PanelBlock title={t("reservationStage")}>
          <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
            {reservationStageLabel(stage)}
          </span>
        </PanelBlock>

        <PanelBlock title={t("completionSupport")}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/40">{t("closeLikelihood")}</span>
            <span className="font-semibold tabular-nums text-white/75">{aiConfidence}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500",
                pulseActive && "shadow-[0_0_10px_rgba(59,130,246,0.35)]"
              )}
              style={{ width: `${aiConfidence}%` }}
            />
          </div>
        </PanelBlock>

        <PanelBlock title={t("interventionStatus")}>
          <div className="flex items-center gap-2">
            <Shield
              className={cn(
                "h-3.5 w-3.5",
                escalationLevel === "Critical" || escalationLevel === "High"
                  ? "text-rose-400"
                  : "text-white/30"
              )}
            />
            <span
              className={cn(
                "text-[11px] font-semibold",
                escalationLevel === "Critical" || escalationLevel === "High"
                  ? "text-rose-300/90"
                  : "text-white/50"
              )}
            >
              {t("riskLevel", { level: escalationRiskLabel(riskLevel) })}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-white/45">
            {t("recoveryConfidence")} {cognition.escalation.recoveryConfidence}%
          </p>
        </PanelBlock>

        <PanelBlock title={t("guestSummary")}>
          <p className="text-[12px] leading-relaxed text-white/58">{cognition.interpretation}</p>
        </PanelBlock>

        <PanelBlock title={t("operationalStatus")}>
          <dl className="space-y-2 text-[11px]">
            <Row label={t("channel")} value={thread.channel} />
            <Row label={t("lastActivity")} value={thread.time} />
            <Row label={t("handler")} value={humanRequired ? tCommon("staff") : "Tugobo AI"} />
          </dl>
        </PanelBlock>

        <PanelBlock title={t("paymentRisk")}>
          <div className="flex items-start gap-2">
            <CreditCard
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0",
                thread.flags.paymentRisk ? "text-amber-400" : "text-white/25"
              )}
            />
            <p className="text-[12px] text-white/55">
              {thread.flags.paymentRisk ? t("paymentFriction") : t("noPaymentRisk")}
            </p>
          </div>
          {thread.revenueExposureEur > 0 ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-300/90">
              {formatEur(thread.revenueExposureEur)} {t("atStake")}
            </p>
          ) : null}
        </PanelBlock>

        <PanelBlock title={t("suggestedAction")} highlight>
          <div className="flex gap-2">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/80" />
            <p className="text-[12px] font-medium leading-relaxed text-cyan-100/85">
              {cognition.recommendedAction}
            </p>
          </div>
        </PanelBlock>

        {thread.flags.recoveryActive ? (
          <div className="rounded-lg border border-violet-500/18 bg-violet-500/[0.05] px-3 py-2.5">
            <div className="flex items-center gap-2 text-[10px] font-medium text-violet-300/85">
              <Sparkles className={cn("h-3 w-3", pulseActive && "animate-pulse")} />
              {t("recoveryInProgress")}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[10px] text-white/35">
            <Bot className="h-3 w-3 text-blue-400/70" />
            {t("aiAssistedOps")}
          </div>
        )}
      </div>
    </aside>
  );
}

function PanelBlock({
  title,
  highlight,
  children,
}: {
  title: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3",
        highlight && "border-cyan-500/18 bg-cyan-500/[0.03]"
      )}
    >
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/32">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-white/32">{label}</dt>
      <dd className="font-medium capitalize text-white/70">{value}</dd>
    </div>
  );
}
