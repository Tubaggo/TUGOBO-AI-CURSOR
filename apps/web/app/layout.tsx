import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConciergeWebChat } from "./(marketing)/_components/concierge-web-chat";
import { DemoAccessModalProvider } from "./(marketing)/_components/demo-access-modal";
import { DemoModalProvider } from "./(marketing)/_components/demo-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tugobo AI — Digital Hotel Operating System & Hotel Operating Intelligence",
    template: "%s | Tugobo AI",
  },
  description:
    "Digital Hotel Operating System: unified guest communication, AI-powered operations layer, direct booking infrastructure, and real-time operational visibility for hotels in Turkey and beyond.",
  keywords: [
    "digital hotel operating system",
    "hotel operating intelligence",
    "AI-powered operations layer",
    "direct booking infrastructure",
    "unified guest communication",
    "Tugobo AI",
    "WhatsApp otel operasyonu",
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
    title: "Tugobo AI — Digital Hotel Operating System",
    description:
      "Hotel Operating Intelligence: unified channels, operational visibility, and direct booking infrastructure—not a bolt-on chatbot.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tugobo AI — Digital Hotel Operating System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tugobo AI — Hotel Operating Intelligence",
    description:
      "Run guest communication, pipeline, and direct bookings from one AI-powered operations layer with full dashboard visibility.",
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
          <DemoAccessModalProvider>
            {children}
            <ConciergeWebChat />
          </DemoAccessModalProvider>
        </DemoModalProvider>
      </body>
    </html>
  );
}
