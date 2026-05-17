"use client";

import { useMemo, useState } from "react";
import { Bot, Radio, Banknote, ShieldCheck } from "lucide-react";
import {
  useOperationalRuntime,
  selectConversations,
  selectRevenueMetrics,
  selectMounted,
  selectRecoveryJourneys,
  selectGuests,
  selectUnifiedTimeline,
  selectAiActions,
} from "@/stores/operational-runtime";
import {
  buildCognitionSnapshot,
  buildOperationalTimelineEvents,
  buildPropagationCausality,
} from "@/lib/runtime/conversation-runtime";
import { formatEur } from "@/lib/operational/format";
import { useMutationPulse } from "@/lib/runtime/hooks/use-mutation-pulse";
import { cn } from "@/lib/utils";
import { GuestRuntimeQueue } from "./_components/guest-runtime-queue";
import { OperationalTimeline } from "./_components/operational-timeline";
import { PropagationCausalityStrip } from "./_components/propagation-causality-strip";
import { AiCognitionLayer } from "./_components/ai-cognition-layer";
import { GraphPropagationEngine } from "../_components/graph-propagation-engine";

export default function ConversationsPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const conversations = useOperationalRuntime(selectConversations);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const journeys = useOperationalRuntime(selectRecoveryJourneys);
  const guests = useOperationalRuntime(selectGuests);
  const timeline = useOperationalRuntime(selectUnifiedTimeline);
  const aiActions = useOperationalRuntime(selectAiActions);
  const pulseActive = useMutationPulse(4000);

  const triggerPaymentFailure = useOperationalRuntime((s) => s.triggerPaymentFailure);
  const completeRecovery = useOperationalRuntime((s) => s.completeRecovery);
  const triggerHumanTakeover = useOperationalRuntime((s) => s.triggerHumanTakeover);
  const triggerUpsell = useOperationalRuntime((s) => s.triggerUpsell);
  const triggerOtaConversion = useOperationalRuntime((s) => s.triggerOtaConversion);

  const [selectedId, setSelectedId] = useState(conversations[1]?.id ?? conversations[0]?.id);
  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];
  const guest = guests.find((g) => g.id === selected?.guestId);
  const journey = journeys.find((j) => j.conversationId === selected?.id);

  const timelineEvents = useMemo(() => {
    if (!selected) return [];
    return buildOperationalTimelineEvents({
      conversation: selected,
      guest,
      journeys,
      timeline,
      aiActions,
    });
  }, [selected, guest, journeys, timeline, aiActions]);

  const cognition = useMemo(() => {
    if (!selected) return null;
    return buildCognitionSnapshot(selected, guest, journey);
  }, [selected, guest, journey]);

  const causalitySteps = useMemo(() => {
    if (!selected) return [];
    return buildPropagationCausality(selected, guest);
  }, [selected, guest]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/[0.05] bg-zinc-950/85 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400/50">
              Conversations
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Guest operations
            </h1>
            <p className="mt-0.5 text-sm text-white/36">
              Live guest flow · revenue at risk · recovery in progress
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            <MetricStrip label="Recovered today" value={mounted ? formatEur(metrics.revenueRecoveredToday, true) : "—"} />
            <MetricStrip label="At risk" value={mounted ? formatEur(metrics.revenueAtRisk) : "—"} variant="risk" />
            <MetricStrip label="AI influenced" value={mounted ? formatEur(metrics.aiInfluencedRevenue, true) : "—"} />
            <MetricStrip label="Recovery rate" value={mounted ? `${metrics.recoverySuccessRate}%` : "—"} />
          </div>
        </div>
        {mounted ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.04] pt-3">
            <DemoButton icon={Banknote} label="Payment risk" onClick={() => triggerPaymentFailure()} />
            <DemoButton icon={ShieldCheck} label="Recover payment" onClick={() => completeRecovery()} />
            <DemoButton icon={Radio} label="Human takeover" onClick={() => triggerHumanTakeover()} />
            <DemoButton icon={Bot} label="Upsell" onClick={() => triggerUpsell()} />
            <DemoButton
              icon={ShieldCheck}
              label="OTA convert"
              onClick={() => triggerOtaConversion({ guestLabel: "Sophie Martin", guestId: "g3" })}
            />
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <GuestRuntimeQueue
          conversations={conversations}
          guests={guests}
          journeys={journeys}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          pulseActive={pulseActive}
        />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="shrink-0 border-b border-white/[0.04] px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{selected.guestName}</h2>
                    <p className="text-[11px] text-white/35">
                      {guest?.intelligence.operationalStatus ?? selected.channel} ·{" "}
                      {selected.language}
                      {selected.revenueExposureEur > 0
                        ? ` · ${formatEur(selected.revenueExposureEur)} exposure`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
                      pulseActive
                        ? "border-cyan-500/25 bg-cyan-500/[0.06] text-cyan-300/90"
                        : "border-white/10 text-white/35"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full bg-cyan-400",
                        pulseActive && "animate-pulse"
                      )}
                    />
                    {pulseActive ? "Updating" : "All clear"}
                  </span>
                </div>
                <div className="mt-3">
                  <PropagationCausalityStrip steps={causalitySteps} />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto conv-scroll px-5 py-4">
                <OperationalTimeline events={timelineEvents} />
                <div className="mt-6">
                  <GraphPropagationEngine embedded variant="operational" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-white/30">
              Select a guest
            </div>
          )}
        </section>

        {cognition ? <AiCognitionLayer cognition={cognition} pulseActive={pulseActive} /> : null}
      </div>
    </div>
  );
}

function MetricStrip({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "risk";
}) {
  return (
    <div>
      <p className="text-[10px] text-white/30">{label}</p>
      <p
        className={cn(
          "text-sm font-bold tabular-nums",
          variant === "risk" ? "text-amber-400" : "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DemoButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Banknote;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-cyan-500/20 hover:text-cyan-200/90"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
