import type { RevenueStory } from "@/lib/operational/types";
import { formatEur } from "@/lib/operational/format";
import { Sparkles } from "lucide-react";

export function RevenueStoryCard({ story }: { story: RevenueStory }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/60 p-4 hover:border-white/[0.10] transition-colors">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-snug text-white/90">{story.headline}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/40">{story.narrative}</p>
          <MotionRevenueStoryMeta story={story} />
        </div>
      </div>
    </div>
  );
}

function MotionRevenueStoryMeta({ story }: { story: RevenueStory }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold tabular-nums text-emerald-400">{formatEur(story.amountEur)}</span>
      <span className="text-[10px] text-white/25">·</span>
      <span className="text-[10px] text-white/30">{story.timestamp}</span>
    </div>
  );
}
