"use client";

import { useMemo } from "react";
import { Bell, Menu, Search, Sparkles } from "lucide-react";
import type { Organization, User as AppUser } from "@/app/app/_types";
import { useOperationalFocusLabel, useRuntimePulse } from "@/lib/runtime";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";

const IDLE_FOCUS_HINTS = [
  "Monitoring payment recovery",
  "Watching VIP arrivals",
  "Recalculating guest risk",
  "Supervising low-confidence quotes",
  "Syncing reservation context",
];

type AppTopbarProps = {
  organizations: Organization[];
  activeOrganizationId: string;
  onOrganizationChange: (organizationId: string) => void;
  user: AppUser;
  onMenuClick: () => void;
};

export function AppTopbar({
  organizations,
  activeOrganizationId,
  onOrganizationChange,
  user,
  onMenuClick,
}: AppTopbarProps) {
  const focusLabel = useOperationalFocusLabel();
  const pulse = useRuntimePulse();
  const rotatingHint = useMemo(() => {
    const i = pulse > 0 ? Math.floor(pulse / 14000) % IDLE_FOCUS_HINTS.length : 0;
    return IDLE_FOCUS_HINTS[i];
  }, [pulse]);

  return (
    <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-white/[0.07] bg-zinc-950/[0.92] px-3 shadow-[0_1px_0_rgba(0,0,0,0.35)] backdrop-blur-md md:h-14 md:gap-3 md:px-4">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 transition-colors hover:border-white/[0.12] hover:bg-white/[0.07] md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 shrink-0 items-center md:w-[260px] md:max-w-[320px]">
        <div className="hidden min-w-0 md:block md:w-full">
          <OrgSwitcher
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
            onOrganizationChange={onOrganizationChange}
          />
        </div>
        <div className="min-w-0 flex-1 md:hidden">
          <OrgSwitcher
            compact
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
            onOrganizationChange={onOrganizationChange}
          />
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
        <button
          type="button"
          disabled
          className="flex h-9 w-full max-w-lg items-center gap-2.5 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] px-3.5 text-left text-xs text-white/38 transition-colors hover:border-white/[0.14]"
          aria-label="Search (coming soon)"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-white/28" />
          <span className="truncate font-medium">Search workspace — Cmd K</span>
          <span className="ml-auto hidden rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/30 sm:inline">
            Soon
          </span>
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] text-white/30 md:hidden"
          aria-label="Search (coming soon)"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/48 transition-colors hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/70 sm:flex"
          aria-label="Notifications (placeholder)"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div
          className="hidden max-w-[min(340px,46vw)] shrink flex-col items-end gap-0.5 rounded-xl border border-emerald-500/22 bg-emerald-950/28 px-2.5 py-1.5 text-right shadow-[0_0_24px_-10px_rgba(16,185,129,0.35)] sm:flex md:max-w-[380px] md:px-3"
          title="AI runtime focus"
          data-runtime-pulse={pulse > 0 ? String(pulse) : undefined}
        >
          <div className="flex items-center justify-end gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
            </span>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-300/90" aria-hidden />
            <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95 md:text-[11px]">
              AI Ops Live
            </span>
          </div>
          <span className="w-full truncate text-[10px] font-medium leading-snug text-emerald-100/55 md:text-[11px]">
            {focusLabel}
          </span>
          <span className="hidden w-full truncate text-[9px] font-medium text-white/28 md:inline">
            {rotatingHint}
          </span>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
