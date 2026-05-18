import { PanelShell } from "@/app/dashboard/_components/panel-shell";
import { OperationalMount } from "@/app/app/_components/operational-mount";
import { DemoBanner } from "./_components/demo-banner";

export default function DemoOtelPaneliLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperationalMount>
      <PanelShell basePath="/demo/otel-paneli" banner={<DemoBanner />}>
        {children}
      </PanelShell>
    </OperationalMount>
  );
}
