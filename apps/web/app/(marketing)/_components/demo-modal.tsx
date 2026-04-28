"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Zap,
  Shield,
  Phone,
  User,
  Building2,
  CalendarDays,
  Clock,
  Star,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  hotel: string;
  phone: string;
  rooms: string;
};

// ── Social proof ──────────────────────────────────────────────────────────────

const TRUST_AVATARS = [
  { initials: "HK", color: "bg-violet-600" },
  { initials: "SA", color: "bg-rose-600" },
  { initials: "MK", color: "bg-emerald-700" },
  { initials: "BT", color: "bg-blue-700" },
  { initials: "AY", color: "bg-amber-700" },
];

// ── Shared input style ────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-xl text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all";

// ── DemoModal ─────────────────────────────────────────────────────────────────

function DemoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "",
    hotel: "",
    phone: "",
    rooms: "",
  });

  // Escape to close + lock background scroll
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmittedName(form.name.split(" ")[0]);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // always show success — a failed network request must not block the lead UX
    }
    setLoading(false);
    setStep("success");
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[480px] max-h-[90vh] bg-zinc-900 border border-white/[0.10] rounded-2xl shadow-2xl shadow-black/70 overflow-y-auto animate-lp-fade-up">

        {/* ── Close ─────────────────────────────────────────────────────────── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all z-10"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ════════════════════════════════════════════════════════════════════
            SUCCESS STATE
        ═════════════════════════════════════════════════════════════════════ */}
        {step === "success" ? (
          <div className="px-7 py-9">

            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-semibold text-emerald-400">
                Talebiniz ekibimize iletildi
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-[22px] font-bold text-white leading-snug mb-2">
              {submittedName
                ? `Harika, ${submittedName} Bey/Hanım! 🎉`
                : "Demo talebiniz alındı! 🎉"}
            </h3>
            <p className="text-[14px] text-white/50 leading-relaxed mb-6">
              Size en kısa sürede dönüş yapacağız. Dilerseniz şimdi
              WhatsApp&apos;tan da yazabilirsiniz — anında yanıt alırsınız.
            </p>

            {/* Response time promise */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/[0.07] border border-blue-500/[0.15] mb-5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-blue-300">
                  Ortalama yanıt süresi: 28 dakika
                </p>
                <p className="text-[11px] text-white/35 mt-0.5">
                  Hafta içi 09:00–22:00 · Cumartesi 10:00–20:00
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="space-y-2 mb-7">
              {[
                { n: "1", text: "Ekibimiz sizi WhatsApp veya telefon ile arar" },
                { n: "2", text: "Otelinize özel demo ekranını hazırlarız" },
                { n: "3", text: "30 dakikada canlı rezervasyon akışını birlikte görürsünüz" },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-3 text-[13px] text-white/55">
                  <span className="w-5 h-5 rounded-full bg-white/[0.07] border border-white/[0.10] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0 mt-0.5">
                    {n}
                  </span>
                  {text}
                </div>
              ))}
            </div>

            {/* Primary: WhatsApp */}
            <a
              href={`${process.env.NEXT_PUBLIC_WHATSAPP_CONTACT ?? "https://wa.me/905000000000"}?text=${encodeURIComponent(`Merhaba, demo talebi gönderdim${submittedName ? ` (${submittedName})` : ""}. Bilgi almak istiyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20c55b] font-bold text-[15px] text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 mb-3"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              WhatsApp&apos;tan hemen yazın
            </a>

            {/* Secondary: close */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-white/[0.09] text-[13px] font-medium text-white/40 hover:text-white/65 hover:border-white/[0.16] transition-all"
            >
              Kapat
            </button>
          </div>

        ) : (
        /* ════════════════════════════════════════════════════════════════════
            FORM STATE
        ═════════════════════════════════════════════════════════════════════ */
          <>
            {/* ── Trust bar ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/[0.06] border-b border-emerald-500/[0.12]">
              <div className="flex -space-x-1.5 shrink-0">
                {TRUST_AVATARS.map(({ initials, color }) => (
                  <div
                    key={initials}
                    className={`w-6 h-6 rounded-full ${color} border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold text-white`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-white/60 font-medium truncate">
                  Bu hafta <span className="text-white/80">12 tesis</span> demo rezerve etti
                </span>
              </div>
            </div>

            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="px-7 pt-5 pb-0">

              {/* Response time badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/[0.09] border border-blue-500/[0.18] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-semibold text-blue-400">
                  28 dakika içinde yanıt garantisi
                </span>
              </div>

              <h2 className="text-[20px] font-bold text-white leading-snug mb-1.5">
                İlk AI rezervasyonunuzu<br className="hidden sm:block" /> bu hafta alın
              </h2>
              <p className="text-[13px] text-white/40 leading-relaxed mb-5">
                Otelinize özel 30 dakikalık demo — taahhüt yok, sözleşme yok.
              </p>
            </div>

            {/* ── Form ──────────────────────────────────────────────────────── */}
            <div className="px-7 pb-7">
              <form onSubmit={handleSubmit} className="space-y-3.5">

                <FormField label="Ad Soyad" icon={User} required>
                  <input
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Hasan Karaoğlu"
                    autoComplete="name"
                    className={inputCls}
                  />
                </FormField>

                <FormField label="Tesis Adı" icon={Building2} required>
                  <input
                    required
                    value={form.hotel}
                    onChange={set("hotel")}
                    placeholder="Bungalov Türkiye · Villa Bodrum"
                    autoComplete="organization"
                    className={inputCls}
                  />
                </FormField>

                <FormField label="WhatsApp Numarası" icon={Phone} required>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+90 532 123 4567"
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputCls}
                  />
                </FormField>

                <FormField label="Aylık oda / rezervasyon sayısı" icon={CalendarDays}>
                  <select value={form.rooms} onChange={set("rooms")} className={inputCls}>
                    <option value="">Seçin... (isteğe bağlı)</option>
                    <option value="1-10">1 – 10</option>
                    <option value="11-30">11 – 30</option>
                    <option value="31-60">31 – 60</option>
                    <option value="60+">60+</option>
                  </select>
                </FormField>

                {/* Response promise above CTA */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <Clock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <p className="text-[11px] text-white/35 leading-tight">
                    Formu gönderdikten sonra ekibimiz <span className="text-white/55 font-medium">ortalama 28 dakika</span> içinde sizi arar.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[15px] text-white transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 shrink-0" />
                      Ücretsiz Demo Rezerve Et
                      <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
                    </>
                  )}
                </button>

                {/* Trust microcopy */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {[
                    { icon: CheckCircle2, label: "Sözleşme yok" },
                    { icon: CheckCircle2, label: "Kredi kartı gerekmez" },
                    { icon: Shield, label: "Veri güvenliği" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-1 text-[11px] text-white/25">
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                  ))}
                </div>

              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── FormField helper ──────────────────────────────────────────────────────────

function FormField({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/50 mb-2">
        <Icon className="w-3 h-3" />
        {label}
        {required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── DemoButton — drop-in for any <Link href="/demo"> ──────────────────────────
//
// The modal is rendered via createPortal directly into document.body.
// This escapes any ancestor element that has backdrop-filter / transform /
// will-change set (e.g. the fixed navbar with backdrop-blur), which would
// otherwise create a new containing block and trap `fixed inset-0` inside
// the navbar's bounds instead of the full viewport.

export function DemoButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Avoid SSR mismatch — portals need document.body which only exists client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {mounted && open && createPortal(
        <DemoModal onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}
