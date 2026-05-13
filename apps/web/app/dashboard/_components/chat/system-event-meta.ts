import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react";

export type SystemEventKind =
  | "availability"
  | "reservation"
  | "payment"
  | "takeover"
  | "general";

export type SystemEventMeta = {
  kind: SystemEventKind;
  Icon: LucideIcon;
};

const AVAILABILITY_RE =
  /checking availability|müsaitlik|verif.*disponib|prüf.*verfüg|verifica.*disponibilit|controll.*disponibilit|disponibilidad|проверя|kontrol ediyor|verifico.*disponib|checking room|verificando/i;

const TAKEOVER_RE =
  /escalat|takeover|hand.?off|devredildi|personele|к персоналу|human takeover|detected/i;

const PAYMENT_DONE_RE =
  /payment received|paiement confirm|pagamento conferm|zahlung.*bestätigt|payment.*confirm/i;

const PAYMENT_LINK_RE =
  /payment link|zahlungslink|link di pagamento|link de pagamento|secure payment|sicheren zahlungslink|envoyé.*paiement/i;

const RESERVATION_RE =
  /reservation|rezervasyon|quote|created|réser|buchung|prenotazione|reserva|awaiting|gebucht|awaiting guest|generated/i;

export function getSystemEventMeta(body: string): SystemEventMeta {
  if (AVAILABILITY_RE.test(body)) {
    return { kind: "availability", Icon: Sparkles };
  }
  if (TAKEOVER_RE.test(body)) {
    return { kind: "takeover", Icon: AlertTriangle };
  }
  if (PAYMENT_DONE_RE.test(body) || PAYMENT_LINK_RE.test(body)) {
    return { kind: "payment", Icon: CreditCard };
  }
  if (RESERVATION_RE.test(body)) {
    return { kind: "reservation", Icon: CalendarCheck };
  }
  return { kind: "general", Icon: Zap };
}

export function systemEventKindClasses(kind: SystemEventKind): {
  shell: string;
  iconWrap: string;
  icon: string;
  text: string;
  time: string;
} {
  switch (kind) {
    case "availability":
      return {
        shell: "border-sky-500/12 bg-sky-500/[0.05]",
        iconWrap: "bg-sky-500/12 text-sky-300/90",
        icon: "text-sky-300/95",
        text: "text-sky-100/[0.72]",
        time: "text-sky-200/42",
      };
    case "reservation":
      return {
        shell: "border-blue-500/14 bg-blue-500/[0.06]",
        iconWrap: "bg-blue-500/12 text-blue-300/90",
        icon: "text-blue-300/95",
        text: "text-blue-50/[0.72]",
        time: "text-blue-100/40",
      };
    case "payment":
      return {
        shell: "border-emerald-500/14 bg-emerald-500/[0.05]",
        iconWrap: "bg-emerald-500/12 text-emerald-300/90",
        icon: "text-emerald-300/95",
        text: "text-emerald-50/[0.72]",
        time: "text-emerald-100/40",
      };
    case "takeover":
      return {
        shell: "border-amber-500/16 bg-amber-500/[0.06]",
        iconWrap: "bg-amber-500/12 text-amber-300/90",
        icon: "text-amber-300/95",
        text: "text-amber-50/[0.74]",
        time: "text-amber-100/42",
      };
    default:
      return {
        shell: "border-white/[0.06] bg-white/[0.03]",
        iconWrap: "bg-white/[0.06] text-white/45",
        icon: "text-white/50",
        text: "text-white/42",
        time: "text-white/30",
      };
  }
}
