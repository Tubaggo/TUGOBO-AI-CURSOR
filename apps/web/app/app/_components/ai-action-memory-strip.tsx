"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Brain, ChevronRight } from "lucide-react";
import { filterActionMemoryByRefs, OPERATIONAL_AGENT_LABEL, useAIRuntimeStore } from "@/lib/runtime";
import { cn } from "@/lib/utils";

type AiActionMemoryStripProps = {
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  limit?: number;
  className?: string;
  title?: string;
};

export function AiActionMemoryStrip({
  conversationId,
  reservationId,
  guestId,
  limit = 8,
  className,
  title = "AI action memory",
}: AiActionMemoryStripProps) {
  const hydrated = useAIRuntimeStore((s) => s.hydrated);
  const memory = useAIRuntimeStore((s) => s.aiActionMemory);
  const pulse = useAIRuntimeStore((s) => s.lastPulseAt);

  const rows = useMemo(() => {
    if (!hydrated) return [];
    return filterActionMemoryByRefs(memory, { conversationId, reservationId, guestId }, limit);
  }, [hydrated, memory, conversationId, reservationId, guestId, limit]);

  if (!hydrated || rows.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-3",
        className
      )}
      data-runtime-pulse={pulse > 0 ? String(pulse) : undefined}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200/75">
          <Brain className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          {title}
        </p>
        <Link
          href="/app/ai-brain/audit"
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cyan-300/85 hover:text-cyan-200"
        >
          Audit trace
          <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>
      <ul className="space-y-2">
        {rows.map((m) => (
          <li
            key={m.id}
            className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-2 transition-colors hover:border-white/[0.09]"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                {m.kind.replace(/_/g, " ")}
              </span>
              <span className="rounded border border-white/[0.08] px-1.5 py-px text-[9px] font-medium text-white/45">
                {OPERATIONAL_AGENT_LABEL[m.agentRole]}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-white/65">{m.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {m.conversationId ? (
                <Link
                  href={`/app/conversations/${m.conversationId}`}
                  className="rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/45 hover:border-cyan-500/25 hover:text-white/75"
                >
                  Thread
                </Link>
              ) : null}
              {m.reservationId ? (
                <Link
                  href={`/app/reservations/${m.reservationId}`}
                  className="rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/45 hover:border-cyan-500/25 hover:text-white/75"
                >
                  Res.
                </Link>
              ) : null}
              {m.guestId ? (
                <Link
                  href={`/app/guests/${m.guestId}`}
                  className="rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/45 hover:border-cyan-500/25 hover:text-white/75"
                >
                  Guest
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
