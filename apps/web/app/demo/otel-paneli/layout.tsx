import Link from "next/link";
import { Sidebar } from "@/app/dashboard/_components/sidebar";

export default function DemoOtelPaneliLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <div className="flex shrink-0 flex-col border-b border-white/[0.06] bg-zinc-900/90 px-4 py-2.5 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:text-left">
        <p className="text-[11px] leading-snug text-white/45">
          <span className="font-medium text-white/60">Örnek operasyon paneli</span>
          <span className="mx-1.5 text-white/20" aria-hidden>
            ·
          </span>
          <span>Canlı ürün önizlemesi</span>
          <span className="mx-1.5 text-white/20" aria-hidden>
            ·
          </span>
          <span className="text-white/35">Hotel Operating Intelligence Preview</span>
        </p>
        <Link
          href="/auth/login"
          className="mt-2 shrink-0 text-[11px] font-medium text-blue-400/90 underline-offset-4 hover:text-blue-300 hover:underline sm:mt-0 sm:ml-4"
        >
          Canlı hesap için giriş yapın →
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar basePath="/demo/otel-paneli" />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
