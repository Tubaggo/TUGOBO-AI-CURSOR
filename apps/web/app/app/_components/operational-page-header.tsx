"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

export function OperationalPageHeader({
  eyebrow,
  title,
  description,
  live = true,
  accent = "blue",
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  live?: boolean;
  accent?: "blue" | "amber" | "violet" | "emerald";
  actions?: ReactNode;
}) {
  const t = useTranslations("common");
  const accentClass = {
    blue: "text-blue-400/55",
    amber: "text-amber-400/55",
    violet: "text-violet-400/55",
    emerald: "text-emerald-400/55",
  }[accent];

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.14em]", accentClass)}>{eyebrow}</p>
        <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="mt-0.5 max-w-xl text-sm text-white/38">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {live ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Radio className="h-3 w-3" />
              {t("liveOperations")}
            </span>
          </div>
        ) : null}
        {actions}
      </div>
    </div>
  );
}

