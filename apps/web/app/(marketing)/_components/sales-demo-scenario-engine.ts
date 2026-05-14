/**
 * Sprint 4 — Sales demo scenario engine (preview / simulation only).
 * Drives scripted operational beats in ConciergeWebChat; no backend calls.
 */

export const TUGOBO_SALES_DEMO_EVENT = "tugobo:sales-demo-metrics" as const;

export type SalesDemoMetricsDetail = {
  /** Monotonic tick so listeners can animate even if values repeat */
  seq: number;
  reservationsToday: string;
  reservationsTrend: string;
  directRevenue: string;
  directRevenueTrend: string;
  otaSaved: string;
  otaSavedTrend: string;
};

export type SalesDemoScriptLine =
  | {
      kind: "system";
      tone: "banner" | "event";
      text: string;
      delayAfterMs: number;
    }
  | {
      kind: "visitor";
      text: string;
      delayAfterMs: number;
    }
  | {
      kind: "assistant";
      text: string;
      delayAfterMs: number;
      pricePreview?: {
        roomLabel: string;
        guestsLabel: string;
        nightsLabel: string;
        totalLabel: string;
      };
      reservationPreview?: {
        roomName: string;
        nights: number;
        guests: number;
        dateRangeLabel: string;
        totalLabel: string;
        subtitle?: string;
        ctas: { id: string; label: string }[];
      };
      chips?: { id: string; label: string }[];
    };

/** Opening sequence through reservation summary (steps 1–5). Steps 6–9 need user chips or CTA. */
export const SALES_DEMO_OPENING_SCRIPT: SalesDemoScriptLine[] = [
  {
    kind: "system",
    tone: "event",
    text: "Pipeline · Yeni fırsat · Web kanalı · Öncelik: yüksek (örnek önizleme)",
    delayAfterMs: 650,
  },
  {
    kind: "assistant",
    text:
      "**Operasyon kuyruğuna** yeni bir talep düştü. Misafiri karşılayıp **tarih** ve **kişi sayısını** netleştiriyorum; ardından oda + fiyat önerisini **direkt rezervasyon bandına** bağlayacağım.",
    delayAfterMs: 900,
  },
  {
    kind: "visitor",
    text: "Merhaba, **22–26 Temmuz** arası **2 yetişkin** için deniz tarafı bir oda arıyoruz. Müsaitlik ve toplam tutar paylaşabilir misiniz?",
    delayAfterMs: 750,
  },
  {
    kind: "assistant",
    text:
      "Teşekkürler — **4 gece**, **2 yetişkin** için **Superior Deniz Manzaralı** uygun görünüyor. Politika ve minimum konaklama kuralları **Hotel Operating Intelligence** tarafından doğrulandı.",
    delayAfterMs: 500,
    pricePreview: {
      roomLabel: "Superior Deniz Manzaralı",
      guestsLabel: "2 yetişkin",
      nightsLabel: "4 gece · 22 Temmuz → 26 Temmuz",
      totalLabel: "₺4.200 × 4 gece = ₺16.800 (KDV dahil gösterim)",
    },
  },
  {
    kind: "assistant",
    text:
      "Öneriyi **rezervasyon taslağı** olarak panele işledim. Bir sonraki adımda **ödeme bekleyen** durum oluşturulur; ardından **resepsiyon devralması** ile kapama önerilir.",
    delayAfterMs: 400,
    reservationPreview: {
      roomName: "Superior Deniz Manzaralı",
      nights: 4,
      guests: 2,
      dateRangeLabel: "22–26 Temmuz",
      totalLabel: "₺16.800",
      subtitle: "Durum: Taslak · Kanal: Web · Örnek önizleme verisi",
      ctas: [
        { id: "demo_pay_pending", label: "Ödeme beklemede oluştur (simülasyon)" },
        { id: "demo_dash", label: "Operasyon paneline git" },
      ],
    },
    chips: [{ id: "demo_pay_pending", label: "Ödeme beklemede oluştur (simülasyon)" }],
  },
];

export const SALES_DEMO_PAYMENT_PENDING: SalesDemoScriptLine[] = [
  {
    kind: "system",
    tone: "event",
    text: "Ödeme · Güvenli tahsilat linki gönderildi · Durum: Beklemede (örnek önizleme)",
    delayAfterMs: 550,
  },
  {
    kind: "assistant",
    text:
      "Tutar ve tarih aralığı **risk penceresinde**; sistem **insan devralması** öneriyor. Resepsiyon aynı bağlamda **özet kartı** görür; misafir ödemeyi tamamladığında kayıt **onaylı rezervasyon** bandına taşınır.",
    delayAfterMs: 350,
    chips: [{ id: "demo_staff_confirm", label: "Resepsiyon onayı ver (simülasyon)" }],
  },
];

export const SALES_DEMO_CONFIRMED: SalesDemoScriptLine[] = [
  {
    kind: "system",
    tone: "event",
    text: "Rezervasyon · Onaylandı · Referans #GH-DEMO-4821 · Tahsilat: tamamlandı (örnek)",
    delayAfterMs: 500,
  },
  {
    kind: "assistant",
    text:
      "**Onaylı rezervasyon** satırı oluşturuldu. **Doğrudan kanal geliri** ve **bugün kapanan rezervasyon** metrikleri panel üst şeridinde güncellendi — bu akış canlı kurulumda otelinizin gerçek verisine bağlanır.",
    delayAfterMs: 200,
  },
];

/** Metrics shown in hero after demo completes (still clearly preview / illustrative). */
export function salesDemoMetricsPayload(seq: number): SalesDemoMetricsDetail {
  return {
    seq,
    reservationsToday: "48",
    reservationsTrend: "+13 dünden",
    directRevenue: "₺85.200",
    directRevenueTrend: "+₺16.800 bu oturum (örnek)",
    otaSaved: "₺11.940",
    otaSavedTrend: "+₺1.680 bu hafta (örnek)",
  };
}

export function detectSalesDemoIntent(text: string): boolean {
  const t = text.trim().toLocaleLowerCase("tr-TR");
  return (
    t.includes("satış demosu") ||
    t.includes("satis demosu") ||
    t.includes("operasyon demosu") ||
    t.includes("canlı rezervasyon") ||
    t.includes("canli rezervasyon") ||
    t.includes("rezervasyon simülasyon") ||
    t.includes("rezervasyon simulasyon") ||
    t.includes("pipeline demosu") ||
    t.includes("otel sahibi demosu")
  );
}
