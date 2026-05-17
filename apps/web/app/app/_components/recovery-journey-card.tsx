"use client";

import { CheckCircle2, AlertTriangle, Bot, Radio, ShieldCheck } from "lucide-react";
import type { RecoveryJourney, RecoveryJourneyStep } from "@/lib/operational/types";
import { formatEur } from "@/lib/operational/format";
import { cn } from "@/lib/utils";
import { AIReasoningBlock } from "./ai-reasoning-block";

const KIND_LABELS: Record<RecoveryJourney["kind"], string> = {
  failed_payment: "Payment recovery",
  abandoned_booking: "Abandoned booking saved",
  ota_to_direct: "OTA → direct conversion",
  escalation_cancellation: "Escalation prevention",
  takeover_rescue: "Human takeover rescue",
};

const PHASE_ICONS: Record<RecoveryJourneyStep["phase"], typeof Bot> = {
  risk: AlertTriangle,
  ai_intervention: Bot,
  escalation: Radio,
  recovery: ShieldCheck,
  confirmation: CheckCircle2,
};

export function RecoveryJourneyCard({ journey }: { journey: RecoveryJourney }) {
  return (
    <MotionRecoveryJourneyCard journey={journey} />
  );
}

function MotionRecoveryJourneyCard({ journey }: { journey: RecoveryJourney }) {
  return (
    <MotionRecoveryJourneyCardInner journey={journey} />
  );
}

function MotionRecoveryJourneyCardInner({ journey }: { journey: RecoveryJourney }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-900/80 p-5",
        journey.status === "at_risk"
          ? "border-amber-500/25"
          : journey.status === "recovered"
            ? "border-emerald-500/20"
            : "border-white/[0.06]"
      )}
    >
      <MotionRecoveryJourneyHeader journey={journey} />
      <MotionRecoveryJourneyTimeline journey={journey} />
      {journey.reasoning ? (
        <div className="mt-4">
          <AIReasoningBlock reasoning={journey.reasoning} compact />
        </div>
      ) : journey.aiRationale ? (
        <p className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-white/45">
          <span className="font-semibold text-blue-300/90">AI rationale · </span>
          {journey.aiRationale}
        </p>
      ) : null}
    </div>
  );
}

function MotionRecoveryJourneyHeader({ journey }: { journey: RecoveryJourney }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/28">
          {KIND_LABELS[journey.kind]}
        </p>
        <h3 className="text-sm font-semibold text-white">{journey.guestLabel}</h3>
        <p className="text-[11px] text-white/38">{journey.roomLabel}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tabular-nums text-white">{formatEur(journey.bookingValueEur)}</p>
        {journey.revenueSavedEur > 0 ? (
          <p className="text-[11px] font-medium text-emerald-400">Saved {formatEur(journey.revenueSavedEur)}</p>
        ) : (
          <p className="text-[11px] font-medium text-amber-400">Recovery in progress</p>
        )}
      </div>
    </div>
  );
}

function MotionRecoveryJourneyTimeline({ journey }: { journey: RecoveryJourney }) {
  return (
    <div className="relative space-y-0">
      {journey.steps.map((step, i) => (
        <RecoveryStepRow key={step.id} step={step} isLast={i === journey.steps.length - 1} />
      ))}
    </div>
  );
}

function RecoveryStepRow({ step, isLast }: { step: RecoveryJourneyStep; isLast: boolean }) {
  const Icon = PHASE_ICONS[step.phase];
  const colors: Record<RecoveryJourneyStep["phase"], string> = {
    risk: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    ai_intervention: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    escalation: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    recovery: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    confirmation: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <MotionRecoveryStepIcon Icon={Icon} className={colors[step.phase]} />
        {!isLast ? <MotionRecoveryStepConnector /> : null}
      </div>
      <div className={cn("min-w-0 flex-1 pb-4", isLast && "pb-0")}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold text-white/85">{step.title}</p>
          <span className="text-[10px] tabular-nums text-white/25">{step.timestamp}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/38">{step.detail}</p>
        {step.revenueDeltaEur !== undefined ? (
          <p
            className={cn(
              "mt-1 text-[10px] font-semibold tabular-nums",
              step.revenueDeltaEur >= 0 ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {step.revenueDeltaEur >= 0 ? "+" : ""}
            {formatEur(Math.abs(step.revenueDeltaEur))} revenue delta
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MotionRecoveryStepIcon({ Icon, className }: { Icon: typeof Bot; className: string }) {
  return (
    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", className)}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

function MotionRecoveryStepConnector() {
  return <div className="my-1 min-h-[20px] w-px flex-1 bg-white/[0.08]" />;
}
