import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConciergeWebChat } from "./(marketing)/_components/concierge-web-chat";
import { DemoModalProvider } from "./(marketing)/_components/demo-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tugobo AI — Oteller için AI Rezervasyon ve Dijital İşletim Sistemi",
    template: "%s | Tugobo AI",
  },
  description:
    "WhatsApp, Instagram DM ve web sitenizden gelen tüm rezervasyon taleplerini Mia AI 7/24 karşılar, fiyatlar ve onaylar. OTA komisyonu olmadan. Türkiye'deki butik oteller, villalar ve bungalovlar için.",
  keywords: [
    "AI otel rezervasyon",
    "WhatsApp otel",
    "otel yapay zeka",
    "Tugobo AI",
    "Mia AI concierge",
    "digital hotel operating system",
    "OTA komisyon azalt",
    "butik otel yazılım",
  ],
  authors: [{ name: "Tugobo AI" }],
  creator: "Tugobo AI",
  metadataBase: new URL("https://tugobo.ai"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://tugobo.ai",
    siteName: "Tugobo AI",
    title: "Tugobo AI — Otelinizin AI Katmanı",
    description:
      "WhatsApp'tan gelen her rezervasyon talebini 38 saniyede karşıla. OTA komisyonu olmadan, 7/24.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tugobo AI — AI-Powered Hotel Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tugobo AI — Otelinizin AI Katmanı",
    description:
      "WhatsApp'tan gelen her rezervasyon talebini 38 saniyede karşıla. OTA komisyonu olmadan, 7/24.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark bg-zinc-950">
      <body className={`${inter.className} bg-zinc-950`}>
        <DemoModalProvider>
          {children}
          <ConciergeWebChat />
        </DemoModalProvider>
      </body>
    </html>
  );
}
