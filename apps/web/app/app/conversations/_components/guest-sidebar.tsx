"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowUpCircle,
  Banknote,
  Bot,
  CreditCard,
  Loader2,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types/conversations";
import { AiInsightsCard } from "./ai-insights-card";
import { ReservationContextCard } from "./reservation-context-card";
import {
  assignStaffAction,
  stubSuggestedAction,
  toggleAiHandlingAction,
} from "../actions";

type GuestSidebarProps = {
  detail: Conversation;
};

export function GuestSidebar({ detail }: GuestSidebarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(label: string, fn: () => Promise<void>) {
    if (pending) return;
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const g = detail.guest;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-white/[0.06] bg-zinc-950/90 md:max-w-[340px] md:shrink-0">
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-3 md:px-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400/75">
          Guest + AI ops
        </p>
        <p className="mt-1 text-xs leading-snug text-white/42">
          Differentiator rail — reservation + AI signals in one surface.
        </p>
      </div>

      <div className="space-y-3 p-3 md:p-4">
        <section className="rounded-xl border border-white/[0.07] bg-zinc-900/45 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Guest profile</p>
          <p className="mt-1 text-sm font-semibold text-white/90">{g.name}</p>
          <dl className="mt-2 space-y-1.5 text-[12px]">
            <div className="flex justify-between gap-2">
              <dt className="text-white/35">Nationality</dt>
              <dd className="font-medium text-white/75">{g.nationality}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-white/35">Language</dt>
              <dd className="text-white/75">{g.language}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-white/35">Stays</dt>
              <dd className="tabular-nums text-white/75">{g.totalStays}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-white/35">Returning</dt>
              <dd className={cn("font-medium", g.returningGuest ? "text-emerald-300/90" : "text-white/45")}>
                {g.returningGuest ? "Yes" : "No"}
              </dd>
            </div>
            {g.preferredRoom ? (
              <div className="flex justify-between gap-2">
                <dt className="text-white/35">Preferred</dt>
                <dd className="max-w-[60%] text-right text-white/70">{g.preferredRoom}</dd>
              </div>
            ) : null}
          </dl>
          {g.tags.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {g.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/[0.08] bg-black/30 px-1.5 py-0.5 text-[10px] font-medium text-white/50"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <ReservationContextCard reservation={detail.reservation} />
        <AiInsightsCard insight={detail.aiInsight} />

        <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Suggested actions
          </p>
          <p className="mt-1 text-[11px] text-white/32">Stubbed — wire to tools + Inngest later.</p>
          <div className="mt-2.5 grid grid-cols-1 gap-1.5">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("payment", async () => {
                  await stubSuggestedAction(detail.id);
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] py-2 text-[12px] font-semibold text-emerald-100/95 transition hover:bg-emerald-500/15 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Send payment link
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("upgrade", async () => {
                  await stubSuggestedAction(detail.id);
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/[0.07] py-2 text-[12px] font-semibold text-violet-100/95 transition hover:bg-violet-500/15 disabled:opacity-50"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Offer upgrade
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("human", async () => {
                  await assignStaffAction({
                    conversationId: detail.id,
                    staffName: "Front desk",
                  });
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] py-2 text-[12px] font-semibold text-amber-100/95 transition hover:bg-amber-500/15 disabled:opacity-50"
            >
              <Users className="h-4 w-4" />
              Human takeover
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("toggleAi", async () => {
                  await toggleAiHandlingAction(detail.id);
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/[0.07] py-2 text-[12px] font-semibold text-blue-100/95 transition hover:bg-blue-500/15 disabled:opacity-50"
            >
              <Bot className="h-4 w-4" />
              Toggle AI / resume
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("assign", async () => {
                  await assignStaffAction({
                    conversationId: detail.id,
                    staffName: "Reservations",
                  });
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-[12px] font-medium text-white/70 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Assign staff
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run("res", async () => {
                  await stubSuggestedAction(detail.id);
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-[12px] font-medium text-white/70 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <Banknote className="h-4 w-4" />
              Create reservation
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/25">
            <Sparkles className="h-3 w-3" aria-hidden />
            Stub actions refresh the view; Supabase-backed tools ship next.
          </p>
        </section>
      </div>
    </aside>
  );
}
