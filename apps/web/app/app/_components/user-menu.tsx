"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User, Building2 } from "lucide-react";
import type { User as AppUser } from "@/app/app/_types";
import { hotelRoleLabel } from "./role-label";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: AppUser;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.06] text-xs font-semibold text-white/90 transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          aria-label="Open user menu"
        >
          <span aria-hidden>{initials(user.name)}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-white/[0.08] bg-zinc-950 p-1 shadow-xl shadow-black/40"
        >
          <div className="border-b border-white/[0.06] px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-white/45">{user.email}</p>
            <p className="mt-1.5 inline-flex rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
              {hotelRoleLabel(user.role)}
            </p>
          </div>
          <DropdownMenu.Item
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/80 outline-none data-[highlighted]:bg-white/[0.06]"
            onSelect={(e) => e.preventDefault()}
          >
            <User className="h-4 w-4 text-white/45" />
            Account
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/80 outline-none data-[highlighted]:bg-white/[0.06]"
            onSelect={(e) => e.preventDefault()}
          >
            <Building2 className="h-4 w-4 text-white/45" />
            Organization
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-white/[0.06]" />
          <DropdownMenu.Item
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-400/90 outline-none data-[highlighted]:bg-red-500/10"
            )}
            onSelect={(e) => e.preventDefault()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
