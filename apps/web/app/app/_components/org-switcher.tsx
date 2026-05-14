"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Organization } from "@/app/app/_types";

type OrgSwitcherProps = {
  organizations: Organization[];
  activeOrganizationId: string;
  onOrganizationChange: (organizationId: string) => void;
  compact?: boolean;
};

export function OrgSwitcher({
  organizations,
  activeOrganizationId,
  onOrganizationChange,
  compact = false,
}: OrgSwitcherProps) {
  const active =
    organizations.find((o) => o.id === activeOrganizationId) ?? organizations[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-left transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
            compact ? "h-9 max-w-[200px] px-2.5" : "min-h-[40px] max-w-[min(100%,280px)] px-3 py-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500/90 to-blue-600 text-white shadow-inner">
            <Building2 className="h-4 w-4" aria-hidden />
          </div>
          {!compact ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/90">{active.name}</p>
              <p className="truncate text-[10px] text-white/40">
                {active.city}, {active.country}
              </p>
            </div>
          ) : (
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/80">
              {active.name}
            </span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/35" aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-xl border border-white/[0.08] bg-zinc-950 p-1 shadow-xl shadow-black/40"
        >
          <div className="px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Organizations
            </p>
          </div>
          {organizations.map((org) => {
            const selected = org.id === activeOrganizationId;
            return (
              <DropdownMenu.Item
                key={org.id}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none data-[highlighted]:bg-white/[0.06]",
                  selected && "bg-white/[0.04]"
                )}
                onSelect={() => onOrganizationChange(org.id)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/70">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white/90">{org.name}</p>
                  <p className="truncate text-[11px] text-white/40">{org.slug}</p>
                </div>
                {selected ? <Check className="h-4 w-4 shrink-0 text-blue-400" /> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
