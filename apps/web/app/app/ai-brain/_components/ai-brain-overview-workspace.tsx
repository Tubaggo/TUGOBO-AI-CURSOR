"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Euro,
  GitBranch,
  Hand,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { AIBrainOverview, AIWorkflowStatus, AIOperationalAgentRole } from "@/lib/types/ai-brain";
import { AI_OPERATIONAL_AGENT_ROLES } from "@/lib/types/ai-brain";
import { OPERATIONAL_AGENT_LABEL, useAIRuntimeStore } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { AIRuntimeCard } from "./ai-runtime-card";
import { ConfidenceDistributionChart } from "./confidence-distribution-chart";
import { AIExplanationCard } from "./ai-explanation-card";
import { OperationalGraphCard } from "./operational-graph-card";
import { LiveOperationalEventFeed } from "@/app/app/_components/live-operational-event-feed";

const AGENT_FOCUS: Record<AIOperationalAgentRole, string> = {
  reservation_agent: "Pipeline integrity · inventory coupling · stage transitions",
  guest_memory_agent: "Risk posture · sentiment continuity · VIP cues",
  payment_recovery_agent: "PSP orchestration · retry ladders · ledger alignment",
  escalation_supervisor: "Safety rails · confidence gates · human bridges",
  revenue_optimization_agent: "Upsell timing · rate bands · OTA conversion",
};

type AIBrainOverviewWorkspaceProps = {
  overview: AIBrainOverview;
};

const MODULE_HREF: Record<AIBrainOverview["activeWorkflows"][0]["linkedModule"], string> = {
  conversations: "/app/conversations",
  reservations: "/app/reservations",
  guests: "/app/guests",
};

const OUTCOME_TONE: Record<string, string> = {
  success: "text-emerald-300/90",
  pending: "text-amber-300/90",
  blocked: "text-white/40",
  escalated: "text-rose-300/90",
};

const WORKFLOW_STATUS_TONE: Record<AIWorkflowStatus, string> = {
  running: "text-cyan-200/80",
  paused: "text-white/40",
  completed: "text-emerald-300/80",
  awaiting_human: "text-amber-200/85",
  escalated: "text-rose-200/90",
  blocked: "text-white/35",
  resolved: "text-emerald-300/70",
};

