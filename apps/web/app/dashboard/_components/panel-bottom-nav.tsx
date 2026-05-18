"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PrimaryItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: number | null;
  match: (pathname: string, base: string) => boolean;
};

export function PanelBottomNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  const overviewHref =
    basePath === "/dashboard" ? basePath : `${basePath}/overview`;

  const primary: PrimaryItem[] = useMemo(
    () => [
      {
        href: overviewHref,
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
    ],
    [basePath, overviewHref, t]
  );

  const secondary = useMemo(
    () => [
      { href: `${basePath}/guests`, label: t("guests"), icon: UserRound },
      { href: `${basePath}/reports`, label: t("reports"), icon: BarChart3 },
      { href: `${basePath}/settings`, label: t("settings"), icon: Settings },
    ],
    [basePath, t]
  );

  const moreActive = secondary.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      {menuOpen ? (
        <div
          className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-50 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/98 shadow-2xl shadow-black/60 lg:hidden"
          role="dialog"
          aria-label="Ek menü"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-xs font-semibold text-white/70">Diğer</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-2">
            {secondary.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white/80"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-blue-400" : "text-white/35")} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav
        className="panel-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl lg:hidden"
        aria-label="Ana navigasyon"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom,0px)] pt-1">
          {primary.map(({ href, label, icon: Icon, badge, match }) => {
            const isActive = match(pathname, basePath);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex min-h-[52px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:scale-[0.97]",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      isActive ? "text-blue-400" : "text-white/35"
                    )}
                  />
                  {badge ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white shadow-sm">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "max-w-[4.5rem] truncate text-[10px] font-medium leading-tight",
                    isActive ? "text-white/90" : "text-white/38"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "relative flex min-h-[52px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors active:scale-[0.97]",
              moreActive || menuOpen ? "text-white" : "text-white/40"
            )}
            aria-expanded={menuOpen}
            aria-label="Diğer menü"
          >
            <MoreHorizontal
              className={cn(
                "h-[22px] w-[22px]",
                moreActive || menuOpen ? "text-blue-400" : "text-white/35"
              )}
            />
            <span className="text-[10px] font-medium text-white/38">Menü</span>
          </button>
        </div>
      </nav>
    </>
  );
}