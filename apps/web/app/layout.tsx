import type { Metadata } from "next";
import "./globals.css";
import { ConciergeWebChat } from "./(marketing)/_components/concierge-web-chat";
import { DemoAccessModalProvider } from "./(marketing)/_components/demo-access-modal";
import { DemoModalProvider } from "./(marketing)/_components/demo-modal";
import { PanelPreviewModalProvider } from "./(marketing)/_components/landing-panel-preview-modal";

export const metadata: Metadata = {
  title: {
    default: "Tugobo AI | AI destekli dijital otel operasyon merkezi",
    template: "%s | Tugobo AI",
  },
  description:
    "Tugobo AI; otellerin WhatsApp, web ve sosyal medya üzerinden gelen misafir taleplerini AI desteğiyle daha hızlı, kontrollü ve satış odaklı yönetmesini sağlayan dijital otel operasyon merkezidir.",
  keywords: [
    "AI destekli dijital otel operasyon merkezi",
    "otel operasyon merkezi",
    "otel görüşme yönetimi",
    "WhatsApp rezervasyon yönetimi",
    "direkt rezervasyon",
    "Tugobo AI",
    "misafir iletişimi",
    "ödeme bekleniyor",
    "operasyon özeti",
  ],
  authors: [{ name: "Tugobo AI" }],
  creator: "Tugobo AI",
  metadataBase: new URL("https://tugobo.com"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://tugobo.com",
    siteName: "Tugobo AI",
    title: "Tugobo AI | AI destekli dijital otel operasyon merkezi",
    description:
      "Misafir taleplerini tek operasyon akışında toplayın; AI destek, insan kontrolü ve satış odaklı rezervasyon yönetimini aynı panelde yönetin.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tugobo AI - dijital otel operasyon merkezi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tugobo AI | Dijital otel operasyon merkezi",
    description:
      "WhatsApp, web ve sosyal medya taleplerini AI desteğiyle tek operasyon merkezinde yönetin.",
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
    <html lang="tr" suppressHydrationWarning className="dark bg-zinc-950">
      <body className="bg-zinc-950 text-white antialiased">
        <DemoModalProvider>
          <DemoAccessModalProvider>
            <PanelPreviewModalProvider>
              {children}
              <ConciergeWebChat />
            </PanelPreviewModalProvider>
          </DemoAccessModalProvider>
        </DemoModalProvider>
      </body>
    </html>
  );
}
