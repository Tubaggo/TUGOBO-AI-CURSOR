import { cn } from "@/lib/utils";

/** Stable SSR + first-paint shell for live operational widgets. */
export function LivePulsePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hidden max-w-[min(340px,46vw)] shrink flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-right sm:flex md:max-w-[380px]",
        className
      )}
      aria-hidden
    >
      <span className="text-[10px] text-white/28">Operational fabric</span>
    </div>
  );
}

export function OrchestrationPulsePlaceholder() {
  return (
    <div className="hidden items-center gap-2 sm:flex" aria-hidden>
      <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1.5 md:px-3">
        <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-100/70">
          AI Operations Live
        </span>
      </span>
    </div>
  );
}
