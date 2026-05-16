import Link from "next/link";
import { ArrowLeft, Bot, MessageSquare, Radio } from "lucide-react";
import type { ReservationDetailPayload } from "@/app/app/_types";
import { RESERVATION_PIPELINE_STAGES } from "@/app/app/_types";
import { cn } from "@/lib/utils";
import { pipelineStageLabel, formatMoney, sourceLabel } from "./reservation-formatters";
import { ReservationTimeline } from "./reservation-timeline";
import { ReservationDetailSidebar } from "./reservation-detail-sidebar";
import { ReservationOrchestrationBand } from "./reservation-orchestration-band";

type ReservationDetailLayoutProps = {
  detail: ReservationDetailPayload;
};

function PipelineRail({ current }: { current: (typeof RESERVATION_PIPELINE_STAGES)[number] }) {
  const idx = RESERVATION_PIPELINE_STAGES.indexOf(current);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">Status progression</h2>
        <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
          <Radio className="h-3 w-3 text-emerald-400/80" aria-hidden />
          Live orchestration
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {RESERVATION_PIPELINE_STAGES.map((stage, i) => {
          const active = stage === current;
          const done = i < idx;
          return (
            <div
              key={stage}
              className={cn(
                "flex min-w-[100px] flex-1 flex-col rounded-lg border px-2 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                active
                  ? "border-blue-500/40 bg-blue-500/15 text-blue-100/95"
                  : done
                    ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-100/75"
                    : "border-white/[0.06] bg-black/20 text-white/35"
              )}
            >
              <span className="leading-tight">{pipelineStageLabel(stage)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReservationDetailLayout({ detail }: ReservationDetailLayoutProps) {
  const { reservation: r, guest, timeline, aiInsight, upsellOpportunities } = detail;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/[0.07] pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/app/reservations"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition-colors hover:text-white/75"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Reservations
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">{r.code}</h1>
            <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/55">
              {pipelineStageLabel(r.status)}
            </span>
            <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-200/90">
              {sourceLabel(r.source)}
            </span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-200/95">
              {formatMoney(r.totalValue, r.currency)}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/42">{r.conversationSummary}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {r.conversationId ? (
            <Link
              href={`/app/conversations/${r.conversationId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/12 px-4 py-2.5 text-[12px] font-semibold text-blue-100/95 transition-colors hover:border-blue-400/45 hover:bg-blue-500/18"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Open conversation
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] px-4 py-2.5 text-[12px] text-white/35">
              No linked conversation
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <PipelineRail current={r.status} />
          <ReservationOrchestrationBand
            reservationId={r.id}
            guestId={r.guestId}
            conversationId={r.conversationId}
          />
          <section className="rounded-xl border border-white/[0.07] bg-zinc-900/35 p-4 md:p-5">
            <header className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-2">
              <Bot className="h-4 w-4 text-violet-300/90" aria-hidden />
              <h2 className="text-sm font-semibold text-white">Guest journey & AI touchpoints</h2>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/[0.06] bg-black/25 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Qualification source
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                  {r.conversationId
                    ? "Thread-native qualification — AI extracted dates, party size, and budget band before human takeover rules applied."
                    : "Non-thread lead — AI used channel metadata and historical BAR to pre-score fit."}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-black/25 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  AI actions on record
                </p>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-white/70">
                  <li>• Dynamic quote with policy guardrails</li>
                  <li>• Payment link orchestration + expiry</li>
                  <li>• Escalation nudges when confidence drops</li>
                </ul>
              </div>
            </div>
          </section>
          <ReservationTimeline events={timeline} />
        </div>
        <aside className="space-y-4 lg:col-span-4">
          {r.conversationId ? (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200/75">
                Linked conversation
              </p>
              <p className="mt-1 font-mono text-[11px] text-blue-100/85">{r.conversationId}</p>
              <p className="mt-2 text-[11px] leading-snug text-blue-100/60">
                Unified inbox context — payments and AI states stay in sync with this reservation.
              </p>
            </div>
          ) : null}
          <ReservationDetailSidebar
            initialReservation={r}
            guest={guest}
            aiInsight={aiInsight}
            upsellOpportunities={upsellOpportunities}
          />
        </aside>
      </div>
    </div>
  );
}
