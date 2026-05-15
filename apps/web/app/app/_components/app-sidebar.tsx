"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, X } from "lucide-react";
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
          "fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px] transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[252px] shrink-0 flex-col border-r border-white/[0.07] bg-zinc-900/95 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)] transition-transform duration-200 ease-out md:static md:z-0 md:w-[248px] md:translate-x-0 md:shadow-none",
          mobileOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent px-3 pb-4 pt-4 md:px-4 md:pb-5 md:pt-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="flex items-start justify-between gap-2">
            <Link
              href="/app/overview"
              className="group flex min-w-0 flex-1 flex-col gap-1 transition-opacity hover:opacity-95"
              onClick={onMobileClose}
            >
              <Image
                src="/Logo.png"
                alt="Tugobo AI"
                width={220}
                height={48}
                className="h-10 w-auto max-w-[188px] object-contain opacity-[0.96] [filter:drop-shadow(0_0_14px_rgba(255,255,255,0.07))] transition-[filter] group-hover:[filter:drop-shadow(0_0_18px_rgba(59,130,246,0.12))]"
                priority
              />
              <span className="pl-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Operations console
              </span>
            </Link>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition-colors hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white md:hidden"
              onClick={onMobileClose}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4 md:px-3">
          <p className="px-3 pb-2 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
            Navigate
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
                  "group relative flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-[13px] transition-all duration-150 md:py-3",
                  isActive
                    ? "bg-white/[0.07] text-white shadow-sm shadow-black/20"
                    : "text-white/48 hover:bg-white/[0.04] hover:text-white/82"
                )}
              >
                {isActive ? (
                  <span
                    className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.45)]"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-white/28 group-hover:text-white/45"
                  )}
                />
                <span className="font-medium tracking-tight">{label}</span>
                {isActive ? (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/90 ring-2 ring-blue-500/25" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[0.06] bg-zinc-950/30 px-3 py-3.5 md:px-3.5 md:py-4">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02]">
            <div className="flex gap-3 border-b border-white/[0.06] px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300/90 ring-1 ring-blue-500/20">
                <Building2 className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/32">
                  Property
                </p>
                <p className="truncate text-xs font-semibold text-white/88">{organization.name}</p>
                <p className="truncate text-[11px] text-white/42">
                  {organization.city} · {organization.country}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white ring-1 ring-white/10">
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
                <p className="truncate text-xs font-semibold text-white/85">{user.name}</p>
                <p className="truncate text-[11px] text-white/38">{user.email}</p>
              </div>
              <span className="shrink-0 rounded-md border border-blue-500/30 bg-blue-500/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-200/95">
                {hotelRoleLabel(user.role)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
