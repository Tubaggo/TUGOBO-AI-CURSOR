"use client";

import { useTranslations } from "next-intl";
import type { ConversationThread, Guest } from "@/lib/runtime/entities";
import { formatEur } from "@/lib/operational/format";
import { ThreadOperationalBadges } from "./thread-operational-badges";
import { cn } from "@/lib/utils";
import { Brain, Banknote, Sparkles, Target } from "lucide-react";

export function OperationalEntityHeader({
  conversation,
  guest,
}: {
  conversation: ConversationThread;
  guest?: Guest;
}) {
  const operationalStatus = guest?.intelligence.operationalStatus ?? conversation.status.replace(/_/g, " ");
  const secured = conversation.attributions.reduce((sum, a) => sum + a.amountEur, 0);
  const exposure = conversation.revenueExposureEur;
  const confidence = guest?.intelligence.aiConfidenceScore;
  const t = useTranslations("entityHeader");
  const memorySignal =
    guest?.memory.recoveryHistory[0] ?? guest?.memory.aiNotes[0] ?? t("runtimeMonitoring");
  const memoryDisplay = memorySignal.length > 42 ? `${memorySignal.slice(0, 40)}…` : memorySignal;

  return (
    <header className="border-b border-white/[0.05] pb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <MotionRuntimeEntityAvatar conversation={conversation} />
          <MotionRuntimeEntityIdentity
            conversation={conversation}
            operationalStatus={operationalStatus}
            statusLabel={t("operationalStatus")}
          />
        </div>
        <ThreadOperationalBadges flags={conversation.flags} />
      </div>
      <MotionRuntimeEntityStats
        secured={secured}
        exposure={exposure}
        confidence={confidence}
        memoryDisplay={memoryDisplay}
        conversation={conversation}
      />
    </header>
  );
}

function MotionRuntimeEntityAvatar({ conversation }: { conversation: ConversationThread }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        conversation.avatarColor
      )}
    >
      {conversation.initials}
    </div>
  );
}

function MotionRuntimeEntityIdentity({
  conversation,
  operationalStatus,
  statusLabel,
}: {
  conversation: ConversationThread;
  operationalStatus: string;
  statusLabel: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-white">{conversation.guestName}</h2>
      <p className="text-[11px] text-cyan-400/80">
        {statusLabel}: <span className="font-medium text-cyan-300">{operationalStatus}</span>
      </p>
      <p className="mt-0.5 text-[11px] text-white/35">
        {conversation.channel} · {conversation.language}
      </p>
    </div>
  );
}

function MotionRuntimeEntityStats({
  secured,
  exposure,
  confidence,
  memoryDisplay,
  conversation,
}: {
  secured: number;
  exposure: number;
  confidence?: number;
  memoryDisplay: string;
  conversation: ConversationThread;
}) {
  const t = useTranslations("entityHeader");
  const financialValue =
    secured > 0
      ? t("secured", { amount: formatEur(secured) })
      : exposure > 0
        ? t("atRisk", { amount: formatEur(exposure) })
        : t("stable");
  const outcomeValue = conversation.flags.recoveryActive
    ? t("recoveryInFlight")
    : secured > 0
      ? t("bookingRetained")
      : t("orchestrating");

  return (
    <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/[0.06] sm:grid-cols-4">
      <RuntimeStat
        icon={Banknote}
        label={t("financialState")}
        value={financialValue}
        tone={exposure > 0 ? "risk" : "revenue"}
      />
      <RuntimeStat
        icon={Sparkles}
        label={t("aiRuntime")}
        value={confidence !== undefined ? t("confidence", { pct: confidence }) : t("monitoring")}
        tone="orchestration"
      />
      <RuntimeStat icon={Brain} label={t("memoryState")} value={memoryDisplay} tone="memory" />
      <RuntimeStat icon={Target} label={t("operationalOutcome")} value={outcomeValue} tone="outcome" />
    </div>
  );
}

function RuntimeStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  tone: "revenue" | "risk" | "orchestration" | "memory" | "outcome";
}) {
  const toneClass = {
    revenue: "text-emerald-400",
    risk: "text-amber-400",
    orchestration: "text-cyan-400",
    memory: "text-violet-400",
    outcome: "text-white/75",
  }[tone];

  return (
    <div className="bg-zinc-950/60 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={cn("h-3 w-3", toneClass)} />
        <p className="text-[9px] font-semibold uppercase tracking-wider text-white/28">{label}</p>
      </div>
      <p className={cn("text-[11px] font-medium leading-snug", toneClass)}>{value}</p>
    </div>
  );
}
