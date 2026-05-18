"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Moon,
  Users,
} from "lucide-react";
import type { ConvReservation } from "@/app/dashboard/_components/chat-threads";
import type { ConversationStatus } from "@/app/dashboard/_components/mock-data";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    border: "border-emerald-500/25",
    header: "bg-emerald-500/[0.08]",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  pending_payment: {
    label: "Pending payment",
    icon: AlertCircle,
    border: "border-amber-500/25",
    header: "bg-amber-500/[0.07]",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400 animate-pulse",
  },
  quoted: {
    label: "Quote sent",
    icon: FileText,
    border: "border-blue-500/25",
    header: "bg-blue-500/[0.07]",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    dot: "bg-blue-400",
  },
} as const;

export function ReservationOperationCard({
  reservation: r,
  sentLink,
  onSendPaymentLink,
  reservationsHref,
}: {
  reservation: ConvReservation;
  convStatus: ConversationStatus;
  sentLink: boolean;
  onSendPaymentLink: () => void;
  reservationsHref: string;
}) {
  const s = STATUS_MAP[r.status];
  const StatusIcon = s.icon;
  const showPaymentBtn = r.status === "pending_payment" || r.status === "quoted";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-zinc-900/75 shadow-lg shadow-black/20",
        s.border
      )}
    >
      <div className={cn("flex items-center justify-between px-5 py-4", s.header)}>
        <div className="flex items-center gap-2.5">
          <StatusIcon className={cn("h-4 w-4", s.iconColor)} />
          <div>
            <p className="text-sm font-semibold text-white">
              {r.status === "quoted" ? "Offer prepared" : "Reservation in progress"}
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">Ref #{r.ref}</p>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
            s.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>

      <div className="px-5 pb-1 pt-4">
        <p className="mb-3 text-[13px] font-semibold text-white/90">{r.room}</p>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DetailCell icon={CalendarDays} label="Check-in" value={r.checkIn} />
          <DetailCell icon={CalendarDays} label="Check-out" value={r.checkOut} />
          <DetailCell icon={Users} label="Guests" value={String(r.guests)} />
          <DetailCell icon={Moon} label="Nights" value={String(r.nights)} />
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.04] py-4">
          <p className="text-[11px] text-white/35">
            {r.currency}
            {r.pricePerNight.toLocaleString()} × {r.nights} nights
          </p>
          <p className="text-xl font-bold tabular-nums text-white">
            {r.currency}
            {r.total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-5">
        <Link
          href={reservationsHref}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3.5 py-2 text-xs font-medium text-white/55 transition-colors hover:text-white/75"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View reservation
        </Link>
        {showPaymentBtn ? (
          <button
            type="button"
            onClick={onSendPaymentLink}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.97]",
              sentLink
                ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : "border border-amber-500/25 bg-amber-500/15 text-amber-200 hover:bg-amber-500/20"
            )}
          >
            <CreditCard className="h-3.5 w-3.5" />
            {sentLink ? "Link sent" : "Send payment link"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DetailCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1 text-[10px] text-white/30">
        <Icon className="h-3 w-3 text-blue-400/80" />
        {label}
      </p>
      <p className="text-[12px] font-medium text-white/70">{value}</p>
    </div>
  );
}
