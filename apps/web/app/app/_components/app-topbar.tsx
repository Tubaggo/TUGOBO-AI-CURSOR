"use client";

import { Bell, Menu, Search, Sparkles } from "lucide-react";
import type { Organization, User as AppUser } from "@/app/app/_types";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";

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
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-zinc-950/90 px-3 backdrop-blur-md md:gap-3 md:px-4">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.07] md:hidden"
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
          className="flex h-9 w-full max-w-lg items-center gap-2 rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] px-3 text-left text-xs text-white/35"
          aria-label="Search (coming soon)"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search — Cmd K (soon)</span>
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
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition-colors hover:bg-white/[0.06] sm:flex"
          aria-label="Notifications (placeholder)"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div
          className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400/95 md:flex"
          title="AI status"
        >
          <Sparkles className="h-3 w-3 shrink-0" />
          AI ready
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
