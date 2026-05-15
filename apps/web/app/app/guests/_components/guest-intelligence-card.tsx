import { Sparkles } from "lucide-react";
import type { Guest } from "@/lib/types/guests";
import { GuestInsightsCard } from "./guest-insights-card";
import { CommunicationProfileCard } from "./communication-profile-card";
import { LoyaltyStatusCard } from "./loyalty-status-card";
import { GuestActionsCard } from "./guest-actions-card";
import type { GuestAIAction, GuestAIInsight } from "@/lib/types/guests";

type GuestIntelligenceCardProps = {
  guest: Guest;
  insight: GuestAIInsight;
  actions: GuestAIAction[];
};

export function GuestIntelligenceSidebar({
  guest,
  insight,
  actions,
}: GuestIntelligenceCardProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-3">
        <header className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-violet-200/80">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Guest intelligence
        </header>
        <p className="mt-1 text-xs text-white/45">
          AI score <span className="font-bold tabular-nums text-violet-100">{guest.aiScore}</span> ·
          operational memory active
        </p>
      </section>
      <GuestInsightsCard insight={insight} />
      <LoyaltyStatusCard guest={guest} />
      <CommunicationProfileCard insight={insight} />
      <GuestActionsCard actions={actions} />
    </aside>
  );
}
