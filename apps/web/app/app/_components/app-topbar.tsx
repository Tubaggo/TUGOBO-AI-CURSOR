"use client";

import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import type { Organization, User as AppUser } from "@/app/app/_types";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";
import { OperationalCommandPalette } from "./operational-command-palette";
import { OperationalLivePulse } from "./operational-live-pulse";
import { OperationalNotificationCenter } from "./operational-notification-center";
import { OrchestrationPulseBar } from "./orchestration-pulse-bar";

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
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <OperationalCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
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
            onClick={() => setCommandOpen(true)}
            className="flex h-9 w-full max-w-lg items-center gap-2.5 rounded-lg border border-white/[0.1] bg-white/[0.035] px-3.5 text-left text-xs text-white/55 transition-colors hover:border-emerald-500/25 hover:bg-white/[0.05]"
            aria-label="Open operational command center"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-emerald-400/45" />
            <span className="truncate font-medium">Search operational fabric — ⌘K</span>
            <span className="ml-auto hidden rounded border border-white/[0.08] bg-black/35 px-1.5 py-0.5 font-mono text-[10px] text-white/35 sm:inline">
              Cmd K
            </span>
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-emerald-300/75 transition-colors hover:border-emerald-500/25 hover:bg-emerald-500/10 md:hidden"
            aria-label="Open operational command center"
          >
            <Search className="h-4 w-4" />
          </button>
          <OperationalNotificationCenter />
          <OrchestrationPulseBar />
          <OperationalLivePulse />
          <UserMenu user={user} />
        </div>
      </header>
    </>
  );
}
