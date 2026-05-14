"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Organization, User as AppUser } from "@/app/app/_types";
import { APP_NAV_ITEMS } from "@/app/app/_lib/nav-items";
import { hotelRoleLabel } from "./role-label";

type AppSidebarProps = {
  organization: Organization;
  user: AppUser;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AppSidebar({
  organization,
  user,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-zinc-900 transition-transform duration-200 ease-out md:static md:z-0 md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex min-h-[72px] items-center justify-between border-b border-white/[0.06] px-3 py-4 md:min-h-[80px]">
          <Link
            href="/app/overview"
            className="flex min-w-0 flex-1 items-center transition-opacity hover:opacity-90"
            onClick={onMobileClose}
          >
            <Image
              src="/Logo.png"
              alt="Tugobo AI"
              width={220}
              height={48}
              className="h-11 w-auto max-w-[180px] object-contain opacity-[0.95] [filter:drop-shadow(0_0_12px_rgba(255,255,255,0.08))]"
              priority
            />
          </Link>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
            Operations
          </p>
          {APP_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/app/overview"
                ? pathname === href || pathname === "/app"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/50"
                  )}
                />
                <span className="font-medium">{label}</span>
                {isActive ? <span className="ml-auto h-1 w-1 rounded-full bg-blue-400" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/[0.06] px-3 py-3">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
              Organization
            </p>
            <p className="truncate text-xs font-medium text-white/85">{organization.name}</p>
            <p className="truncate text-[11px] text-white/40">
              {organization.city}, {organization.country}
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white">
              {user.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/80">{user.name}</p>
              <p className="truncate text-[11px] text-white/40">{user.email}</p>
            </div>
            <span className="shrink-0 rounded border border-blue-500/25 bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-300">
              {hotelRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
