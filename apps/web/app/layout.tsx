import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tugobo AI",
  description: "AI reservation and lead conversion for hotels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark bg-zinc-950">
      <body className={`${inter.className} bg-zinc-950`}>{children}</body>
    </html>
  );
}
