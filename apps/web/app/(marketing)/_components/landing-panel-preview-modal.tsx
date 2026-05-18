"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ArrowRight, ChevronLeft, ChevronRight, Monitor } from "lucide-react";
import { LandingHeroOperationsCenter } from "./landing-hero-operations-center";

export const PANEL_PREVIEW_HASH = "#tugobo-panel-onizleme";

const PUBLIC_DEMO_PANEL = "/demo/otel-paneli";

const WALKTHROUGH = [
  {
    title: "Operasyon görünürlüğü",
    desc: "Günlük rezervasyon, direkt gelir ve bekleyen onaylar tek bakışta — tahmin değil, canlı rakamlar.",
  },
  {
    title: "Operasyon kuyruğu",
    desc: "SLA riskleri, insan onayı gereken işler ve ekip devralması gereken kayıtlar öncelik sırasıyla listelenir.",
  },
  {
    title: "Rezervasyon süreci",
    desc: "Talep → teklif → ödeme → onay adımları misafir bazında izlenir; AI koordinasyonu destekler, karar sizde.",
  },
  {
    title: "Operasyon denetimi",
    desc: "AI duraklatma, onay bekleyen işlemler ve kanal dağılımı — kontrol her zaman otelde kalır.",
  },
] as const;

type PanelPreviewContextValue = { openModal: () => void };

const PanelPreviewContext = createContext<PanelPreviewContextValue | null>(null);

export function useOpenPanelPreviewModal(): () => void {
  const ctx = useContext(PanelPreviewContext);
  return useCallback(() => {
    if (ctx) ctx.openModal();
    else if (typeof window !== "undefined") {
      window.location.assign("/" + PANEL_PREVIEW_HASH);
    }
  }, [ctx]);
}

export function PanelPreviewModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === PANEL_PREVIEW_HASH) {
        setOpen(true);
        const { pathname, search } = window.location;
        window.history.replaceState(null, "", `${pathname}${search}`);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <PanelPreviewContext.Provider value={{ openModal }}>
      {children}
      {mounted && open && createPortal(<PanelPreviewModal onClose={closeModal} />, document.body)}
    </PanelPreviewContext.Provider>
  );
}

export function PanelPreviewButton({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ctx = useContext(PanelPreviewContext);
  if (!ctx) {
    throw new Error("PanelPreviewButton must be used within PanelPreviewModalProvider");
  }
  return (
    <button type="button" id={id} onClick={() => ctx.openModal()} className={className}>
      {children}
    </button>
  );
}

function PanelPreviewModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const [step, setStep] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKey]);

  const current = WALKTHROUGH[step];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-[12px] animate-demo-backdrop-in sm:items-center sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative mt-auto flex max-h-[94dvh] w-full max-w-[min(1120px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-t-2xl border border-white/[0.12] bg-zinc-950/95 shadow-2xl shadow-black/80 backdrop-blur-xl animate-demo-panel-in sm:mt-0 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_55%)]" />

        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-400/80">Canlı panel turu</p>
            <h2 id={titleId} className="mt-1 text-[20px] font-bold tracking-tight text-white sm:text-[22px]">
              Dijital otel operasyon merkezi
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/42">
              AI operasyonu destekler — rezervasyon, onay ve ekip koordinasyonunun kontrolü sizde kalır.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
          <div className="lp-hero-mockup-stage mb-4">
            <LandingHeroOperationsCenter variant="expanded" />
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70">
                  Adım {step + 1} / {WALKTHROUGH.length}
                </p>
                <h3 className="mt-1 text-[16px] font-semibold text-white">{current.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/42">{current.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] disabled:opacity-30"
                  aria-label="Önceki adım"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(WALKTHROUGH.length - 1, s + 1))}
                  disabled={step === WALKTHROUGH.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-white/[0.08] disabled:opacity-30"
                  aria-label="Sonraki adım"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col gap-2 border-t border-white/[0.08] bg-zinc-950/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[11px] text-white/28">Form doldurmadan paneli inceleyin</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={PUBLIC_DEMO_PANEL}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-500"
            >
              <Monitor className="h-4 w-4" />
              Tam örnek paneli aç
              <ArrowRight className="h-3.5 w-3.5 opacity-80" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-[13px] font-medium text-white/55 hover:border-white/[0.18] hover:text-white/80"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}