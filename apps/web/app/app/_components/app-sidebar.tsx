"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Brain,
  FileSearch,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOperationalRuntime,
  selectRevenueMetrics,
  selectMounted,
  selectUnreadAlertCount,
} from "@/stores/operational-runtime";
import { formatEur } from "@/lib/operational/format";
import { AlertCenter } from "./alert-center";

const BASE = "/app";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge: string | null;
};

export function AppSidebar() {
  const pathname = usePathname();
  const mounted = useOperationalRuntime(selectMounted);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const recoveredLabel = mounted ? formatEur(metrics.revenueRecoveredToday, true) : "—";
  const unreadAlerts = useOperationalRuntime(selectUnreadAlertCount);

  const navItems: NavItem[] = useMemo(
    () => [
      { href: `${BASE}/overview`, label: "Revenue command", icon: LayoutDashboard, exact: true, badge: null },
      {
        href: `${BASE}/conversations`,
        label: "Guest orchestration",
        icon: MessageSquare,
        badge: mounted && unreadAlerts > 0 ? String(unreadAlerts) : null,
      },
      { href: `${BASE}/reservations`, label: "Booking pipeline", icon: Calendar, badge: null },
      { href: `${BASE}/guests`, label: "Guest intelligence", icon: Users, badge: null },
      { href: `${BASE}/ai-brain`, label: "AI Brain", icon: Brain, badge: null },
      { href: `${BASE}/ai-brain/audit`, label: "Audit & explain", icon: FileSearch, badge: null },
    ],
    [mounted, unreadAlerts]
  );

  return (
    <aside className="flex h-full w-[228px] shrink-0 flex-col border-r border-white/[0.06] bg-zinc-900">
      <MotionHeader />
      <MotionHotelSwitcher />
      <div className="mx-3 mb-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-2.5">
        <MotionRevenuePulse label={recoveredLabel} mounted={mounted} />
      </div>
      <MotionNav navItems={navItems} pathname={pathname} />
      <MotionFooter />
    </aside>
  );
}

function MotionHeader() {
  return (
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
  );
}

function MotionHotelSwitcher() {
  return (
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
  );
}

function MotionRevenuePulse({ label, mounted }: { label: string; mounted: boolean }) {
  return (
    <MotionRevenuePulseInner label={label} mounted={mounted} />
  );
}

function MotionRevenuePulseInner({ label, mounted }: { label: string; mounted: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400/80">Recovered today</p>
        <p className="text-sm font-bold tabular-nums text-white">{label}</p>
        <p className="text-[10px] text-white/30">{mounted ? "Live revenue layer" : "Syncing…"}</p>
      </div>
    </div>
  );
}

function MotionNav({ navItems, pathname }: { navItems: NavItem[]; pathname: string }) {
  return (
    <nav className="flex-1 space-y-0.5 px-3 py-2">
      <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
        Revenue operations
      </p>
      {navItems.map(({ href, label, icon: Icon, badge, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
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
                  isActive ? "text-emerald-400" : "text-white/30 group-hover:text-white/50"
                )}
              />
              <span className="font-medium">{label}</span>
            </div>
            {badge ? (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                {badge}
              </span>
            ) : null}
            {isActive && !badge ? <div className="h-1 w-1 rounded-full bg-emerald-400" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function MotionFooter() {
  return (
    <div className="space-y-1 border-t border-white/[0.06] px-3 pb-4 pt-2">
      <AlertCenter />
      <div className="mt-1 flex items-center gap-2.5 px-3 py-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white">
          G
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white/60">hotel@example.com</p>
          <p className="text-[10px] text-white/28">Revenue ops · demo</p>
        </div>
      </div>
    </div>
  );
}
