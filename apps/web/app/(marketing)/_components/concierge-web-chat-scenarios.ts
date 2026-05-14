/**
 * B2B onboarding scenarios for ConciergeWebChat (hotel operators evaluating the Digital Hotel Operating System).
 * Pure data + routing — swap for a real AI layer later without changing UI envelopes.
 */

export type FlowId = "how_it_works" | "dashboard" | "fit" | "demo";

export type FlowState = { flow: FlowId; step: number };

export type ScenarioChip = { id: string; label: string };

export type ScenarioAssistantPayload = {
  text: string;
  chips?: ScenarioChip[];
};

export function randomAssistantDelayMs(): number {
  return 1000 + Math.floor(Math.random() * 1500);
}

/** Free-text routing into a quick-flow */
export function detectFlowFromUserText(text: string): FlowId | null {
  const t = text.trim().toLocaleLowerCase("tr-TR");

  if (
    t.includes("demo") ||
    t.includes("kurulum görüşmesi") ||
    t.includes("kurulum gorusmesi") ||
    t.includes("görüşme") ||
    t.includes("gorusme") ||
    t.includes("görüşme talep") ||
    t.includes("gorusme talep") ||
    t.includes("randevu") ||
    t.includes("tanışalım") ||
    t.includes("tanışmak") ||
    t.includes("operasyon turu")
  ) {
    return "demo";
  }
  if (
    t.includes("dashboard") ||
    t.includes("operasyon panel") ||
    t.includes("panel") ||
    t.includes("konuşma") ||
    t.includes("konusma") ||
    t.includes("rezervasyon akışı") ||
    t.includes("rezervasyon akisi") ||
    t.includes("ekran")
  ) {
    return "dashboard";
  }
  if (
    t.includes("uygun") ||
    t.includes("işletmem") ||
    t.includes("isletmem") ||
    t.includes("butik") ||
    t.includes("bungalov") ||
    t.includes("villa") ||
    t.includes("pansiyon") ||
    t.includes("resort") ||
    t.includes("otelim")
  ) {
    return "fit";
  }
  if (
    t.includes("nasıl çalışır") ||
    t.includes("nasil calisir") ||
    t.includes("digital") ||
    t.includes("hotel operating") ||
    t.includes("nedir") ||
    t.includes("ne işe yarar") ||
    t.includes("ne ise yarar") ||
    t.includes("whatsapp") ||
    t.includes("instagram") ||
    t.includes("web chat") ||
    t.includes("7/24")
  ) {
    return "how_it_works";
  }
  return null;
}

export function getScenarioEntryPayload(flow: FlowId): ScenarioAssistantPayload {
  switch (flow) {
    case "how_it_works":
      return {
        text:
          "**Digital Hotel Operating System**; **WhatsApp**, **Instagram DM** ve **web** kanallarından gelen işleri tek **operasyon kuyruğunda** toplar. **Hotel Operating Intelligence** politika ve fiyat kurallarınızı uygular; **direkt rezervasyon altyapısı** ile ödeme veya onay adımlarını sistematik yürütür.\n\nEkibiniz için özet ve öncelik üretir; **insan devralma** ile riskli vakalarda kontrol sizde kalır.",
        chips: [
          { id: "hi_wa", label: "WhatsApp operasyonu" },
          { id: "hi_ig", label: "Instagram DM operasyonu" },
          { id: "hi_web", label: "Web kanalı" },
          { id: "hi_takeover", label: "İnsan devralma" },
        ],
      };
    case "dashboard":
      return {
        text:
          "Operasyon panelinde **birleşik misafir iletişimi**, **pipeline / fırsatlar**, **AI katmanı performansı**, **OTA’dan kaçınma** ve **insan devralma** tek ekranda okunur. **Operasyonel görünürlük** ile gece-gündüz trafiği yönetirsiniz.",
      };
    case "fit":
      return {
        text:
          "WhatsApp, Instagram veya web üzerinden **düzenli talep ve rezervasyon trafiği** alan işletmeler için Tugobo; **butik otel**, **bungalov**, **villa**, **pansiyon** ve **resort** profillerinde en güçlü kazanımı **direkt kanal + operasyon görünürlüğü** olarak verir.",
        chips: [
          { id: "fit_bt", label: "Butik otel" },
          { id: "fit_bg", label: "Bungalov" },
          { id: "fit_vl", label: "Villa" },
          { id: "fit_pn", label: "Pansiyon" },
          { id: "fit_rs", label: "Resort" },
        ],
      };
    case "demo":
      return {
        text:
          "**Digital Hotel Operating System** kurulumu için kısa bir **operasyon görüşmesi** planlayalım. Kanal trafiğinizi, mevcut rezervasyon sürecinizi ve **AI operasyon katmanının** ekibinize nasıl görünür olacağını birlikte netleştiririz.\n\nFormdan talep iletebilir veya önce **canlı operasyon panelini** gezebilirsiniz.",
        chips: [
          { id: "dm_form", label: "Kurulum formunu aç" },
          { id: "dm_dash", label: "Önce operasyon paneli" },
        ],
      };
  }
}

