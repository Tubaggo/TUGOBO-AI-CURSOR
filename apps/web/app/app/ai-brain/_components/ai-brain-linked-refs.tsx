import Link from "next/link";
import { Calendar, MessageSquare, User } from "lucide-react";

type AIBrainLinkedRefsProps = {
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  compact?: boolean;
};

export function AIBrainLinkedRefs({
  conversationId,
  reservationId,
  guestId,
  compact = false,
}: AIBrainLinkedRefsProps) {
  if (!conversationId && !reservationId && !guestId) return null;

  const linkClass = compact
    ? "inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 text-[10px] text-white/55 transition-colors hover:border-cyan-500/30 hover:text-white/80"
    : "flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2 text-[11px] text-white/55 transition-colors hover:border-cyan-500/25 hover:bg-cyan-500/[0.06] hover:text-white/80";

  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "flex flex-col gap-1.5"}>
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
          Linked operations
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {guestId ? (
          <Link href={`/app/guests/${guestId}`} className={linkClass}>
            <User className="h-3 w-3 shrink-0" aria-hidden />
            Guest
          </Link>
        ) : null}
        {reservationId ? (
          <Link href={`/app/reservations/${reservationId}`} className={linkClass}>
            <Calendar className="h-3 w-3 shrink-0" aria-hidden />
            Reservation
          </Link>
        ) : null}
        {conversationId ? (
          <Link href={`/app/conversations/${conversationId}`} className={linkClass}>
            <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
            Conversation
          </Link>
        ) : null}
      </div>
    </div>
  );
}
