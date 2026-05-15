import type { ConfidenceBucket } from "@/lib/types/ai-brain";

type ConfidenceDistributionChartProps = {
  buckets: ConfidenceBucket[];
};

export function ConfidenceDistributionChart({ buckets }: ConfidenceDistributionChartProps) {
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <article className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4">
      <h3 className="mb-4 text-sm font-semibold text-white">Confidence distribution</h3>
      <ul className="space-y-3">
        {buckets.map((b) => (
          <li key={b.label}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-white/50">{b.label}</span>
              <span className="tabular-nums text-white/70">
                {b.count} · {b.pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600/80 to-cyan-400/70 transition-all"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
