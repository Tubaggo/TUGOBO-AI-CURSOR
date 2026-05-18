"use client";

import { useState } from "react";
import {
  UserCheck,
  CreditCard,
  CalendarCheck,
  Sparkles,
  MoreHorizontal,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationStatus } from "./mock-data";

export function MobileQuickActions({
  status,
  hasReservation,
  onTakeover,
  onHandToAI,
  onSendPaymentLink,
  onOpenSummary,
}: {
  status: ConversationStatus;
  hasReservation: boolean;
  onTakeover: () => void;
  onHandToAI: () => void;
  onSendPaymentLink: () => void;
  onOpenSummary: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "resolved") return null;

  const primary =
    status === "human_takeover"
      ? { label: "AI'ye devret", icon: Bot, onClick: onHandToAI, tone: "blue" as const }
      : { label: "Devral", icon: UserCheck, onClick: onTakeover, tone: "amber" as const };

  return (
    <div className="shrink-0 border-t border-white/[0.05] bg-zinc-950/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={primary.onClick}
          className={cn(
            "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold transition-all active:scale-[0.98]",
            primary.tone === "amber"
              ? "border-amber-500/25 bg-amber-500/12 text-amber-200"
              : "border-blue-500/25 bg-blue-500/12 text-blue-200"
          )}
        >
          <primary.icon className="h-4 w-4 shrink-0" />
          {primary.label}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/75"
            aria-expanded={menuOpen}
            aria-label="Diğer işlemler"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-30"
                aria-label="Kapat"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-full right-0 z-40 mb-2 min-w-[200px] overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-900 py-1 shadow-xl">
                <MenuItem
                  icon={CreditCard}
                  label="Ödeme linki"
                  onClick={() => {
                    onSendPaymentLink();
                    setMenuOpen(false);
                  }}
                />
                {hasReservation ? (
                  <MenuItem
                    icon={CalendarCheck}
                    label="Rezervasyon"
                    onClick={() => setMenuOpen(false)}
                  />
                ) : null}
                <MenuItem
                  icon={Sparkles}
                  label="AI önerisi"
                  onClick={() => {
                    onOpenSummary();
                    setMenuOpen(false);
                  }}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof CreditCard;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      {label}
    </button>
  );
}
