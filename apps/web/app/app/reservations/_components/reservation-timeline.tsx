import type { ReservationTimelineEvent, TimelineActorType } from "@/app/app/_types";
import { cn } from "@/lib/utils";

type ReservationTimelineProps = {
  events: ReservationTimelineEvent[];
};

function actorStyles(actor: TimelineActorType): string {
  switch (actor) {
    case "guest":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200/95";
    case "ai":
      return "border-violet-500/35 bg-violet-500/12 text-violet-200/95";
    case "staff":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200/95";
    case "system":
      return "border-zinc-500/35 bg-zinc-800/80 text-zinc-200/90";
    case "payment_gateway":
      return "border-amber-500/30 bg-amber-500/10 text-amber-100/90";
    default: {
      const _a: never = actor;
      return _a;
    }
  }
}

function actorLabel(actor: TimelineActorType): string {
  switch (actor) {
    case "guest":
      return "Guest";
    case "ai":
      return "AI";
    case "staff":
      return "Staff";
    case "system":
      return "System";
    case "payment_gateway":
      return "Payments";
    default: {
      const _a: never = actor;
      return _a;
    }
  }
}

export function ReservationTimeline({ events }: ReservationTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <section>
      <header className="mb-4 flex items-baseline justify-between gap-2 border-b border-white/[0.07] pb-2">
        <h2 className="text-sm font-semibold tracking-tight text-white">Reservation timeline</h2>
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/32">
          Operational trace
        </span>
      </header>
      <ol className="relative space-y-0 pl-1">
        <div
          className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-blue-500/40 via-white/10 to-transparent"
          aria-hidden
        />
        {sorted.map((ev, idx) => (
          <li key={ev.id} className="relative flex gap-3 pb-6 last:pb-0">
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full ring-4 ring-zinc-950",
                  idx === sorted.length - 1 ? "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.45)]" : "bg-white/25"
                )}
              />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    actorStyles(ev.actorType)
                  )}
                >
                  {actorLabel(ev.actorType)}
                </span>
                <time
                  className="text-[11px] tabular-nums text-white/35"
                  dateTime={ev.createdAt}
                >
                  {new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(ev.createdAt))}
                </time>
              </div>
              <p className="mt-2 text-sm leading-snug text-white/82">{ev.description}</p>
              <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-white/28">
                {ev.type.replace(/_/g, " ")}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
