import { getOverviewStats } from "@/lib/data/overview";

export default function AppOverviewPage() {
  const { stats, asOf } = getOverviewStats();
  const asOfLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(asOf));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 flex flex-col gap-1 border-b border-white/[0.06] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
            Operations overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Live posture for arrivals, departures, guest messaging, and revenue signals — data
            layer will connect in a later sprint.
          </p>
        </div>
        <p className="text-xs font-medium tabular-nums text-white/35">Updated {asOfLabel}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4 shadow-sm shadow-black/20"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums">
              {s.value}
            </p>
            {s.hint ? (
              <p className="mt-1.5 text-xs leading-snug text-white/35">{s.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
