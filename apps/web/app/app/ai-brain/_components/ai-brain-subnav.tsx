"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  FileSearch,
  ShieldAlert,
  Sparkles,
  UserCog,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUBNAV = [
  { href: "/app/ai-brain", label: "Overview", icon: Sparkles, exact: true },
  { href: "/app/ai-brain/persona", label: "Persona", icon: UserCog, exact: false },
  { href: "/app/ai-brain/knowledge", label: "Knowledge", icon: BookOpen, exact: false },
  { href: "/app/ai-brain/actions", label: "Actions", icon: Zap, exact: false },
  { href: "/app/ai-brain/escalations", label: "Escalations", icon: ShieldAlert, exact: false },
  { href: "/app/ai-brain/audit", label: "Audit", icon: FileSearch, exact: false },
] as const;

export function AIBrainSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-white/[0.07] bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Activity className="mr-1 hidden h-4 w-4 shrink-0 text-cyan-400/70 sm:block" aria-hidden />
          {SUBNAV.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors",
                  isActive
                    ? "border-cyan-500/35 bg-cyan-500/12 text-white shadow-sm shadow-cyan-500/10"
                    : "border-transparent text-white/45 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/75"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-cyan-300" : "text-white/30")} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
