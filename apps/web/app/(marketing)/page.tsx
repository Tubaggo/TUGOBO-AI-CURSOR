import Link from "next/link";
import Image from "next/image";
import {
  Bot,
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
  Sparkles,
} from "lucide-react";
import { Nav } from "./_components/nav";
import { DemoButton } from "./_components/demo-modal";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Bot,
    title: "Akıllı Rezervasyon Motoru",
    desc: "Misafir sorularını anında yanıtlar, fiyat verir, uygun oda önerir. 38 saniyede, siz yokken bile.",
    accent: "blue",
  },
  {
    icon: TrendingUp,
    title: "Gelir Optimizasyonu",
    desc: "Boş geceleri azaltır, doğru teklifi doğru anda sunar. OTA komisyonunu değil, kendi cekinizi doldurun.",
    accent: "emerald",
  },
  {
    icon: Layers,
    title: "Çoklu Kanal Yönetimi",
    desc: "WhatsApp, Instagram ve web sitesi talepleri tek panelde. Kanal fark etmez, hiçbir mesaj kaybolmaz.",
    accent: "violet",
  },
  {
    icon: Sparkles,
    title: "Misafir Bilgilendirme",
    desc: "Konum, check-in saati, kurallar ve özel talepler otomatik karşılanır. Tekrar tekrar aynı soruya yanıt vermek yok.",
    accent: "amber",
  },
  {
    icon: BarChart3,
    title: "Canlı Analitik",
    desc: "Kaç mesaj geldi, kaçı satışa döndü, kaçı kaçtı — gerçek zamanlı görün. Kararlarınızı veriye dayandırın.",
    accent: "blue",
  },
  {
    icon: Shield,
    title: "İnsan Müdahalesi",
    desc: "Hassas durumları siz devralırsınız. İstediğiniz anda konuşmaya girin, yapay zeka bekler.",
    accent: "emerald",
  },
];

const CHANNELS = [
  { label: "WhatsApp", color: "text-emerald-400", bg: "bg-emerald-500/[0.08] border-emerald-500/[0.15]", dot: "bg-emerald-400", share: "%78" },
  { label: "Instagram DM", color: "text-rose-400", bg: "bg-rose-500/[0.08] border-rose-500/[0.15]", dot: "bg-rose-400", share: "%14" },
  { label: "Web Chat", color: "text-blue-400", bg: "bg-blue-500/[0.08] border-blue-500/[0.15]", dot: "bg-blue-400", share: "%6" },
  { label: "E-mail", color: "text-white/40", bg: "bg-white/[0.04] border-white/[0.08]", dot: "bg-white/30", share: "%2" },
];

const METRICS = [
  { icon: CalendarCheck, iconBg: "bg-emerald-500/[0.10]", iconColor: "text-emerald-400", color: "text-emerald-400", value: "47",       label: "Bugün kapanan rezervasyon", trend: "+12 dünden" },
  { icon: TrendingUp,    iconBg: "bg-blue-500/[0.10]",    iconColor: "text-blue-400",    color: "text-blue-400",    value: "₺68.400",  label: "AI kaynaklı gelir",          trend: "+₺9.200 geçen hafta" },
  { icon: Banknote,      iconBg: "bg-amber-500/[0.10]",   iconColor: "text-amber-400",   color: "text-amber-400",   value: "₺10.260",  label: "OTA komisyonu önlendi",      trend: "+₺1.380 bu hafta" },
  { icon: Clock,         iconBg: "bg-violet-500/[0.10]",  iconColor: "text-violet-400",  color: "text-violet-400",  value: "38s",      label: "Ort. yanıt süresi",          trend: "↓ 12sn hızlı" },
  { icon: ShieldCheck,   iconBg: "bg-cyan-500/[0.10]",    iconColor: "text-cyan-400",    color: "text-cyan-400",    value: "183",      label: "Önlenen kayıp",             trend: "100% yakalama" },
];

