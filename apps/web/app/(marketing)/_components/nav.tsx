"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { DemoButton } from "./demo-modal";

type NavDropdownItem = { href: string; label: string };

const PLATFORM_ITEMS: NavDropdownItem[] = [
  { href: "#platform", label: "Platform genel bakış" },
  { href: "#nasil", label: "Kurulum ve süreç" },
];

const COZUMLER_ITEMS: NavDropdownItem[] = [
  { href: "#birlesik-iletisim", label: "Birleşik misafir iletişimi" },
  { href: "#rezervasyon-akisi", label: "Rezervasyon akışı" },
  { href: "#operasyon-gorunurlugu", label: "Operasyonel görünürlük" },
  { href: "#ota-bagimsizlik", label: "Direkt kanal ve OTA" },
];

const KAYNAKLAR_ITEMS: NavDropdownItem[] = [
  { href: "#nasil", label: "Nasıl çalışır" },
  { href: "#referanslar", label: "Referanslar" },
  { href: "#fiyat", label: "Fiyatlandırma özeti" },
];

function DesktopDropdown({ label, items }: { label: string; items: NavDropdownItem[] }) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-white/50 transition-colors hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-200 group-hover:rotate-180"
          aria-hidden
        />
      </button>
      <div
        className="pointer-events-none absolute left-0 top-full z-50 pt-2 opacity-0 transition-[opacity] duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        role="menu"
      >
        <div className="min-w-[220px] rounded-xl border border-white/[0.08] bg-zinc-950/95 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {items.map((item) => (
            <a
              key={item.href + item.label}
              href={item.href}
              className="block px-3.5 py-2 text-[13px] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/90"
              role="menuitem"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkRow = (
    <>
      <DesktopDropdown label="Platform" items={PLATFORM_ITEMS} />
      <DesktopDropdown label="Çözümler" items={COZUMLER_ITEMS} />
      <DesktopDropdown label="Kaynaklar" items={KAYNAKLAR_ITEMS} />
      <a
        href="#fiyat"
        className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-white/50 transition-colors hover:text-white/85"
      >
        Fiyatlar
      </a>
      <a
        href="#hakkimizda"
        className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-white/50 transition-colors hover:text-white/85"
      >
        Hakkımızda
      </a>
    </>
  );

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 pt-4 md:pt-5">
      <div className="pointer-events-auto mx-auto max-w-[1400px] px-4 sm:px-6">
        <nav
          className="flex min-h-[72px] items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-zinc-950/55 px-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:px-6 lg:min-h-[76px] lg:px-7"
          aria-label="Ana"
        >
          <Link href="/" className="group flex shrink-0 items-center">
            <Image
              src="/Logo.png"
              alt="Tugobo AI"
              width={260}
              height={52}
              className="h-[34px] w-auto opacity-[0.95] transition-opacity group-hover:opacity-100 sm:h-[38px] [filter:drop-shadow(0_0_10px_rgba(255,255,255,0.06))]"
              priority
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">{linkRow}</div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Link
              href="/auth/login"
              className="px-3 py-2 text-[13px] font-medium text-white/45 transition-colors hover:text-white/85"
            >
              Giriş yap
            </Link>
            <DemoButton className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">
              Kurulum görüşmesi
              <ChevronRight className="h-3.5 w-3.5 opacity-90" aria-hidden />
            </DemoButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <DemoButton className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]">
              Kurulum
            </DemoButton>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl p-2.5 text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/80"
              aria-expanded={open}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open ? (
          <div className="mt-2 max-h-[min(70vh,calc(100dvh-8rem))] overflow-y-auto rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">Platform</p>
              {PLATFORM_ITEMS.map((item) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.04]"
                >
                  {item.label}
                </a>
              ))}
              <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">Çözümler</p>
              {COZUMLER_ITEMS.map((item) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.04]"
                >
                  {item.label}
                </a>
              ))}
              <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">Kaynaklar</p>
              {KAYNAKLAR_ITEMS.map((item) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.04]"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#fiyat"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.04]"
              >
                Fiyatlar
              </a>
              <a
                href="#hakkimizda"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.04]"
              >
                Hakkımızda
              </a>
            </div>
            <div className="pt-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/45 hover:bg-white/[0.04] hover:text-white/75"
              >
                Giriş yap
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
