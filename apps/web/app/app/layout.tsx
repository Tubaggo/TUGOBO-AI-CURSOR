import { PanelShell } from "@/app/dashboard/_components/panel-shell";
import { OperationalMount } from "./_components/operational-mount";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperationalMount>
      <PanelShell basePath="/app">{children}</PanelShell>
    </OperationalMount>
  );
}