const STEPS = [
  {
    n: "01", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/[0.08]",
    title: "Misafir yazar",
    desc: "WhatsApp, Instagram veya web sitenizden talep gelir. Oda, fiyat, müsaitlik — her mesaj anında işleme alınır.",
    tag: "WhatsApp · Instagram · Web",
  },
  {
    n: "02", icon: Bot, color: "text-violet-400", bg: "bg-violet-500/[0.08]",
    title: "Tugobo AI cevaplar",
    desc: "Fiyat verir, uygunluk kontrol eder, soruları yanıtlar. Güvenli ödeme linki gönderir. Saniyeler içinde.",
    tag: "7/24 · Çok dilli · Sıfır gecikme",
  },
  {
    n: "03", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/[0.08]",
    title: "Rezervasyona dönüşür",
    desc: "Ödeme linki, teklif veya rezervasyon tamamlanır. Siz uyurken bile satış sisteminiz çalışmaya devam eder.",
    tag: "Komisyon %0 · Direkt gelir",
  },
];

const PROPERTY_TYPES = [
  "🏨 Butik Otel", "🏖️ Tatil Köyü", "🌿 Bungalov", "🏡 Villa",
  "🏔️ Dağ Evi", "⛵ Tekne / Yat", "🏢 Apart Otel", "🌾 Çiftlik Evi",
  "💼 Seyahat Acentesi", "🏩 Pansiyon",
];

