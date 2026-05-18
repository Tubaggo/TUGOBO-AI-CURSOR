import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  TrendingUp,
  Banknote,
  Clock,
  MessageSquare,
  CalendarCheck,
  Zap,
  ArrowRight,
  Shield,
  Phone,
  ShieldCheck,
  Globe,
  BarChart3,
  Layers,
  Users,
  Share2,
  Monitor,
  FileText,
  PauseCircle,
  Eye,
  ClipboardCheck,
} from "lucide-react";
import { Nav } from "./_components/nav";
import { DemoButton } from "./_components/demo-modal";
import { PanelPreviewButton } from "./_components/landing-panel-preview-modal";
import { LandingHeroOperationsCenter } from "./_components/landing-hero-operations-center";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STRIP = [
  { icon: Monitor, title: "Tek yönetim paneli", subtitle: "Rezervasyon, iletişim ve operasyon bir arada" },
  { icon: Users, title: "Ekip kontrolü", subtitle: "Onay, devralma ve yönlendirme sizde" },
  { icon: TrendingUp, title: "Gelir takibi", subtitle: "Direkt rezervasyon ve OTA tasarrufu görünür" },
  { icon: MessageSquare, title: "Tüm kanallar", subtitle: "WhatsApp, Instagram ve web sitesi" },
] as const;

const UNIFIED_OPS = [
  {
    icon: Monitor,
    title: "Merkezi operasyon yönetimi",
    desc: "Günlük otel işlerinizi tek panelden takip edin. Bekleyen talepler, onaylar ve rezervasyonlar aynı ekranda.",
    accent: "blue",
  },
  {
    icon: MessageSquare,
    title: "Misafir iletişimi ve rezervasyon",
    desc: "Gelen mesajlar kaybolmaz; her talep rezervasyon sürecine bağlanır ve ekip tarafından izlenir.",
    accent: "violet",
  },
  {
    icon: BarChart3,
    title: "Operasyon görünürlüğü",
    desc: "Bugün kaç rezervasyon kapandı, ne kadar gelir üretildi, hangi talepler bekliyor — net ve ölçülebilir.",
    accent: "emerald",
  },
  {
    icon: Layers,
    title: "Direkt rezervasyon yönetimi",
    desc: "Misafiri kendi kanallarınızdan karşılayın; OTA komisyonuna daha az bağımlı, daha yüksek marjlı büyüme.",
    accent: "amber",
  },
] as const;

const AI_SUPERVISED = [
  {
    icon: Zap,
    title: "AI operasyonu destekler",
    desc: "Müsaitlik, fiyat ve yanıtlar otomatik hazırlanır; rutin iş yükü azalır, ekip sahaya odaklanır.",
  },
  {
    icon: ClipboardCheck,
    title: "Hassas adımlarda onay",
    desc: "İndirim, yüksek tutar veya istisna durumlarında sistem durur; karar ve onay ekibinizdedir.",
  },
  {
    icon: Users,
    title: "Anında ekip devralması",
    desc: "Resepsiyon veya satış tek tıkla devreye girer; misafir geçmişi ve son işlemler hazır gelir.",
  },
  {
    icon: PauseCircle,
    title: "AI duraklat, devam ettir",
    desc: "Ekip müdahale ederken AI bekler; işlem bitince aynı kayıt üzerinden güvenle devam edilir.",
  },
] as const;

const CHANNELS = [
  {
    icon: MessageSquare,
    title: "WhatsApp",
    desc: "En yoğun kanalınız. Talepler doğrudan operasyon paneline düşer; ekip önceliği ve durumu görür.",
    accent: "emerald",
  },
  {
    icon: Share2,
    title: "Instagram DM",
    desc: "Kampanya ve DM mesajları aynı merkezde. Hangi konuşmanın beklemede olduğu her zaman bellidir.",
    accent: "rose",
  },
  {
    icon: Monitor,
    title: "Web sitesi",
    desc: "Siteden gelen talepler rezervasyon sürecine bağlanır; kaynak ve aşama bilgisi kayıt altında kalır.",
    accent: "blue",
  },
] as const;

