"use client";

import Link from "next/link";
import { Brain, FileSearch, ChevronRight } from "lucide-react";
import {
  useOperationalRuntime,
  selectAiImpact,
  selectRevenueMetrics,
  selectMounted,
  selectRevenueStories,
} from "@/stores/operational-runtime";
import { formatEur, formatPct } from "@/lib/operational/format";
import { AiImpactPanel } from "../_components/ai-impact-panel";
import { RevenueStoryCard } from "../_components/revenue-story-card";
import { OtaRecoveryPanel } from "../_components/ota-recovery-panel";

export default function AiBrainPage() {
  const mounted = useOperationalRuntime(selectMounted);
  const ai = useOperationalRuntime(selectAiImpact);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const stories = useOperationalRuntime(selectRevenueStories);

  return (
    <div className="flex-1 overflow-auto">
      <MotionAiBrainPage mounted={mounted} ai={ai} metrics={metrics} stories={stories} />
    </div>
  );
}

function MotionAiBrainPage({
  mounted,
  ai,
  metrics,
  stories,
}: {
  mounted: boolean;
  ai: ReturnType<typeof selectAiImpact>;
  metrics: ReturnType<typeof selectRevenueMetrics>;
  stories: ReturnType<typeof selectRevenueStories>;
}) {
  return (
    <div className="p-7 max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">AI Brain</p>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Brain className="h-5 w-5 text-violet-400" />
            Revenue intelligence core
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            Model performance, confidence stability, and financial contribution — executive-grade AI ops
          </p>
        </div>
        <Link
          href="/app/ai-brain/audit"
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.08]"
        >
          <FileSearch className="h-3.5 w-3.5" />
          Audit & explainability
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <BrainMetric label="AI close rate" value={mounted ? formatPct(ai.aiCloseRate) : "—"} />
        <BrainMetric label="Confidence stability" value={mounted ? formatPct(ai.aiConfidenceStability) : "—"} />
        <BrainMetric label="Revenue influenced" value={mounted ? formatEur(ai.revenueInfluencedByAi, true) : "—"} />
        <BrainMetric label="AI generated revenue" value={mounted ? formatEur(metrics.aiGeneratedRevenue, true) : "—"} />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-5">
          <AiImpactPanel />
        </div>
        <OtaRecoveryPanel />
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-white">AI revenue narratives</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {stories.slice(0, 4).map((s) => (
            <RevenueStoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BrainMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900 p-4">
      <p className="text-lg font-bold tabular-nums text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
