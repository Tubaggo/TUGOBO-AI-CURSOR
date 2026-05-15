"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  CreditCard,
  LayoutGrid,
  Table2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationPipelineStage } from "@/app/app/_types";
import {
  assignReservation,
  getReservationOrchestrationMetrics,
  updateReservationStage,
} from "@/lib/data/reservations";
import { formatMoney } from "./reservation-formatters";
import { ReservationPipeline } from "./reservation-pipeline";
import { ReservationTable } from "./reservation-table";

type ReservationsOrchestrationWorkspaceProps = {
  initialReservations: Reservation[];
};

export function ReservationsOrchestrationWorkspace({
  initialReservations,
}: ReservationsOrchestrationWorkspaceProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [mode, setMode] = useState<"pipeline" | "table">("pipeline");
  const [toast, setToast] = useState<string | null>(null);

  const metrics = useMemo(() => getReservationOrchestrationMetrics(reservations), [reservations]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleStageChange(id: string, stage: ReservationPipelineStage) {
    setReservations((prev) => updateReservationStage(prev, id, stage));
    showToast("Stage updated (in-memory mock).");
  }

  function handleQuickAssign() {
    const target = reservations.find((r) => r.assignedTo === null && r.urgency === "high");
    if (!target) {
      showToast("No unassigned high-urgency card found.");
      return;
    }
    setReservations((prev) => assignReservation(prev, target.id, "Ops Lead"));
    showToast(`Assigned ${target.code} to Ops Lead (mock).`);
  }

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col px-4 py-6 md:px-6 md:py-8">
      <header className="mb-6 border-b border-white/[0.07] pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/85">
          Reservation orchestration
        </p>
        <div className="mt-1 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Booking pipeline
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/42">
              Conversation-driven reservation control — revenue, payments, and AI actions in one
              operational layer. Drag cards across stages to rehearse handoffs (mock persistence).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("pipeline")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors",
                mode === "pipeline"
                  ? "border-violet-500/35 bg-violet-500/15 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.12]"
              )}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => setMode("table")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors",
                mode === "table"
                  ? "border-violet-500/35 bg-violet-500/15 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.12]"
              )}
            >
              <Table2 className="h-4 w-4" aria-hidden />
              Table
            </button>
          </div>
        </div>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/[0.07] bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 p-4 ring-1 ring-white/[0.03]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/38">
              Active pipeline
            </p>
            <TrendingUp className="h-4 w-4 text-emerald-400/70" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{metrics.pipelineTotal}</p>
          <p className="mt-1 text-xs text-white/36">Reservations in orchestration scope</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 ring-1 ring-amber-500/10">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/75">
              Payment attention
            </p>
            <CreditCard className="h-4 w-4 text-amber-300/80" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-100">{metrics.paymentAttention}</p>
          <p className="mt-1 text-xs text-amber-100/55">
            At-risk value {formatMoney(metrics.paymentAttentionValue, "EUR")}
          </p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-4 ring-1 ring-blue-500/10">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200/75">
              AI on deck
            </p>
            <Bot className="h-4 w-4 text-blue-300/85" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-blue-100">{metrics.aiActiveCount}</p>
          <p className="mt-1 text-xs text-blue-100/55">Qualifying, quoting, or actively responding</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4 ring-1 ring-white/[0.03]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/38">
              Weighted revenue
            </p>
            <Wallet className="h-4 w-4 text-violet-300/75" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-200/95">
            {formatMoney(metrics.weightedRevenue, "EUR")}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-white/36">Excludes pure inquiry + checked-out</p>
            {metrics.criticalUrgency > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-100">
                <AlertCircle className="h-3 w-3" aria-hidden />
                {metrics.criticalUrgency} critical
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/32">
          {mode === "pipeline" ? "Kanban orchestration" : "Compact operational list"}
        </p>
        <button
          type="button"
          onClick={handleQuickAssign}
          className="text-[11px] font-semibold text-violet-300/90 underline-offset-4 hover:underline"
        >
          Auto-assign next high-urgency (mock)
        </button>
      </div>

      {mode === "pipeline" ? (
        <ReservationPipeline reservations={reservations} onStageChange={handleStageChange} />
      ) : (
        <ReservationTable reservations={reservations} />
      )}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] max-w-md -translate-x-1/2 rounded-lg border border-white/[0.12] bg-zinc-900/95 px-4 py-2.5 text-center text-sm text-white/88 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