const RESERVATION_REVENUE = [
  {
    icon: FileText,
    title: "Rezervasyon süreci",
    desc: "Talep → teklif → ödeme → onay adımları standarttır. Ekip hangi misafirin hangi aşamada olduğunu görür.",
  },
  {
    icon: Banknote,
    title: "Gelir takibi",
    desc: "Direkt rezervasyon geliri, bekleyen ödemeler ve günlük kapanışlar panelde özetlenir.",
  },
  {
    icon: TrendingUp,
    title: "OTA tasarrufu",
    desc: "Komisyon ödemek yerine kendi kanallarınızdan satış yapın; tasarruf ve marj etkisini takip edin.",
  },
  {
    icon: CalendarCheck,
    title: "Dolu geceleri artırın",
    desc: "Bekleyen talepleri kaçırmayın; gece ve hafta sonu trafiğinde bile operasyon devam eder.",
  },
] as const;

const VISIBILITY = [
  { icon: CalendarCheck, title: "Onaylı rezervasyonlar", desc: "Günlük ve haftalık kapanış sayıları." },
  { icon: TrendingUp, title: "Direkt gelir", desc: "Kendi kanallarınızdan gelen ciro." },
  { icon: Banknote, title: "OTA komisyon tasarrufu", desc: "Platforma gitmeyen marj." },
  { icon: Clock, title: "Yanıt süresi", desc: "Misafir bekleme süresi ve SLA takibi." },
  { icon: ShieldCheck, title: "Kaçırılmayan talepler", desc: "Bekleyen ve riskli işlerin listesi." },
] as const;

const TRUST = [
  { icon: Eye, title: "Şeffaf operasyon", desc: "Ekip ve yönetim aynı panelde aynı gerçeği görür." },
  { icon: Shield, title: "Kayıt altında işlemler", desc: "Kim onayladı, kim devraldı — geriye dönük izlenebilir." },
  { icon: Users, title: "Ekip kontrolünde AI", desc: "AI yardımcıdır; son söz ve yetki otelde kalır." },
  { icon: BarChart3, title: "Ölçülebilir sonuçlar", desc: "Rezervasyon ve gelir rakamları net raporlanır." },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Gece gelen talepler artık kaçmıyor. Operasyon yükü belirgin şekilde azaldı; ekip aynı panelden koordine oluyor.",
    role: "Genel Müdür",
    property: "Butik otel · Ege",
  },
  {
    quote:
      "Direkt rezervasyon oranımız yükseldi. OTA tasarrufunu ve bekleyen onayları aynı ekranda görmek yönetimi kolaylaştırdı.",
    role: "Satış ve gelir",
    property: "Şehir oteli · Akdeniz",
  },
  {
    quote:
      "AI süreçleri hızlandırıyor ama kontrol bizde. Onay ve devralma modeli ekibin güvenini artırdı.",
    role: "Operasyon Müdürü",
    property: "Resort · Antalya",
  },
] as const;

const ACCENT_RING: Record<string, string> = {
  blue: "border-blue-500/[0.15] bg-blue-500/[0.04] hover:border-blue-500/[0.25]",
  emerald: "border-emerald-500/[0.15] bg-emerald-500/[0.04] hover:border-emerald-500/[0.25]",
  violet: "border-violet-500/[0.15] bg-violet-500/[0.04] hover:border-violet-500/[0.25]",
  amber: "border-amber-500/[0.15] bg-amber-500/[0.04] hover:border-amber-500/[0.25]",
  rose: "border-rose-500/[0.15] bg-rose-500/[0.04] hover:border-rose-500/[0.25]",
};

