import type { AiAttentionItem, OperationsFeedItem, TodayArrival } from "@/app/app/_types";

function shortAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function feedAccent(kind: OperationsFeedItem["kind"]): string {
  switch (kind) {
    case "ai_qualification":
      return "border-l-blue-500/80";
    case "payment":
      return "border-l-amber-500/75";
    case "guest_request":
      return "border-l-sky-500/75";
    case "reservation":
      return "border-l-violet-500/75";
    case "system":
      return "border-l-zinc-500/60";
    default: {
      const _k: never = kind;
      return _k;
    }
  }
}

function arrivalStatusLabel(status: TodayArrival["status"]): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "in_transit":
      return "On approach";
    case "pending_docs":
      return "ID pending";
    default: {
      const _s: never = status;
      return _s;
    }
  }
}

function arrivalStatusStyle(status: TodayArrival["status"]): string {
  switch (status) {
    case "confirmed":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300/95";
    case "in_transit":
      return "border-sky-500/25 bg-sky-500/10 text-sky-300/95";
    case "pending_docs":
      return "border-amber-500/25 bg-amber-500/10 text-amber-200/90";
    default: {
      const _s: never = status;
      return _s;
    }
  }
}

function attentionStyles(severity: AiAttentionItem["severity"]): { bar: string; badge: string } {
  switch (severity) {
    case "critical":
      return {
        bar: "bg-rose-500/90",
        badge: "border-rose-500/30 bg-rose-500/10 text-rose-200/95",
      };
    case "warning":
      return {
        bar: "bg-amber-500/85",
        badge: "border-amber-500/25 bg-amber-500/10 text-amber-100/90",
      };
    case "info":
      return {
        bar: "bg-blue-500/80",
        badge: "border-blue-500/25 bg-blue-500/10 text-blue-200/90",
      };
    default: {
      const _s: never = severity;
      return _s;
    }
  }
}

type OverviewPanelsProps = {
  feed: OperationsFeedItem[];
  arrivals: TodayArrival[];
  attention: AiAttentionItem[];
};

export function OverviewOperationsPanels({ feed, arrivals, attention }: OverviewPanelsProps) {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
      <section className="lg:col-span-7">
        <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2">
          <h2 className="text-sm font-semibold tracking-tight text-white">Live operations feed</h2>
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/35">
            Last hour
          </span>
        </div>
        <div className="space-y-2">
          {feed.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl border border-white/[0.06] border-l-2 bg-zinc-900/45 py-3 pl-4 pr-3 shadow-sm shadow-black/15 ${feedAccent(item.kind)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium leading-snug text-white/90">{item.headline}</h3>
                <time
                  className="shrink-0 tabular-nums text-[11px] text-white/35"
                  dateTime={item.occurredAtIso}
                >
                  {shortAgo(item.occurredAtIso)}
                </time>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:col-span-5">
        <section>
          <div className="mb-3 border-b border-white/[0.06] pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-white">Today&apos;s arrival focus</h2>
            <p className="mt-0.5 text-[11px] text-white/35">Cut-off times and room readiness</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/35 p-1">
            <ul className="divide-y divide-white/[0.05]">
              {arrivals.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-3 py-2.5">
                  <div className="mt-0.5 min-w-[3rem] text-right">
                    <p className="text-xs font-semibold tabular-nums text-white/85">{a.checkInTime}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/90">{a.guestName}</p>
                    <p className="truncate text-[11px] text-white/40">{a.roomType}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${arrivalStatusStyle(a.status)}`}
                  >
                    {arrivalStatusLabel(a.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mb-3 border-b border-white/[0.06] pb-2">
            <h2 className="text-sm font-semibold tracking-tight text-white">AI attention needed</h2>
            <p className="mt-0.5 text-[11px] text-white/35">Review before guest-facing send</p>
          </div>
          <div className="space-y-2">
            {attention.map((item) => {
              const { bar, badge } = attentionStyles(item.severity);
              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-white/[0.06] bg-zinc-900/40 py-2.5 pl-2 pr-3 shadow-sm shadow-black/10"
                >
                  <div className={`mt-1.5 w-1 shrink-0 self-stretch rounded-full ${bar}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-white/90">{item.title}</h3>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${badge}`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
