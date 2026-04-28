"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Menu, X } from "lucide-react";
import { DemoButton } from "./demo-modal";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#kanallar", label: "Kanallar" },
  { href: "#nasil", label: "Nasıl çalışır" },
  { href: "#fiyat", label: "Fiyatlar" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-[10px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 group"
        >
          <Image
            src="/Logo.png"
            alt="Tugobo AI"
            width={260}
            height={52}
            className="h-[38px] sm:h-[52px] w-auto opacity-[0.95] group-hover:opacity-100 transition-opacity [filter:drop-shadow(0_0_10px_rgba(255,255,255,0.07))]"
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] text-white/45 font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-white/75 transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[13px] font-medium text-zinc-300 hover:text-white transition-all"
          >
            Dashboard&apos;u incele
          </Link>
          <DemoButton className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[13px] font-semibold text-white transition-all active:scale-[0.97] shadow-md shadow-blue-900/30">
            Demo talep et <ChevronRight className="w-3.5 h-3.5" />
          </DemoButton>
        </div>

        {/* Mobile: compact CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <DemoButton className="flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[12px] font-semibold text-white transition-colors">
            Demo
          </DemoButton>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 -mr-1 text-white/45 hover:text-white/75 transition-colors"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/[0.05] bg-zinc-950 backdrop-blur-xl">
          <div className="px-6 py-3">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center py-3 text-[14px] font-medium text-white/55 hover:text-white/85 transition-colors border-b border-white/[0.04] last:border-0"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 pb-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block py-2 text-[13px] text-white/35 hover:text-white/60 transition-colors"
              >
                Dashboard&apos;u incele
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