const ACCENT_ICON: Record<string, string> = {
  blue: "bg-blue-500/[0.10] text-blue-400",
  emerald: "bg-emerald-500/[0.10] text-emerald-400",
  violet: "bg-violet-500/[0.10] text-violet-400",
  amber: "bg-amber-500/[0.10] text-amber-400",
  rose: "bg-rose-500/[0.10] text-rose-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-400/65">{eyebrow}</span>
      <h2 className="mt-3 mb-4 text-[32px] font-bold tracking-tight md:text-[34px]">{title}</h2>
      <p className="text-[15px] leading-relaxed text-white/40">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent = "blue",
}: {
  icon: typeof Monitor;
  title: string;
  desc: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-2xl border p-6 transition-colors duration-300 ${ACCENT_RING[accent] ?? ACCENT_RING.blue}`}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_ICON[accent] ?? ACCENT_ICON.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-[15px] font-semibold text-white">{title}</h3>
      <p className="text-[13px] leading-relaxed text-white/38">{desc}</p>
    </div>
  );
}

function SectionShell({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`border-t border-white/[0.05] ${className}`}>
      <div className="mx-auto max-w-[1400px] px-6 py-24">{children}</div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] bg-gradient-to-b from-[#020617] via-[#050a18] to-[#030712] text-white antialiased selection:bg-blue-500/30">
      <Nav />

      {/* 1. Hero */}
      <section id="tugobo-hero" className="relative overflow-hidden pb-16 pt-[5.5rem] sm:pt-28 md:pb-20 md:pt-32">
        <div className="pointer-events-none absolute inset-0 lp-grid opacity-[0.5]" />
        <div className="pointer-events-none absolute inset-0 lp-hero-aurora" />
        <div className="pointer-events-none absolute inset-0 lp-noise" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(59,130,246,0.1),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_80%,transparent_20%,#030712_90%)]" />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
            <div className="py-6 text-center lg:py-10 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-[12px] font-medium text-white/60 shadow-[0_0_24px_-8px_rgba(59,130,246,0.35)] backdrop-blur-sm sm:text-[13px]">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
              Bu otelin dijital operasyon merkezi
            </div>

            <h1 className="text-balance text-[2.1rem] font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.5rem]">
              Rezervasyon, iletişim ve operasyon{" "}
              <span className="bg-gradient-to-r from-white via-white to-white/75 bg-clip-text text-transparent">
                tek panelde.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-[540px] text-pretty text-[15px] leading-[1.75] text-white/42 lg:mx-0 md:text-[17px]">
              AI operasyonu sürekli destekler: misafir talepleri, rezervasyon süreci ve gelir görünürlüğü aynı
              merkezde. Ekip iş yükü azalır —{" "}
              <span className="text-white/65">operasyonun kontrolü her zaman sizde kalır.</span>
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <DemoButton
                id="tugobo-demo-talep"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_32px_-8px_rgba(59,130,246,0.55)] transition-all active:scale-[0.98] sm:min-w-[240px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-[filter] group-hover:brightness-110" />
                <Zap className="relative h-4 w-4 shrink-0" />
                <span className="relative">Operasyon turu planlayın</span>
              </DemoButton>
              <PanelPreviewButton
                id="tugobo-panel-onizleme-cta"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.04] px-8 py-3.5 text-[15px] font-medium text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-white/[0.07] hover:text-white active:scale-[0.98] sm:min-w-[220px]"
              >
                Canlı paneli inceleyin
                <ArrowRight className="h-4 w-4 shrink-0 opacity-75" />
              </PanelPreviewButton>
            </div>
            <p className="mt-4 text-[12px] text-white/28">30 dakika · Taahhüt yok · Türkçe destek</p>

            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {HERO_STRIP.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-white/[0.08] bg-zinc-950/50 px-3.5 py-3 text-left backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent">
                    <Icon className="h-3.5 w-3.5 text-blue-400/70" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white/85">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-white/35">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            </div>

            <div className="relative lg:py-6">
              <LandingHeroOperationsCenter />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Unified hotel operations */}
      <SectionShell id="operasyon" className="bg-zinc-900/15">
        <SectionIntro
          eyebrow="Otel operasyonu"
          title="Tüm otel operasyonunuz tek merkezde"
          description="Dağınık mesajlar, kayıp talepler ve belirsiz rezervasyon süreçleri yerine; misafir iletişimi, rezervasyon ve gelir takibi aynı yönetim panelinde birleşir."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {UNIFIED_OPS.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </SectionShell>

      {/* 3. Human-supervised AI */}
      <SectionShell id="ai-ekip" className="bg-zinc-950">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/75">AI + ekip iş birliği</span>
            <h2 className="mt-3 mb-4 text-[32px] font-bold leading-tight tracking-tight md:text-[34px]">
              AI operasyonu destekler,
              <br />
              kontrol sizde kalır.
            </h2>
            <p className="mb-6 text-[15px] leading-relaxed text-white/40">
              Sistem gece gündüz misafir taleplerini işler, teklif hazırlar ve süreci takip eder. Önemli kararlarda
              durur ve ekibinizi bilgilendirir — otomatik değil,{" "}
              <span className="text-white/55">sizin kurallarınıza göre çalışan bir operasyon sistemi.</span>
            </p>
            <blockquote className="border-l-2 border-amber-500/35 pl-4 text-[14px] italic text-white/35">
              &ldquo;AI operasyonu sürekli çalışıyor, ama operasyonun kontrolü hâlâ bende.&rdquo;
            </blockquote>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {AI_SUPERVISED.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-amber-500/[0.12] bg-amber-500/[0.03] p-5"
              >
                <item.icon className="mb-3 h-5 w-5 text-amber-400/90" />
                <h3 className="mb-1.5 text-[14px] font-semibold text-white">{item.title}</h3>
                <p className="text-[12px] leading-relaxed text-white/38">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      {/* 4. Multi-channel */}
      <SectionShell id="kanallar" className="bg-zinc-900/15">
        <SectionIntro
          eyebrow="Çok kanallı iletişim"
          title="Misafir nereden yazarsa yazsın — tek merkezden yönetin"
          description="WhatsApp, Instagram ve web siteniz ayrı ayrı takip edilmez. Tüm mesajlar operasyon panelinize düşer; ekip kanal fark etmeden aynı süreçle çalışır."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {CHANNELS.map((ch) => (
            <FeatureCard key={ch.title} {...ch} />
          ))}
        </div>
      </SectionShell>

      {/* 5. Reservation & revenue */}
      <SectionShell id="rezervasyon-gelir" className="bg-zinc-950">
        <SectionIntro
          eyebrow="Rezervasyon ve gelir"
          title="Rezervasyon süreci ve gelir takibi birlikte"
          description="Misafir talebinden onaylı rezervasyona kadar her adım görünür. Direkt satış gelirinizi ve OTA tasarrufunuzu aynı panelden takip edin."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESERVATION_REVENUE.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-emerald-500/[0.12] bg-emerald-500/[0.03] p-6"
            >
              <item.icon className="mb-4 h-5 w-5 text-emerald-400" />
              <h3 className="mb-2 text-[15px] font-semibold text-white">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/38">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* 6. Live visibility */}
      <SectionShell id="gorunurluk" className="bg-zinc-900/15">
        <SectionIntro
          eyebrow="Canlı operasyon takibi"
          title="Otelinizde bugün ne oluyor — tek bakışta"
          description="Yönetici ve operasyon ekibi aynı rakamları görür. Tahmin değil; günlük rezervasyon, gelir ve bekleyen işler net şekilde raporlanır."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {VISIBILITY.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/[0.07] bg-zinc-950/50 p-5 text-center sm:text-left"
            >
              <item.icon className="mx-auto mb-3 h-5 w-5 text-white/40 sm:mx-0" />
              <h3 className="mb-1 text-[13px] font-semibold text-white">{item.title}</h3>
              <p className="text-[11px] text-white/35">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* 7. Trust */}
      <SectionShell id="guven" className="bg-zinc-950">
        <SectionIntro
          eyebrow="Güven"
          title="Otellerin güvenebileceği bir operasyon sistemi"
          description="Kurumsal işletmeler için tasarlandı: şeffaf süreçler, kayıt altı işlemler ve ekip kontrolünde AI desteği."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-6">
              <item.icon className="mb-4 h-5 w-5 text-blue-400/80" />
              <h3 className="mb-2 text-[15px] font-semibold text-white">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/38">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      {/* 8. Social proof */}
      <SectionShell id="referanslar" className="bg-zinc-900/15">
        <SectionIntro
          eyebrow="Otel işletmecilerinden"
          title="Operasyon yükü azalır, görünürlük artar"
          description="Butik otellerden şehir otellerine — ekip koordinasyonu, direkt rezervasyon ve AI destekli süreçlerde ölçülebilir sonuçlar."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.property}
              className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-6 backdrop-blur-sm"
            >
              <p className="mb-5 text-[14px] leading-relaxed text-white/55">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <p className="text-[13px] font-semibold text-white/80">{t.role}</p>
                <p className="text-[11px] text-white/30">{t.property}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </SectionShell>

      {/* 9. Pricing */}
      <SectionShell id="fiyat" className="bg-zinc-950">
        <SectionIntro
          eyebrow="Fiyatlar"
          title="Personel maliyetinden düşük, getirisi ölçülebilir"
          description="İşletmenizin büyüklüğüne göre paketler. Tüm planlarda Türkçe destek ve operasyon paneli dahil."
        />
        <div className="grid items-start gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">Starter</p>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-[38px] font-bold tabular-nums">₺2.990</span>
              <span className="text-sm text-white/30">/ay</span>
            </div>
            <p className="mb-6 text-[12px] text-white/30">1–10 oda · 500 konuşma/ay</p>
            <ul className="mb-8 space-y-2.5">
              {["WhatsApp", "Operasyon paneli", "Türkçe + 1 dil", "Gelir ve rezervasyon takibi", "E-posta destek"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/70" />
                  {f}
                </li>
              ))}
            </ul>
            <DemoButton className="block w-full rounded-xl border border-white/[0.10] py-2.5 text-center text-[13px] font-medium text-white/50 transition-all hover:border-white/[0.20] hover:text-white/80">
              Görüşme talep et
            </DemoButton>
          </div>

          <div className="relative rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] p-7">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/25">
                En Popüler
              </span>
            </div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-blue-400/70">Growth</p>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-[38px] font-bold tabular-nums">₺5.990</span>
              <span className="text-sm text-white/30">/ay</span>
            </div>
            <p className="mb-6 text-[12px] text-white/30">11–30 oda · 2.000 konuşma/ay</p>
            <ul className="mb-8 space-y-2.5">
              {[
                "WhatsApp + Instagram DM",
                "Operasyon paneli",
                "7 dil desteği",
                "OTA komisyon takibi",
                "Direkt rezervasyon",
                "Öncelikli destek",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                  {f}
                </li>
              ))}
            </ul>
            <DemoButton className="block w-full rounded-xl bg-blue-600 py-2.5 text-center text-[13px] font-semibold text-white transition-all hover:bg-blue-500">
              Görüşme talep et
            </DemoButton>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">Enterprise</p>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-[38px] font-bold">Özel</span>
            </div>
            <p className="mb-6 text-[12px] text-white/30">30+ oda · Sınırsız konuşma</p>
            <ul className="mb-8 space-y-2.5">
              {["Tüm kanallar", "Özel kurulum", "Sınırsız dil", "API erişimi", "SLA garantisi", "Dedicated destek"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/70" />
                  {f}
                </li>
              ))}
            </ul>
            <DemoButton className="block w-full rounded-xl border border-white/[0.10] py-2.5 text-center text-[13px] font-medium text-white/50 transition-all hover:border-white/[0.20] hover:text-white/80">
              Görüşme talep et
            </DemoButton>
          </div>
        </div>
        <p className="mt-8 text-center text-[12px] text-white/25">
          30 gün ücretsiz deneme · Sözleşme yok · İstediğiniz zaman iptal
        </p>
      </SectionShell>

      {/* 10. CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.05]">
        <div className="pointer-events-none absolute inset-0 lp-grid opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
          <h2 className="mb-5 text-[36px] font-bold leading-[1.12] tracking-[-0.02em] md:text-[42px]">
            Otel operasyonunuzu
            <br />
            birlikte planlayalım.
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-[16px] leading-relaxed text-white/40">
            30 dakikalık tanıtımda işletmenize özel paneli, rezervasyon sürecinizi ve ekip kontrol modelinizi birlikte
            gözden geçiririz. Taahhüt yok.
          </p>
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DemoButton className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-9 py-4 text-[15px] font-bold shadow-lg shadow-blue-500/15 transition-all hover:bg-blue-500 active:scale-[0.97] sm:w-auto">
              <Zap className="h-4 w-4" />
              Tanıtım görüşmesi planlayın
            </DemoButton>
            <a
              href="https://wa.me/905000000000"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] px-9 py-4 text-[15px] font-medium text-white/45 transition-all hover:border-white/[0.18] hover:text-white/75 sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              WhatsApp&apos;tan ulaşın
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/25">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> Taahhüt yok
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> 30 dk kurulum
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Veri güvenliği
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-gradient-to-b from-zinc-950 to-[#070709]">
        <div className="mx-auto max-w-[1400px] px-6 pb-8 pt-14">
          <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="mb-5 inline-flex">
                <Image src="/Logo.png" alt="Tugobo AI" width={240} height={52} className="h-[44px] w-auto opacity-95" />
              </Link>
              <p className="max-w-[220px] text-[13px] leading-relaxed text-white/30">
                AI destekli dijital otel operasyon sistemi. Rezervasyon, misafir iletişimi ve gelir takibi — tek panelde,
                ekip kontrolünde.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/20">Ürün</p>
              <ul className="space-y-3">
                {[
                  { label: "Otel operasyonu", href: "#operasyon" },
                  { label: "AI ve ekip kontrolü", href: "#ai-ekip" },
                  { label: "Kanallar", href: "#kanallar" },
                  { label: "Rezervasyon ve gelir", href: "#rezervasyon-gelir" },
                  { label: "Operasyon takibi", href: "#gorunurluk" },
                  { label: "Güven", href: "#guven" },
                  { label: "Canlı panel turu", href: "/#tugobo-panel-onizleme-cta" },
                  { label: "Fiyatlar", href: "#fiyat" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/38 transition-colors hover:text-white/65">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div id="hakkimizda">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/20">Şirket</p>
              <ul className="space-y-3">
                {[
                  { label: "Hakkımızda", href: "#hakkimizda" },
                  { label: "İletişim", href: "mailto:hello@tugobo.ai" },
                  { label: "WhatsApp", href: "https://wa.me/905000000000" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-white/38 transition-colors hover:text-white/65">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/20">Neden Tugobo</p>
              <ul className="space-y-3">
                {[
                  { icon: Globe, label: "Türkçe destek" },
                  { icon: Zap, label: "30 dakikada kurulum" },
                  { icon: CheckCircle2, label: "Taahhüt yok" },
                  { icon: Shield, label: "Veri güvenliği" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-[13px] text-white/38">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white/18" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-white/[0.05] pt-6 sm:flex-row">
            <span className="text-[12px] text-white/18">© 2026 Tugobo AI</span>
            <span className="text-[12px] text-white/18">Türkiye&apos;deki oteller için üretildi 🇹🇷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
