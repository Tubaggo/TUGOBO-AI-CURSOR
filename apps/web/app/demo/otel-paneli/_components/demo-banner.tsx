"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function DemoBanner() {
  const t = useTranslations("demo");

  return (
    <div className="flex shrink-0 flex-col border-b border-white/[0.06] bg-zinc-900/90 px-4 py-2.5 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:text-left">
      <p className="text-[11px] leading-snug text-white/45">
        <span className="font-medium text-white/60">{t("bannerTitle")}</span>
        <span className="mx-1.5 text-white/20" aria-hidden>
          ·
        </span>
        <span>{t("bannerPreview")}</span>
        <span className="mx-1.5 text-white/20" aria-hidden>
          ·
        </span>
        <span className="text-white/35">{t("bannerSubtitle")}</span>
      </p>
      <Link
        href="/auth/login"
        className="mt-2 shrink-0 text-[11px] font-medium text-blue-400/90 underline-offset-4 hover:text-blue-300 hover:underline sm:mt-0 sm:ml-4"
      >
        {t("loginCta")}
      </Link>
    </div>
  );
}