export function AIBrainOverviewWorkspace({ overview: serverOverview }: AIBrainOverviewWorkspaceProps) {
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const storeOverview = useAIRuntimeStore((s) => s.overview);
  const lastPulse = useAIRuntimeStore((s) => s.lastPulseAt);
  const overview = hydrated ? storeOverview : serverOverview;
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (lastPulse > 0) setAnimKey((k) => k + 1);
  }, [lastPulse]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <AIBrainPageHeader
        eyebrow="AI Brain"
        title="Hotel AI operations command center"
        description="Operational mind of the property — runtime health, policy triggers, supervised actions, and explainable decisions across conversations, reservations, and guest intelligence."
        asOf={overview.asOfIso}
      />

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIRuntimeCard runtime={overview.runtime} />
        </div>
        <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-rose-300/80" aria-hidden />
            Escalation activity
          </h3>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Metric label="Active" value={overview.escalationActivity.active} tone="rose" />
            <Metric label="Unresolved 24h" value={overview.escalationActivity.unresolved24h} />
            <Metric label="Resolved today" value={overview.escalationActivity.resolvedToday} tone="emerald" />
          </dl>
          <Link
            href="/app/ai-brain/escalations"
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-cyan-300/90 hover:text-cyan-200"
          >
            Open supervision layer
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </article>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Hand}
          label="Human takeover ratio"
          value={`${Math.round(overview.humanTakeoverRatio * 100)}%`}
          hint="Threads where staff assumed control"
        />
        <KpiCard
          icon={Euro}
          label="AI revenue influence"
          value={`€${overview.aiRevenueInfluenceEur.toLocaleString("en-GB")}`}
          hint={`${Math.round(overview.aiRevenueInfluencePct * 100)}% of influenced pipeline (mock)`}
        />
        <KpiCard
          icon={Bot}
          label="Active workflows"
          value={String(overview.activeWorkflows.length)}
          hint="Multi-step orchestration in flight"
        />
        <KpiCard
          icon={TrendingUp}
          label="Policy triggers (24h)"
          value={String(overview.policyTriggers.reduce((s, p) => s + p.count24h, 0))}
          hint="Automated guardrails fired"
        />
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4 xl:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Bot className="h-4 w-4 text-cyan-300/80" aria-hidden />
            Operational agents
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {AI_OPERATIONAL_AGENT_ROLES.map((role) => (
              <li
                key={role}
                className="rounded-lg border border-white/[0.06] bg-black/22 px-3 py-2.5 transition-colors hover:border-white/[0.09]"
              >
                <p className="text-[12px] font-semibold text-white/82">{OPERATIONAL_AGENT_LABEL[role]}</p>
                <p className="mt-1 text-[10px] leading-snug text-white/38">{AGENT_FOCUS[role]}</p>
              </li>
            ))}
          </ul>
        </article>
        <OperationalGraphCard pulse={lastPulse} />
      </section>

      <section className="mb-6">
        <LiveOperationalEventFeed
          compact
          limit={9}
          title="Live operational stream"
          subtitle="Cross-module propagation · agent-attributed signals"
        />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
          <header className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <GitBranch className="h-4 w-4 text-cyan-300/80" aria-hidden />
              Active AI workflows
            </h3>
          </header>
          <ul className="space-y-2">
            {overview.activeWorkflows.map((wf) => (
              <li
                key={`${wf.id}-${animKey}`}
                className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 transition-all duration-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-semibold text-white/85">{wf.name}</p>
                    <p
                      className={cn(
                        "mt-0.5 text-[10px] capitalize",
                        WORKFLOW_STATUS_TONE[wf.status]
                      )}
                    >
                      {wf.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="text-[11px] tabular-nums text-cyan-200/80">{wf.progressPct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      wf.status === "escalated" && "bg-rose-500/70",
                      wf.status === "blocked" && "bg-white/25",
                      wf.status === "resolved" && "bg-emerald-500/70",
                      wf.status === "paused" && "bg-amber-500/50",
                      (wf.status === "running" || wf.status === "awaiting_human") && "bg-cyan-500/70"
                    )}
                    style={{ width: `${wf.progressPct}%` }}
                  />
                </div>
                <Link
                  href={`${MODULE_HREF[wf.linkedModule]}/${wf.linkedId}`}
                  className="mt-2 inline-flex text-[11px] font-medium text-cyan-300/80 hover:text-cyan-200"
                >
                  View in {wf.linkedModule} →
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <ConfidenceDistributionChart buckets={overview.confidenceDistribution} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">AI policy triggers (24h)</h3>
          <ul className="space-y-2">
            {overview.policyTriggers.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
              >
                <span className="text-[12px] text-white/70">{p.label}</span>
                <span className="text-[11px] tabular-nums text-white/45">{p.count24h}×</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-amber-300/80" aria-hidden />
            Action execution feed
          </h3>
          <ul className="space-y-3">
            {overview.actionFeed.map((item) => (
              <li key={item.id} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-semibold text-white/80">{item.actionName}</p>
                  <span className={cn("text-[10px] font-bold uppercase", OUTCOME_TONE[item.outcome])}>
                    {item.outcome}
                  </span>
                </div>
                {item.agentRole ? (
                  <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-white/28">
                    {OPERATIONAL_AGENT_LABEL[item.agentRole]}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-white/40">{item.explanation}</p>
                <p className="mt-1 text-[10px] tabular-nums text-white/30">
                  {Math.round(item.confidence * 100)}% confidence
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.conversationId ? (
                    <Link
                      href={`/app/conversations/${item.conversationId}`}
                      className="text-[10px] font-semibold text-cyan-300/80 hover:text-cyan-200"
                    >
                      Conversation →
                    </Link>
                  ) : null}
                  {item.reservationId ? (
                    <Link
                      href={`/app/reservations/${item.reservationId}`}
                      className="text-[10px] font-semibold text-cyan-300/80 hover:text-cyan-200"
                    >
                      Reservation →
                    </Link>
                  ) : null}
                  {item.guestId ? (
                    <Link
                      href={`/app/guests/${item.guestId}`}
                      className="text-[10px] font-semibold text-cyan-300/80 hover:text-cyan-200"
                    >
                      Guest →
                    </Link>
                  ) : null}
                  <Link
                    href="/app/ai-brain/audit"
                    className="text-[10px] font-semibold text-white/28 hover:text-white/45"
                  >
                    Audit →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/app/ai-brain/actions"
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-cyan-300/90"
          >
            Manage capabilities
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </article>
      </section>

      <AIExplanationCard
        explanation="Supervision posture is elevated due to payment friction on a honeymoon hold and sentiment guard on a direct loyalist thread. AI continues autonomous messaging only above confidence gates defined in Actions."
        confidence={0.86}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "rose" | "emerald";
}) {
  return (
    <div>
      <dt className="text-[10px] text-white/35">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums",
          tone === "rose" && "text-rose-200/90",
          tone === "emerald" && "text-emerald-200/90",
          !tone && "text-white/88"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
      <Icon className="mb-2 h-4 w-4 text-cyan-300/70" aria-hidden />
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[11px] text-white/35">{hint}</p>
    </article>
  );
}
