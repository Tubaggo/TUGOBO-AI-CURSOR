import { Heart } from "lucide-react";
import type { GuestPreference } from "@/lib/types/guests";

type GuestPreferencesCardProps = {
  preferences: GuestPreference[];
};

const CATEGORY_LABELS: Record<GuestPreference["category"], string> = {
  room: "Room",
  dietary: "Dietary",
  communication: "Communication",
  occasion: "Occasion",
  transfer: "Transfer",
  other: "Other",
};

export function GuestPreferencesCard({ preferences }: GuestPreferencesCardProps) {
  if (preferences.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-300/75" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Guest memory</h3>
      </header>
      <ul className="space-y-2">
        {preferences.map((p) => (
          <li
            key={`${p.category}-${p.value}`}
            className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
              {CATEGORY_LABELS[p.category]}
            </p>
            <p className="mt-0.5 text-[12px] text-white/75">{p.value}</p>
            <p className="mt-1 text-[10px] text-violet-300/60">
              AI confidence {Math.round(p.confidence * 100)}%
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