function howItWorksFollowUp(userText: string): ScenarioAssistantPayload {
  const t = userText.toLocaleLowerCase("tr-TR");
  if (t.includes("whatsapp")) {
    return {
      text:
        "**WhatsApp** hattınızda talep geldiğinde Hotel Operating Intelligence önce bağlamı ve politika çerçevesini okur; **direkt rezervasyon altyapısı** üzerinden teklif veya ödeme adımına taşır. Konuşma **tek operasyon panelinde** kalır; **devral** ile ekibiniz anında devreye girer.",
      chips: [
        { id: "hi2_ig", label: "Instagram örneği" },
        { id: "hi2_dash", label: "Operasyon paneli" },
        { id: "hi2_demo", label: "Kurulum görüşmesi" },
      ],
    };
  }
  if (t.includes("instagram")) {
    return {
      text:
        "**Instagram DM** trafiği aynı **Digital Hotel Operating System** kuyruğuna düşer. Dil ve ton korunur; talep **operasyon katmanı** tarafından işlenir, **direkt rezervasyon** yoluna bağlanır ve panele özet düşer.",
      chips: [
        { id: "hi2_wa", label: "WhatsApp örneği" },
        { id: "hi2_dash", label: "Operasyon paneli" },
        { id: "hi2_demo", label: "Kurulum görüşmesi" },
      ],
    };
  }
  if (t.includes("web")) {
    return {
      text:
        "**Web kanalı** üzerinden gelen talepler de aynı **operasyon omurgasına** bağlanır. Misafir tarayıcıdan yazdığında kurallarınız uygulanır; ekip **operasyonel görünürlük** ile tek yerden izler.",
      chips: [
        { id: "hi2_wa", label: "WhatsApp örneği" },
        { id: "hi2_dash", label: "Operasyon paneli" },
        { id: "hi2_demo", label: "Kurulum görüşmesi" },
      ],
    };
  }
  if (t.includes("insan") || t.includes("devral")) {
    return {
      text:
        "**İnsan devralma** ile AI operasyon katmanı durur; resepsiyon veya satış aynı bağlamı görür. Tugobo konuşma özetini ve son iş kalemlerini panele düşürür — hız ve kontrol birlikte.",
      chips: [
        { id: "hi2_dash", label: "Operasyon paneli" },
        { id: "hi2_demo", label: "Kurulum görüşmesi" },
      ],
    };
  }
  return {
    text:
      "Özetle Tugobo; **çok kanallı talepleri** tek kuyrukta toplar, **7/24 AI operasyon katmanı** ile işler, **direkt rezervasyon** ve **operasyonel görünürlük** sağlar. Bir kanalı veya **operasyon panelini** seçerek devam edebilirsiniz.",
    chips: [
      { id: "hi2_wa", label: "WhatsApp operasyonu" },
      { id: "hi2_dash", label: "Operasyon paneli" },
      { id: "hi2_demo", label: "Kurulum görüşmesi" },
    ],
  };
}

export function advanceScenario(
  state: FlowState,
  userText: string
): { next: FlowState; reply: ScenarioAssistantPayload } | null {
  switch (state.flow) {
    case "how_it_works":
      if (state.step === 0) {
        return {
          next: { flow: "how_it_works", step: 1 },
          reply: howItWorksFollowUp(userText),
        };
      }
      return null;

    case "fit":
      if (state.step === 0) {
        return {
          next: { flow: "fit", step: 1 },
          reply: {
            text:
              "Bu profilde Tugobo ile **operasyon kuyruğunu tekilleştirmek** ve **direkt rezervasyon** oranını artırmak tipik olarak en hızlı ROI’dır. Sıradaki adım **canlı operasyon paneli** veya **kurulum görüşmesi** olabilir.",
            chips: [
              { id: "fit2_demo", label: "Kurulum görüşmesi" },
              { id: "fit2_dash", label: "Operasyon paneli" },
            ],
          },
        };
      }
      return null;

    case "dashboard":
    case "demo":
      return null;
  }
}
