import {
  AlertTriangle,
  BedDouble,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  PauseCircle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { LandingHeroMetrics } from "./landing-hero-metrics";

const QUEUE = [
  { name: "Ahmet Y.", stage: "Ödeme onayı", tag: "Onay", urgent: true, value: "₺16.800" },
  { name: "Elena P.", stage: "SLA · 45 dk", tag: "Risk", urgent: true, value: "Devral" },
  { name: "Claire D.", stage: "Teklif gönderildi", tag: "Takip", urgent: false, value: "2 gece" },
  { name: "Hans M.", stage: "Ekip devraldı", tag: "Aktif", urgent: false, value: "€780" },
] as const;

const ALERTS = [
  { icon: ClipboardCheck, title: "Onay bekliyor", desc: "Superior · Ahmet Y." },
  { icon: PauseCircle, title: "AI duraklatıldı", desc: "Resepsiyon devraldı" },
  { icon: Sparkles, title: "AI önerisi", desc: "Ödeme linki hazır" },
  { icon: AlertTriangle, title: "SLA uyarısı", desc: "Instagram DM" },
] as const;

const CHANNELS = [
  { name: "WhatsApp", pct: 62, cls: "bg-emerald-500" },
  { name: "Instagram", pct: 24, cls: "bg-rose-500" },
  { name: "Web", pct: 14, cls: "bg-blue-500" },
] as const;

type Variant = "default" | "expanded";

/** Sprint 18 — hotel operations preview: conversation + reservation flow together. */
export function LandingHeroOperationsCenter({ variant = "default" }: { variant?: Variant }) {
  const expanded = variant === "expanded";
  const panelHeight = expanded ? "min-h-[400px] h-[min(440px,56vw)]" : "h-[min(380px,54vw)] min-h-[320px]";

  return (
    <div className="lp-hero-mockup-stage">
      <div className="lp-glow-border animate-lp-float">
        <div className="lp-glass-panel flex flex-col overflow-hidden rounded-[17px] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(59,130,246,0.22)]">
          <div className="flex items-center gap-3 border-b border-white/[0.08] bg-zinc-900/90 px-4 py-2.5 backdrop-blur-md sm:px-5">
            <div className="flex shrink-0 gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/35" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/35" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/35" />
            </div>
            <div className="mx-2 flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="font-mono text-[10px] text-white/35 sm:text-[11px]">Grand Hotel · operasyon paneli</span>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              CANLI
            </span>
          </div>

          <LandingHeroMetrics />

          <div className={`flex min-h-0 flex-1 overflow-hidden ${panelHeight}`}>
            {/* Left — operation queue */}
            <aside className="flex w-[168px] shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/85 sm:w-[188px]">
              <div className="border-b border-white/[0.05] px-3 py-2">
                <p className="text-[10px] font-semibold text-white/65">Operasyon kuyruğu</p>
                <p className="text-[9px] text-white/30">4 misafir · 2 onay</p>
              </div>
              <div className="flex-1 divide-y divide-white/[0.03] overflow-hidden">
                {QUEUE.map((row) => (
                  <div
                    key={row.name}
                    className={`px-3 py-2 ${row.urgent ? "border-l-2 border-amber-400/50 bg-amber-500/[0.04]" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] font-medium text-white/78">{row.name}</span>
                      <span className="shrink-0 rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 text-[7px] font-semibold text-white/45">
                        {row.tag}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[9px] text-white/32">{row.stage}</p>
                    <p className="text-[9px] font-medium text-white/40">{row.value}</p>
                  </div>
                ))}
              </div>
            </aside>

            {/* Center — live guest + reservation */}
            <main className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-zinc-950/20 to-zinc-950/60">
              <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold">
                  AY
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white">Ahmet Yılmaz</p>
                  <p className="text-[9px] text-white/32">Superior · 22–26 Temmuz · WhatsApp</p>
                </div>
                <button
                  type="button"
                  className="hidden shrink-0 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[9px] text-white/50 sm:block"
                >
                  <Users className="mr-1 inline h-2.5 w-2.5" />
                  Devral
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-hidden p-3">
                <div className="max-w-[88%] rounded-xl rounded-bl-sm border border-white/[0.07] bg-zinc-800/80 px-2.5 py-2">
                  <p className="text-[10px] leading-relaxed text-white/75">
                    Superior oda için 4 gece rezervasyon yapabilir miyim? Fiyat ve ödeme bilgisi alabilir miyim?
                  </p>
                  <p className="mt-1 text-[8px] text-white/25">14:32</p>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-xl rounded-br-sm bg-blue-600/90 px-2.5 py-2 shadow-lg shadow-blue-900/20">
                    <p className="text-[10px] leading-relaxed text-white">
                      4 gece Superior için toplam <strong>₺16.800</strong>. Müsaitlik doğrulandı — ödeme linki
                      gönderilebilir.
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[8px] text-white/50">
                      <Bot className="h-2.5 w-2.5" />
                      AI yanıtı · ekip onayı bekleniyor
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                        <BedDouble className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-white">Superior Oda</p>
                        <p className="text-[9px] text-white/35">4 gece · 2 misafir</p>
                      </div>
                    </div>
                    <p className="text-[12px] font-bold tabular-nums text-white">₺16.800</p>
                  </div>
                  <div className="flex gap-1">
                    {["Talep", "Teklif", "Ödeme", "Onay"].map((step, i) => (
                      <div
                        key={step}
                        className={`flex flex-1 items-center justify-center rounded border py-1 text-[7px] font-medium ${
                          i === 2
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : i < 2
                              ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400/80"
                              : "border-white/[0.06] text-white/25"
                        }`}
                      >
                        {i < 2 ? <CheckCircle2 className="mr-0.5 h-2 w-2" /> : null}
                        {step}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-md bg-emerald-600/90 py-1.5 text-[9px] font-semibold text-white"
                  >
                    Rezervasyonu onayla
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.06] bg-zinc-950/70 px-3 py-1.5">
                <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] text-white/40">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    AI çalışıyor, insan yönetiyor.
                  </span>
                </div>
              </div>
            </main>

            {/* Right — operational visibility */}
            <aside className="hidden w-[150px] shrink-0 flex-col border-l border-white/[0.06] bg-zinc-950/80 md:flex lg:w-[170px]">
              <div className="border-b border-white/[0.05] px-3 py-2">
                <p className="text-[10px] font-semibold text-white/65">Operasyon görünürlüğü</p>
              </div>
              <div className="flex-1 space-y-1.5 overflow-hidden p-2">
                {ALERTS.map((a) => (
                  <div
                    key={a.title}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-2"
                  >
                    <div className="mb-0.5 flex items-center gap-1">
                      <a.icon className="h-2.5 w-2.5 text-white/45" />
                      <span className="text-[9px] font-semibold text-white/70">{a.title}</span>
                    </div>
                    <p className="text-[8px] text-white/35">{a.desc}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.05] p-2">
                <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-wider text-white/28">Kanallar</p>
                {CHANNELS.map((ch) => (
                  <div key={ch.name} className="mb-1">
                    <div className="mb-0.5 flex justify-between text-[8px] text-white/38">
                      <span>{ch.name}</span>
                      <span>{ch.pct}%</span>
                    </div>
                    <div className="h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${ch.cls} opacity-75`}
                        style={{ width: `${ch.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
