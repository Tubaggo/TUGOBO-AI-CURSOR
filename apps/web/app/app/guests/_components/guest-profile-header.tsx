import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guest, GuestOperationalSummary } from "@/lib/types/guests";
import { GuestAvatar } from "./guest-avatar";
import {
  directOtaRatioLabel,
  formatMoney,
  loyaltyTierLabel,
  reservationStateLabel,
  sentimentLabel,
} from "./guest-formatters";

type GuestProfileHeaderProps = {
  guest: Guest;
  summary: GuestOperationalSummary | null;
  primaryConversationId: string | null;
};

export function GuestProfileHeader({
  guest,
  summary,
  primaryConversationId,
}: GuestProfileHeaderProps) {
  return (
    <div className="mb-6 border-b border-white/[0.07] pb-6">
      <Link
        href="/app/guests"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45 transition-colors hover:text-white/75"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Guest intelligence
      </Link>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <GuestAvatar name={guest.name} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                {guest.name}
              </h1>
              <span className="rounded-md border border-violet-500/30 bg-violet-500/12 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
                {loyaltyTierLabel(guest.loyaltyTier)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
                <Sparkles className="h-3 w-3" aria-hidden />
                AI {guest.aiScore}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/45">
              {guest.nationality} · {guest.preferredLanguage} ·{" "}
              {directOtaRatioLabel(guest.directBookingRatio)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guest.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
            {summary ? (
              <div className="mt-4 max-w-2xl rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
                <p className="text-[13px] font-semibold text-white/80">{summary.headline}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/42">{summary.detail}</p>
                {summary.recoveryHistory ? (
                  <p className="mt-2 text-[11px] text-emerald-300/75">
                    Recovery: {summary.recoveryHistory}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {primaryConversationId ? (
            <Link
              href={`/app/conversations/${primaryConversationId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-[12px] font-semibold text-white/80 transition-colors hover:bg-white/[0.07]"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Open conversation
            </Link>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill label="Lifetime value" value={formatMoney(guest.lifetimeValue)} accent="emerald" />
        <StatPill label="Total stays" value={String(guest.totalStays)} />
        <StatPill
          label="Stay state"
          value={reservationStateLabel(guest.currentReservationState)}
          sub={guest.currentReservationLabel}
          accent={guest.currentReservationState === "at_risk" ? "rose" : "blue"}
        />
        <StatPill label="Sentiment" value={sentimentLabel(guest.sentiment)} />
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "emerald" | "rose" | "blue";
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-zinc-900/50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent === "emerald" && "text-emerald-200/95",
          accent === "rose" && "text-rose-200/95",
          accent === "blue" && "text-blue-200/95",
          !accent && "text-white/85"
        )}
      >
        {value}
      </p>
      {sub ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/35">{sub}</p>
      ) : null}
    </div>
  );
}
