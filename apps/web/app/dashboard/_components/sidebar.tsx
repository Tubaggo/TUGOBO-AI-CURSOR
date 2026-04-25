"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Settings,
  Zap,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare, badge: 6 },
  { href: "/dashboard/reservations", label: "Reservations", icon: Calendar, badge: null },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full bg-zinc-900 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Tugobo AI</p>
            <p className="text-[10px] text-white/40 mt-0.5">Hotel Intelligence</p>
          </div>
        </div>
      </div>

      {/* Hotel selector */}
      <div className="px-3 pt-4 pb-2">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
              H
            </div>
            <span className="text-xs text-white/70 font-medium truncate">Grand Hotel Demo</span>
          </div>
          <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Main
        </p>
        {navItems.map(({ href, label, icon: Icon, badge, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/50"
                  )}
                />
                <span className="font-medium">{label}</span>
              </div>
              {badge ? (
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              ) : null}
              {isActive && !badge && (
                <div className="w-1 h-1 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06] space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors text-sm">
          <Bell className="w-4 h-4" />
          <span className="font-medium">Notifications</span>
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            G
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/60 truncate">hotel@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
