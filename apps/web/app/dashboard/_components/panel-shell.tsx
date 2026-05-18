import type { ReactNode } from "react";
import { resolvePanelLocale } from "@/lib/i18n/panel-locale";
import { PanelIntlProvider } from "./panel-intl-provider";
import { Sidebar } from "./sidebar";

export function PanelShell({
  basePath,
  children,
  banner,
}: {
  basePath: string;
  children: ReactNode;
  banner?: ReactNode;
}) {
  const locale = resolvePanelLocale(basePath);

  const body = (
    <>
      <Sidebar basePath={basePath} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </>
  );

  return (
    <PanelIntlProvider locale={locale}>
      {banner ? (
        <div className="flex min-h-screen flex-col bg-zinc-950">
          {banner}
          <div className="flex min-h-0 flex-1 overflow-hidden">{body}</div>
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden bg-zinc-950">{body}</div>
      )}
    </PanelIntlProvider>
  );
}
