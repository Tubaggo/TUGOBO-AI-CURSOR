import { Lightbulb } from "lucide-react";

type AIExplanationCardProps = {
  title?: string;
  explanation: string;
  confidence?: number;
  compact?: boolean;
};

export function AIExplanationCard({
  title = "Why the AI decided this",
  explanation,
  confidence,
  compact = false,
}: AIExplanationCardProps) {
  return (
    <aside
      className={
        compact
          ? "rounded-lg border border-cyan-500/15 bg-cyan-500/[0.05] px-3 py-2.5"
          : "rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] to-zinc-900/50 p-4 ring-1 ring-cyan-500/10"
      }
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/70">
            {title}
          </p>
          <p
            className={
              compact ? "mt-1 text-[11px] leading-relaxed text-white/55" : "mt-2 text-xs leading-relaxed text-white/55"
            }
          >
            {explanation}
          </p>
          {confidence !== undefined ? (
            <p className="mt-2 text-[10px] tabular-nums text-white/35">
              Model confidence · {Math.round(confidence * 100)}%
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
