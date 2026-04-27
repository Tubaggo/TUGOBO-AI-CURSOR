"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Building2,
  Phone,
  Mail,
  User,
  Zap,
  Bot,
  MessageSquare,
  Globe,
  BarChart3,
} from "lucide-react";

type FormState = {
  name: string;
  hotel: string;
  phone: string;
  email: string;
  type: string;
  rooms: string;
};

const DEMO_FEATURES = [
  { icon: MessageSquare, label: "Canlı WhatsApp rezervasyon akışı" },
  { icon: Globe, label: "Çok dilli AI konuşma motoru" },
  { icon: BarChart3, label: "OTA komisyon tasarruf hesabı" },
  { icon: Zap, label: "30 dakika kurulum süreci" },
];

export default function DemoPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    hotel: "",
    phone: "",
    email: "",
    type: "",
    rooms: "",
  });

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // Silently succeed — UX must not break on network errors
    }
    setLoading(false);
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <h1 className="text-[28px] font-bold mb-3">Demo talebiniz alındı!</h1>
          <p className="text-white/45 leading-relaxed mb-8">
            24 saat içinde ekibimiz sizi arayacak ve otelinize özel demo
            randevusunu ayarlayacak.
          </p>

          <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-6 text-left mb-8 space-y-3">
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
              Demo&apos;da görecekleriniz
            </p>
            {DEMO_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[13px] text-white/60">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <a
              href="https://wa.me/905000000000"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] text-[13px] font-medium text-emerald-400 hover:bg-emerald-500/[0.10] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp&apos;tan hemen yazın
            </a>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] text-white/30 hover:text-white/55 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/Logo.png"
              alt="Tugobo AI"
              width={200}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Geri dön</span>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[12px] text-blue-400 font-medium mb-6">
              <Calendar className="w-3.5 h-3.5" />
              30 dakikalık ücretsiz demo
            </div>
            <h1 className="text-[34px] sm:text-[40px] font-bold tracking-tight mb-3">
              Demo randevusu alın
            </h1>
            <p className="text-white/40 text-[15px] leading-relaxed max-w-sm mx-auto">
              Otelinize özel WhatsApp rezervasyon akışını canlı olarak
              gösteriyoruz. Taahhüt yok.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-zinc-900 border border-white/[0.07] rounded-2xl p-6 sm:p-8 space-y-5 order-2 lg:order-1"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <DemoField label="Adınız" icon={User} required>
                  <input
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Hasan Karaoğlu"
                    className={inputCls}
                  />
                </DemoField>
                <DemoField label="Tesisinizin adı" icon={Building2} required>
                  <input
                    required
                    value={form.hotel}
                    onChange={set("hotel")}
                    placeholder="Bungalov Türkiye"
                    className={inputCls}
                  />
                </DemoField>
                <DemoField label="WhatsApp numaranız" icon={Phone} required>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+90 532 123 4567"
                    className={inputCls}
                  />
                </DemoField>
                <DemoField label="E-posta adresiniz" icon={Mail}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="siz@oteliniz.com"
                    className={inputCls}
                  />
                </DemoField>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <DemoField label="Tesis türü">
                  <select value={form.type} onChange={set("type")} className={inputCls}>
                    <option value="">Seçin...</option>
                    <option>Butik Otel</option>
                    <option>Bungalov / Tatil Köyü</option>
                    <option>Villa</option>
                    <option>Apart Otel</option>
                    <option>Pansiyon</option>
                    <option>Seyahat Acentesi</option>
                    <option>Diğer</option>
                  </select>
                </DemoField>
                <DemoField label="Oda / konaklama sayısı">
                  <select value={form.rooms} onChange={set("rooms")} className={inputCls}>
                    <option value="">Seçin...</option>
                    <option>1–5</option>
                    <option>6–15</option>
                    <option>16–30</option>
                    <option>31–50</option>
                    <option>50+</option>
                  </select>
                </DemoField>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-[15px] transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Demo randevusu talep et
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-white/25">
                Taahhüt yok · Kredi kartı gerekmez · Ücretsiz
              </p>
            </form>

            {/* Side panel */}
            <div className="order-1 lg:order-2 space-y-4">
              {/* Trust */}
              <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-5">
                <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">
                  Demo&apos;da görecekleriniz
                </p>
                <div className="space-y-3">
                  {DEMO_FEATURES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-[12px] text-white/55">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "47+", l: "Aktif tesis" },
                  { v: "3.2K+", l: "Rezervasyon" },
                  { v: "₺42M", l: "Gelir" },
                ].map(({ v, l }) => (
                  <div
                    key={l}
                    className="text-center py-3 px-2 rounded-xl bg-zinc-900/60 border border-white/[0.05]"
                  >
                    <p className="text-[17px] font-bold text-white">{v}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {/* Mia avatar */}
              <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white/80 mb-1">
                    Mia AI diyor ki...
                  </p>
                  <p className="text-[11px] text-white/40 leading-relaxed italic">
                    &ldquo;Demo randevunuzu aldım. 24 saat içinde ekibimiz
                    sizi arayacak. Sorularınız için WhatsApp&apos;tan
                    ulaşabilirsiniz.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoField({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/50 mb-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-blue-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all";
