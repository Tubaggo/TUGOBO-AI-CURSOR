import {
  getAiAttentionItems,
  getOperationsFeed,
  getOverviewStats,
  getTodaysArrivalFocus,
} from "@/lib/data/overview";
import { OverviewOperationsPanels } from "../_components/overview-operations-panels";
import { OverviewLiveLayer } from "../_components/overview-live-layer";

export default function AppOverviewPage() {
  const { stats, asOf } = getOverviewStats();
  const feed = getOperationsFeed();
  const arrivals = getTodaysArrivalFocus();
  const attention = getAiAttentionItems();

  const asOfLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(asOf));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 flex flex-col gap-2 border-b border-white/[0.07] pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-400/80">
            Command center
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-white md:text-xl">
            Operations overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/42">
            Executive command surface — revenue posture, supervised automation, and the live
            operational fabric across conversations, reservations, and guest intelligence.
          </p>
        </div>
        <p className="text-xs font-medium tabular-nums text-white/32">Refreshed {asOfLabel}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-white/[0.07] bg-zinc-900/55 p-4 shadow-sm shadow-black/25 ring-1 ring-white/[0.02]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/38">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums">{s.value}</p>
            {s.hint ? (
              <p className="mt-1.5 text-xs leading-snug text-white/36">{s.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <OverviewLiveLayer />
      <OverviewOperationsPanels feed={feed} arrivals={arrivals} attention={attention} />
    </div>
  );
}
