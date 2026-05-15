import { MessageCircle } from "lucide-react";
import type { GuestAIInsight } from "@/lib/types/guests";

type CommunicationProfileCardProps = {
  insight: GuestAIInsight;
};

export function CommunicationProfileCard({ insight }: CommunicationProfileCardProps) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-blue-300/80" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Communication preferences</h3>
      </header>
      <ul className="space-y-2 text-[12px] text-white/60">
        <li>
          <span className="text-white/35">Channel: </span>
          <span className="font-medium text-white/80">{insight.communicationPreference}</span>
        </li>
        <li>
          <span className="text-white/35">Tone: </span>
          <span className="font-medium capitalize text-white/80">{insight.preferredTone}</span>
        </li>
        <li>
          <span className="text-white/35">Behavior: </span>
          {insight.responseBehavior}
        </li>
        <li className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2 py-1.5 text-blue-100/85">
          {insight.channelPreference}
        </li>
      </ul>
    </section>
  );
}
