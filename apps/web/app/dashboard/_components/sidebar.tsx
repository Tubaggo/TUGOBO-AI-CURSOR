"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CreditCard,
  ClipboardList,
  UserRound,
  BarChart3,
  Settings,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_BASE = "/dashboard";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: number | null;
  match: (pathname: string, base: string) => boolean;
};

export function Sidebar({ basePath = DEFAULT_BASE }: { basePath?: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: basePath,
        label: t("overview"),
        icon: LayoutDashboard,
        badge: null,
        match: (p, base) => p === base || p === `${base}/overview`,
      },
      {
        href: `${basePath}/conversations`,
        label: t("conversations"),
        icon: MessageSquare,
        badge: 6,
        match: (p) => p.includes("/conversations"),
      },
      {
        href: `${basePath}/reservations`,
        label: t("reservations"),
        icon: Calendar,
        badge: null,
        match: (p) => p.includes("/reservations"),
      },
      {
        href: `${basePath}/payments`,
        label: t("payments"),
        icon: CreditCard,
        badge: 2,
        match: (p) => p.includes("/payments"),
      },
      {
        href: `${basePath}/operations`,
        label: t("operations"),
        icon: ClipboardList,
        badge: null,
        match: (p) => p.includes("/operations"),
      },
      {
        href: `${basePath}/guests`,
        label: t("guests"),
        icon: UserRound,
        badge: null,
        match: (p) => p.includes("/guests"),
      },
      {
        href: `${basePath}/reports`,
        label: t("reports"),
        icon: BarChart3,
        badge: null,
        match: (p) => p.includes("/reports"),
      },
      {
        href: `${basePath}/settings`,
        label: t("settings"),
        icon: Settings,
        badge: null,
        match: (p) => p.includes("/settings"),
      },
    ],
    [basePath, t]
  );

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-zinc-900">
      <div className="flex min-h-[88px] items-center border-b border-white/[0.06] px-4 py-6">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/Logo.png"
            alt="Tugobo AI"
            width={240}
            height={56}
            className="h-14 w-auto opacity-[0.95] [filter:drop-shadow(0_0_12px_rgba(255,255,255,0.08))]"
            priority
          />
        </Link>
      </div>

      <div className="px-3 pb-2 pt-4">
        <button
          type="button"
          className="group flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 transition-colors hover:bg-white/[0.07]"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white">
              H
            </div>
            <span className="truncate text-xs font-medium text-white/70">Grand Hotel Demo</span>
          </div>
          <ChevronRight className="h-3 w-3 shrink-0 text-white/30" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          {t("section")}
        </p>
        {navItems.map(({ href, label, icon: Icon, badge, match }) => {
          const isActive = match(pathname, basePath);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/50"
                  )}
                />
                <span className="font-medium">{label}</span>
              </div>
              {badge ? (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                  {badge}
                </span>
              ) : null}
              {isActive && !badge ? <div className="h-1 w-1 rounded-full bg-blue-400" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/[0.06] px-3 pb-4 pt-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
        >
          <Bell className="h-4 w-4" />
          <span className="font-medium">{t("notifications")}</span>
        </button>
        <div className="mt-1 flex items-center gap-2.5 px-3 py-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white">
            G
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white/60">hotel@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
