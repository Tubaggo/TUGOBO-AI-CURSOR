"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#kanallar", label: "Kanallar" },
  { href: "#nasil", label: "Nasıl çalışır" },
  { href: "#fiyat", label: "Fiyatlar" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/Logo.png"
            alt="Tugobo AI"
            width={200}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="hidden sm:block text-[11px] text-white/20 border border-white/[0.08] px-2 py-0.5 rounded-full">
            beta
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] text-white/35">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-white/65 transition-colors">
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-[13px] text-white/30 hover:text-white/60 transition-colors"
          >
            Giriş yap
          </Link>
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[13px] font-medium text-white transition-all active:scale-[0.97]"
          >
            Demo talep et <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile: compact CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/demo"
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 text-[12px] font-medium text-white"
          >
            Demo
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-white/40 hover:text-white/70 transition-colors"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/[0.05] bg-zinc-950/98 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block py-3 text-[14px] text-white/50 hover:text-white/80 transition-colors border-b border-white/[0.04] last:border-0"
              >
                {label}
              </a>
            ))}
            <div className="pt-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block py-2.5 text-[14px] text-white/35 hover:text-white/60 transition-colors"
              >
                Giriş yap
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