const TESTIMONIALS = [
  {
    quote: "Tugobo kurduğumuzdan beri Booking.com'a bağımlılığımız belirgin şekilde düştü. Misafirler artık doğrudan bize yazıp rezervasyon yaptırıyor.",
    name: "Hasan Karaoğlu", role: "Sahip · Bungalov Türkiye, Ölüdeniz",
    initials: "HK", color: "bg-violet-700",
  },
  {
    quote: "Almanca, Rusça ve Arapça bilen personelimiş yoktu. Şimdi Mia herkese kendi dilinde anlık cevap veriyor. Rezervasyon dönüşümümüz ikiye katlandı.",
    name: "Selin Aydın", role: "Genel Müdür · Boutique Hotel Kapadokya",
    initials: "SA", color: "bg-rose-700",
  },
  {
    quote: "Gece 02:00'de gelen bir rezervasyon talebi bile kaçmıyor. Mia hallediyor, sabah kalktığımda onaylı rezervasyon görüyorum.",
    name: "Mehmet Kaya", role: "Sahip · Villa Bodrum",
    initials: "MK", color: "bg-emerald-700",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased selection:bg-blue-500/30">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <Nav />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 lp-grid opacity-100 pointer-events-none" />
        {/* Radial fade over grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_30%,#09090b_80%)] pointer-events-none" />
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/[0.06] rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-[12px] text-white/50 font-medium mb-7 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            Türkiye&apos;deki oteller için özel kurulum · 30 dakika
          </div>

          {/* Headline */}
          <h1 className="text-[52px] md:text-[72px] font-bold leading-[1.03] tracking-[-0.03em] mb-6">
            Gece gelen mesajları sabaha
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              bırakmadan rezervasyona çevirin.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-[17px] text-white/45 leading-relaxed mb-9 max-w-2xl mx-auto">
            WhatsApp, Instagram ve web sitenize gelen talepleri Tugobo AI saniyeler içinde yanıtlar,
            fiyat sunar ve rezervasyona dönüştürür.
            <span className="text-white/65"> 7/24 çalışır, komisyonu azaltır, satış fırsatlarını kaçırmazsınız.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <DemoButton className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-[15px] transition-all active:scale-[0.97] shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4" />
              Ücretsiz Demo Talep Et
            </DemoButton>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/[0.18] text-[15px] font-medium transition-all"
            >
              Canlı Dashboard&apos;u İncele
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[12px] text-white/20">30 dakikada canlı demo · Taahhüt yok · Türkçe destek</p>
        </div>

        {/* ── Dashboard preview (hero image) ────────────────────────────────── */}
        <div className="relative max-w-5xl mx-auto px-6 mt-14">
          {/* Glow border wrapper */}
          <div className="lp-glow-border animate-lp-float">
            <div className="rounded-[17px] overflow-hidden bg-zinc-950 shadow-2xl shadow-black/60">

              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900/80 border-b border-white/[0.06]">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                </div>
                <div className="flex-1 mx-3 px-3 py-1 bg-white/[0.04] rounded-md text-center border border-white/[0.06]">
                  <span className="text-[11px] text-white/25 font-mono">tugobo.ai/dashboard/conversations</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-blue-400">CANLI</span>
                </div>
              </div>

              {/* Demo bar */}
              <div className="flex items-center justify-between px-5 py-2 bg-zinc-950/90 border-b border-white/[0.04] text-[11px]">
                <div className="flex items-center gap-2 text-white/20">
                  <span>Grand Hotel Demo</span>
                  <span className="text-white/10">·</span>
                  <span>Sales Preview</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/35">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  Demo Mode OFF
                </div>
              </div>

              {/* Metrics bar */}
              <div className="grid grid-cols-5 border-b border-white/[0.06] bg-zinc-950/60">
                {METRICS.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-3 border-r border-white/[0.04] last:border-r-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.iconBg}`}>
                      <m.icon className={`w-3 h-3 ${m.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className={`text-[14px] font-bold tabular-nums ${m.color}`}>{m.value}</span>
                        <span className="text-[9px] text-emerald-400/50">↑ {m.trend}</span>
                      </div>
                      <p className="text-[9px] text-white/30 truncate">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main area: 2 column */}
              <div className="flex h-[280px] overflow-hidden">
                {/* Left: conv list */}
                <div className="w-[240px] shrink-0 border-r border-white/[0.05] bg-zinc-950/60 flex flex-col">
                  <div className="px-3 py-2 border-b border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-white/60">Konuşmalar</span>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Bot className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[9px] text-blue-400 font-semibold">4 closing</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[["4","AI","text-blue-400 bg-blue-500/[0.07] border-blue-500/[0.12]"],["€3.4k","Pipeline","text-amber-400 bg-amber-500/[0.07] border-amber-500/[0.12]"],["3","Onaylı","text-emerald-400 bg-emerald-500/[0.07] border-emerald-500/[0.12]"]].map(([v,l,cls],i) => (
                        <div key={i} className={`rounded-md border px-1.5 py-1.5 text-center ${cls}`}>
                          <p className="text-[12px] font-bold leading-none tabular-nums">{v}</p>
                          <p className="text-[8px] text-white/30 mt-0.5 uppercase tracking-wider">{l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden divide-y divide-white/[0.03]">
                    {[
                      { init:"AY",col:"bg-violet-600",flag:"🇹🇷",name:"Ahmet Yılmaz",rev:"₺18.000",rc:"text-emerald-400/80",msg:"Superior Oda için ödeme...",sts:"AI",stc:"bg-blue-500/10 text-blue-400",t:"2m",w:false },
                      { init:"SM",col:"bg-rose-500",flag:"🇫🇷",name:"Sophie Martin",rev:"€660",rc:"text-amber-400/80",msg:"Parfait! Je vais payer...",sts:"AI",stc:"bg-blue-500/10 text-blue-400",t:"5m",w:false },
                      { init:"EP",col:"bg-sky-600",flag:"🇷🇺",name:"Elena Petrov",rev:"",rc:"",msg:"Жду ответа по номеру...",sts:"Bekliyor",stc:"bg-amber-500/10 text-amber-400",t:"43m",w:true },
                      { init:"HM",col:"bg-blue-700",flag:"🇩🇪",name:"Hans Mueller",rev:"€780",rc:"text-emerald-400/80",msg:"Bestätigt. Wir freuen uns!",sts:"Onaylı",stc:"bg-emerald-500/10 text-emerald-400",t:"18m",w:false },
                    ].map((c,i) => (
                      <div key={i} className={`px-3 py-2.5 border-l-2 ${c.w ? "border-amber-400/30 bg-amber-500/[0.02]" : i===0 ? "border-amber-400/60 bg-white/[0.04]" : "border-transparent"}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${c.col}`}>{c.init}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-medium text-white/75 truncate">{c.name}</span>
                                <span className="text-[9px]">{c.flag}</span>
                              </div>
                              <span className={`text-[10px] font-semibold ${c.rc}`}>{c.rev}</span>
                            </div>
                            <p className="text-[10px] text-white/30 truncate">{c.msg}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`text-[9px] font-medium px-1 py-0.5 rounded-full flex items-center gap-0.5 ${c.stc}`}>
                                {c.sts === "AI" && <Bot className="w-2 h-2" />}
                                {c.sts === "Onaylı" && <CheckCircle2 className="w-2 h-2" />}
                                {c.sts}
                              </span>
                              <span className="text-[9px] text-white/20">{c.t}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: active chat */}
                <div className="flex-1 flex flex-col bg-zinc-950/40 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05] bg-zinc-950/30">
                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">AY</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-white">Ahmet Yılmaz</span>
                        <span className="text-[10px]">🇹🇷</span>
                        <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400"><Bot className="w-2 h-2" />AI aktif</span>
                      </div>
                      <p className="text-[10px] text-white/30">+90 532 123 4567 · 7 mesaj</p>
                    </div>
                    <div className="ml-auto">
                      <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Users className="w-2.5 h-2.5" /> Devral
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-3 space-y-2.5 overflow-hidden">
                    {/* Guest message */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5">AY</div>
                      <div className="bg-zinc-800/70 border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2 max-w-[75%]">
                        <p className="text-[11px] text-white/80">22-26 Temmuz arası Superior Oda için rezervasyon yaptırmak istiyorum.</p>
                      </div>
                    </div>
                    {/* AI response */}
                    <div className="flex items-end justify-end gap-2">
                      <div className="max-w-[78%]">
                        <div className="bg-blue-600 rounded-xl rounded-br-sm px-3 py-2">
                          <p className="text-[11px] text-white leading-relaxed">Merhaba Ahmet Bey! 😊 22-26 Temmuz (4 gece) için Superior Oda müsait.<br /><br />₺4.200 × 4 gece = <strong>₺16.800</strong><br /><br />Güvenli ödeme linki gönderildi 🔐</p>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5 mr-0.5">
                          <Bot className="w-2 h-2 text-white/20" />
                          <p className="text-[9px] text-white/25">Mia · AI · 08:15</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mb-3">
                        <Bot className="w-2.5 h-2.5 text-blue-400" />
                      </div>
                    </div>
                    {/* Confirmed */}
                    <div className="flex justify-center">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-medium text-emerald-400">Rezervasyon onaylandı · ₺16.800 · #GH4821</span>
                      </div>
                    </div>
                  </div>
                  {/* Reply bar hint */}
                  <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center gap-2 bg-zinc-950/30">
                    <div className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg text-[10px] text-white/20">Mia AI yanıt veriyor…</div>
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-typing-dot [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-typing-dot [animation-delay:250ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-typing-dot [animation-delay:500ms]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating toast */}
          <div className="absolute -bottom-4 -right-2 md:right-4 animate-msg-in hidden md:flex items-start gap-3 pl-3.5 pr-5 py-3 rounded-xl border border-emerald-500/25 bg-zinc-900/95 shadow-2xl shadow-black/60 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/90">Ödeme onaylandı 🎉</p>
              <p className="text-[11px] text-white/40">Sophie Martin · €660 · az önce</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Thin stats strip ────────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.05] bg-zinc-900/40 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {[
            ["3.200+", "Onaylı rezervasyon", "bu yıl"],
            ["₺42M", "Üretilen gelir", "doğrudan"],
            ["₺6.8M", "OTA komisyonu önlendi", "bu yıl"],
            ["38s", "Ort. yanıt süresi", "vs. 4h sektör"],
            ["47", "Aktif konaklama", "Türkiye geneli"],
          ].map(([v, l, s], i) => (
            <div key={i} className="flex flex-col items-center py-5 px-4 text-center border-r border-white/[0.04] last:border-r-0">
              <span className="text-[22px] font-bold tabular-nums">{v}</span>
              <span className="text-[11px] text-white/40 mt-0.5">{l}</span>
              <span className="text-[10px] text-white/20">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform capabilities ────────────────────────────────────────────── */}
      <section id="platform" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[11px] font-semibold text-blue-400/60 uppercase tracking-widest">Platform</span>
          <h2 className="text-[36px] font-bold tracking-tight mt-3 mb-4">
            Tek panelden tüm rezervasyon trafiğini yönetin.
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-[15px] leading-relaxed">
            WhatsApp, Instagram DM, web chat ve manuel görüşmeleri tek ekranda yönetin.
            Hiçbir talep gözden kaçmaz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap, i) => {
            const accentMap: Record<string, string> = {
              blue: "border-blue-500/[0.12] hover:border-blue-500/[0.20]",
              emerald: "border-emerald-500/[0.12] hover:border-emerald-500/[0.20]",
              violet: "border-violet-500/[0.12] hover:border-violet-500/[0.20]",
              amber: "border-amber-500/[0.12] hover:border-amber-500/[0.20]",
            };
            const iconMap: Record<string, string> = {
              blue: "bg-blue-500/[0.08] text-blue-400",
              emerald: "bg-emerald-500/[0.08] text-emerald-400",
              violet: "bg-violet-500/[0.08] text-violet-400",
              amber: "bg-amber-500/[0.08] text-amber-400",
            };
            return (
              <div
                key={i}
                className={`group rounded-2xl border bg-zinc-900/50 p-6 transition-all duration-300 hover:bg-zinc-900/80 ${accentMap[cap.accent]}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${iconMap[cap.accent]}`}>
                  <cap.icon className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{cap.title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Channels section ────────────────────────────────────────────────── */}
      <section id="kanallar" className="border-t border-white/[0.05] bg-zinc-900/25">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Kanallar</span>
              <h2 className="text-[32px] font-bold tracking-tight mt-3 mb-4">
                Her kanalı tek<br />panelden yönetin.
              </h2>
              <p className="text-white/40 text-[15px] leading-relaxed mb-8">
                Misafirler WhatsApp&apos;ta, Instagram&apos;da ve web sitenizde yazıyor.
                Tugobo AI hepsini aynı anda, aynı hızda ve kalitede karşılar.
              </p>

              <div className="space-y-3">
                {CHANNELS.map((ch, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${ch.bg}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${ch.dot}`} />
                      <span className={`text-[14px] font-medium ${ch.color}`}>{ch.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/30">Türkiye&apos;deki payı:</span>
                      <span className={`text-[13px] font-bold tabular-nums ${ch.color}`}>{ch.share}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel visual */}
            <div className="relative">
              <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/80 overflow-hidden">
                <div className="px-4 py-3.5 border-b border-white/[0.06] bg-zinc-950/40 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white/60">Unified Inbox</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    4 aktif kanal
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { ch: "WhatsApp", flag: "🇹🇷", name: "Mehmet B.", msg: "Bungalov arıyorum, Temmuz için...", dot: "bg-emerald-400", time: "şimdi", unread: 2, sts: "AI", stc: "bg-blue-500/10 text-blue-400" },
                    { ch: "Instagram DM", flag: "🇫🇷", name: "Claire D.", msg: "Je cherche une chambre pour 2...", dot: "bg-rose-400", time: "1m", unread: 1, sts: "AI", stc: "bg-blue-500/10 text-blue-400" },
                    { ch: "Web Chat", flag: "🇩🇪", name: "Klaus W.", msg: "Haben Sie ein Doppelzimmer?", dot: "bg-blue-400", time: "8m", unread: 0, sts: "Onaylı", stc: "bg-emerald-500/10 text-emerald-400" },
                    { ch: "WhatsApp", flag: "🇸🇦", name: "Ahmed R.", msg: "هل لديك غرفة متاحة في أغسطس؟", dot: "bg-emerald-400", time: "14m", unread: 0, sts: "AI", stc: "bg-blue-500/10 text-blue-400" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-medium text-white/75">{row.name}</span>
                            <span className="text-[10px]">{row.flag}</span>
                            <span className="text-[9px] text-white/20">{row.ch}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {row.unread > 0 && (
                              <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">{row.unread}</span>
                            )}
                            <span className="text-[10px] text-white/20">{row.time}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/30 truncate">{row.msg}</p>
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${row.stc}`}>
                          <Bot className="w-2 h-2" />{row.sts}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="nasil" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Süreç</span>
          <h2 className="text-[32px] font-bold tracking-tight mt-3">3 adımda satış sisteminizi kurun.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-14 left-[33%] right-[33%] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7 text-center">
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">{s.n}</span>
              </div>
              <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-4`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed mb-4">{s.desc}</p>
              <div className="inline-flex px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[11px] text-white/30">{s.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Revenue impact ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.05] bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-6 border-b border-white/[0.04]">
            <span className="text-[11px] font-medium text-white/20 uppercase tracking-widest">Tugobo AI kullanan otellerde · bu hafta</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5">
            {METRICS.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-5 border-r border-white/[0.04] last:border-r-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.iconBg}`}>
                  <m.icon className={`w-3.5 h-3.5 ${m.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className={`text-[17px] font-bold tabular-nums ${m.color}`}>{m.value}</span>
                    <span className="text-[10px] text-emerald-400/50">↑ {m.trend}</span>
                  </div>
                  <p className="text-[10px] text-white/35 mt-0.5 truncate">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property types ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-[26px] font-bold tracking-tight mb-3">
            Her format için tasarlandı.
          </h2>
          <p className="text-white/35 text-[14px]">
            Türkiye&apos;deki her türlü konaklama işletmesi için eksiksiz destek.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {PROPERTY_TYPES.map((type, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.07] text-[13px] text-white/50 hover:text-white/70 hover:border-white/[0.12] transition-all">
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Referanslar</span>
            <h2 className="text-[28px] font-bold tracking-tight mt-3">
              Oteller neden Tugobo AI kullanıyor?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className="text-amber-400/80 text-[12px]">★</span>
                    ))}
                  </div>
                  <p className="text-[14px] text-white/55 leading-relaxed italic mb-6">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${t.color}`}>{t.initials}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/80">{t.name}</p>
                    <p className="text-[11px] text-white/30">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="fiyat" className="border-t border-white/[0.05] bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Fiyatlar</span>
            <h2 className="text-[32px] font-bold tracking-tight mt-3 mb-4">
              Personel maliyetinden düşük, getirisi daha yüksek.
            </h2>
            <p className="text-white/40 text-[15px] max-w-md mx-auto">
              İşletmenizin büyüklüğüne göre esnek paketler. Tüm planlarda Türkçe destek dahil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {/* Starter */}
            <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7">
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Starter</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[38px] font-bold tabular-nums">₺2.990</span>
                <span className="text-white/30 text-sm">/ay</span>
              </div>
              <p className="text-[12px] text-white/30 mb-6">1–10 oda · 500 konuşma/ay</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "WhatsApp entegrasyonu",
                  "Mia AI asistan",
                  "Türkçe + 1 dil",
                  "Temel analitik",
                  "E-posta destek",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400/70 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <DemoButton className="block w-full text-center py-2.5 rounded-xl border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/[0.20] text-[13px] font-medium transition-all">
                Demo talep et
              </DemoButton>
            </div>

            {/* Growth — highlighted */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] p-7 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-3.5 py-1 rounded-full bg-blue-600 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/30">
                  En Popüler
                </span>
              </div>
              <p className="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-3">Growth</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[38px] font-bold tabular-nums">₺5.990</span>
                <span className="text-white/30 text-sm">/ay</span>
              </div>
              <p className="text-[12px] text-white/30 mb-6">11–30 oda · 2.000 konuşma/ay</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "WhatsApp + Instagram DM",
                  "Mia AI asistan",
                  "7 dil desteği",
                  "Gelişmiş analitik",
                  "OTA komisyon takibi",
                  "Rezervasyon entegrasyonu",
                  "Öncelikli destek",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <DemoButton className="block w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold transition-all">
                Demo talep et
              </DemoButton>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-7">
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Enterprise</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[38px] font-bold">Özel</span>
              </div>
              <p className="text-[12px] text-white/30 mb-6">30+ oda · Sınırsız konuşma</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Tüm kanallar",
                  "Özel AI persona",
                  "Sınırsız dil",
                  "API erişimi",
                  "Özel entegrasyonlar",
                  "SLA garantisi",
                  "Dedicated destek",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400/70 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <DemoButton className="block w-full text-center py-2.5 rounded-xl border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/[0.20] text-[13px] font-medium transition-all">
                Görüşme talep et
              </DemoButton>
            </div>
          </div>

          <p className="text-center text-[12px] text-white/25 mt-8">
            Tüm planlar · 30 gün ücretsiz deneme · Sözleşme yok · İstediğiniz zaman iptal
          </p>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.05]">
        <div className="absolute inset-0 lp-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(59,130,246,0.06),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_50%,transparent_40%,#09090b_80%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[12px] text-emerald-400 font-medium mb-7">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            Türkiye&apos;deki oteliniz için özel kurulum · 30 dakika
          </div>

          <h2 className="text-[44px] font-bold leading-[1.1] tracking-[-0.02em] mb-5">
            Bu hafta kaç rezervasyon<br />kaçırdığınızı görün.
          </h2>

          <p className="text-white/40 text-[16px] leading-relaxed mb-10 max-w-lg mx-auto">
            30 dakikalık canlı demoda işletmenize özel satış akışını gösterelim.
            Taahhüt yok. Sözleşme yok.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <DemoButton className="w-full sm:w-auto flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[15px] transition-all active:scale-[0.97] shadow-xl shadow-blue-500/20">
              <Zap className="w-4 h-4" />
              Ücretsiz Demo Talep Et
            </DemoButton>
            <a
              href="https://wa.me/905000000000"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-9 py-4 rounded-xl border border-white/[0.10] text-white/45 hover:text-white/75 hover:border-white/[0.18] text-[15px] font-medium transition-all"
            >
              <Phone className="w-4 h-4" />
              WhatsApp&apos;tan ulaşın
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/25">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Taahhüt yok</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> 30dk kurulum</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Türkçe destek</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Veri güvenliği</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-gradient-to-b from-zinc-950 to-[#070709]">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">

          {/* 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Col 1 — Brand */}
            <div>
              <Link href="/" className="inline-flex items-center group mb-5">
                <Image
                  src="/Logo.png"
                  alt="Tugobo AI"
                  width={240}
                  height={52}
                  className="h-[44px] w-auto opacity-[0.95] group-hover:opacity-100 transition-opacity [filter:drop-shadow(0_0_12px_rgba(255,255,255,0.07))]"
                />
              </Link>
              <p className="text-[13px] text-white/30 leading-relaxed mt-1 max-w-[220px]">
                Tugobo AI, otellerin rezervasyon süreçlerini otomatikleştirir ve doğrudan gelirini artırır.
              </p>
            </div>

            {/* Col 2 — Ürün */}
            <div>
              <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-4">
                Ürün
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Platform",       href: "#platform" },
                  { label: "Dashboard Demo", href: "/dashboard" },
                  { label: "Fiyatlar",       href: "#fiyat" },
                  { label: "Kanallar",       href: "#kanallar" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13px] text-white/38 hover:text-white/65 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Şirket */}
            <div>
              <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-4">
                Şirket
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Hakkımızda", href: "#" },
                  { label: "İletişim",   href: "mailto:hello@tugobo.ai" },
                  { label: "WhatsApp",   href: "https://wa.me/905000000000" },
                  { label: "E-posta",    href: "mailto:hello@tugobo.ai" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13px] text-white/38 hover:text-white/65 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Neden Tugobo */}
            <div>
              <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-4">
                Neden Tugobo
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Globe,        label: "Türkçe destek"        },
                  { icon: Zap,          label: "30 dakikada kurulum"  },
                  { icon: CheckCircle2, label: "Taahhüt yok"          },
                  { icon: Shield,       label: "Veri güvenliği"       },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-[13px] text-white/38">
                    <Icon className="w-3.5 h-3.5 text-white/18 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider + bottom row */}
          <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[12px] text-white/18">© 2026 Tugobo AI</span>
            <span className="text-[12px] text-white/18">Türkiye&apos;deki oteller için üretildi 🇹🇷</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
