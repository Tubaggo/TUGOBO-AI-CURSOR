/**
 * B2B sales/demo scenarios for ConciergeWebChat (hotel owners & operators).
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
    t.includes("görüşme") ||
    t.includes("gorusme") ||
    t.includes("görüşme talep") ||
    t.includes("gorusme talep") ||
    t.includes("randevu") ||
    t.includes("tanışalım") ||
    t.includes("tanışmak")
  ) {
    return "demo";
  }
  if (
    t.includes("dashboard") ||
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
    t.includes("tugobo") ||
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
          "Tugobo AI, otelinizin **WhatsApp**, **Instagram DM** ve **web chat** kanallarından gelen mesajları tek ekranda toplar. Misafire hızlı yanıt verir, uygun oda ve politika bilgisini sunar, **ödeme veya rezervasyon adımına** yönlendirir.\n\nEkibiniz için özet ve öncelik üretir; **insan devralma** ile hassas durumlara müdahale edebilirsiniz.",
        chips: [
          { id: "hi_wa", label: "WhatsApp akışı" },
          { id: "hi_ig", label: "Instagram DM akışı" },
          { id: "hi_web", label: "Web chat akışı" },
          { id: "hi_takeover", label: "İnsan devralma" },
        ],
      };
    case "dashboard":
      return {
        text:
          "Dashboard’da **misafir iletişimi**, **operasyon ve satış fırsatları**, **AI yanıt süresi**, **OTA komisyonundan tasarruf** ve **insan devralma** akışı tek ekranda takip edilir. İşletmenizin dijital operasyonuna tek bakışta hakim olursunuz.",
      };
    case "fit":
      return {
        text:
          "Eğer işletmeniz **WhatsApp**, **Instagram** veya **web sitesi** üzerinden rezervasyon talebi alıyorsa Tugobo AI sizin için uygundur. Özellikle **butik otel**, **bungalov**, **villa**, **pansiyon** ve **resort** işletmeleri için tasarlanmıştır.",
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
          "İşletmeniz için kısa bir **ürün görüşmesi** planlayabiliriz. Mesaj trafiğinizi, rezervasyon sürecinizi ve AI katmanının operasyonu nasıl sadeleştireceğini birlikte inceleriz.\n\nFormdan talebinizi iletebilir veya önce canlı paneli gezebilirsiniz.",
        chips: [
          { id: "dm_form", label: "Görüşme formunu aç" },
          { id: "dm_dash", label: "Önce dashboard" },
        ],
      };
  }
}

function howItWorksFollowUp(userText: string): ScenarioAssistantPayload {
  const t = userText.toLocaleLowerCase("tr-TR");
  if (t.includes("whatsapp")) {
    return {
      text:
        "**WhatsApp** hattınızda misafir mesajı geldiğinde Tugobo AI önce bağlamı okur, müsaitlik ve politika çerçevesinde yanıtlar, gerekirse ödeme veya rezervasyon linkine yönlendirir. Tüm konuşma **tek panelde** görünür; siz **devral** diyerek istediğiniz an devreye girersiniz.",
      chips: [
        { id: "hi2_ig", label: "Instagram örneği" },
        { id: "hi2_dash", label: "Dashboard'u göster" },
        { id: "hi2_demo", label: "Görüşme talep et" },
      ],
    };
  }
  if (t.includes("instagram")) {
    return {
      text:
        "**Instagram DM** trafiği de aynı panele düşer. Story veya DM’den gelen taleplerde AI, dil ve tonu koruyarak hızlı yanıt verir; doğrudan rezervasyona giden yolu kısaltır ve ekibe özet bırakır.",
      chips: [
        { id: "hi2_wa", label: "WhatsApp örneği" },
        { id: "hi2_dash", label: "Dashboard'u göster" },
        { id: "hi2_demo", label: "Görüşme talep et" },
      ],
    };
  }
  if (t.includes("web")) {
    return {
      text:
        "**Web sitenizdeki chat** üzerinden gelen talepler de aynı akışa bağlanır. Misafir tarayıcıdan yazdığında AI, sitenizin kuralları ve fiyat çerçevesinde yanıtlar; operasyon ekibi tek yerden takip eder.",
      chips: [
        { id: "hi2_wa", label: "WhatsApp örneği" },
        { id: "hi2_dash", label: "Dashboard'u göster" },
        { id: "hi2_demo", label: "Görüşme talep et" },
      ],
    };
  }
  if (t.includes("insan") || t.includes("devral")) {
    return {
      text:
        "**İnsan devralma** ile AI yanıtı durur; resepsiyon veya satış ekibi görüşmeyi aynı bağlamla devralır. Tugobo AI konuşma özetini ve son misafir taleplerini panele düşürür — hem hız hem kontrol sizde kalır.",
      chips: [
        { id: "hi2_dash", label: "Dashboard'u göster" },
        { id: "hi2_demo", label: "Görüşme talep et" },
      ],
    };
  }
  return {
    text:
      "Özetle Tugobo AI; **çok kanallı talepleri** toplar, **7/24** yanıtlar, **operasyon ve doğrudan satış** ritmini güçlendirir ve **OTA bağımlılığını azaltmaya** uygun bir işletim katmanıdır. İsterseniz bir kanalı veya dashboard’u seçerek devam edelim.",
    chips: [
      { id: "hi2_wa", label: "WhatsApp akışı" },
      { id: "hi2_dash", label: "Dashboard'u göster" },
      { id: "hi2_demo", label: "Görüşme talep et" },
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
              "Bu profilde Tugobo AI ile **mesaj trafiğini tek merkezden** yönetmek ve **doğrudan rezervasyon** oranını artırmak çoğu işletme için hızlı bir kazanım olur. Bir sonraki adım olarak canlı paneli inceleyebilir veya kısa bir **ürün görüşmesi** planlayabilirsiniz.",
            chips: [
              { id: "fit2_demo", label: "Görüşme talep et" },
              { id: "fit2_dash", label: "Dashboard'u göster" },
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
