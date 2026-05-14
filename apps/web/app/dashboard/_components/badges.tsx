import type { ConversationStatus, LeadStatus, ReservationStatus } from "./mock-data";

export function StatusBadge({ status }: { status: ConversationStatus }) {
  const map: Record<ConversationStatus, { label: string; cls: string; dot: string }> = {
    ai_active: {
      label: "Ops auto",
      cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      dot: "bg-blue-400",
    },
    human_takeover: {
      label: "Staff",
      cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    resolved: {
      label: "Closed",
      cls: "bg-white/[0.06] text-white/35 border-white/[0.07]",
      dot: "bg-white/30",
    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === "ai_active" ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
}

export function LeadBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, { label: string; cls: string }> = {
    new: { label: "Inquiry", cls: "bg-white/[0.06] text-white/40 border-white/[0.08]" },
    qualified: { label: "Qualified", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
    quoted: { label: "Offer sent", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    lost: { label: "Lost", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function ResBadge({ status }: { status: ReservationStatus }) {
  const map: Record<ReservationStatus, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    pending_payment: { label: "Payment pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    quoted: { label: "Offer sent", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    new: { label: "Inquiry", cls: "bg-white/[0.06] text-white/40 border-white/[0.08]" },
    lost: { label: "Lost", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

const langLabels: Record<string, string> = {
  TR: "🇹🇷",
  EN: "🇬🇧",
  DE: "🇩🇪",
  RU: "🇷🇺",
  IT: "🇮🇹",
  AR: "🇦🇪",
  FR: "🇫🇷",
  ES: "🇪🇸",
};

export function LanguageFlag({ lang }: { lang: string }) {
  return (
    <span className="text-sm" title={lang}>
      {langLabels[lang] ?? lang}
    </span>
  );
}
