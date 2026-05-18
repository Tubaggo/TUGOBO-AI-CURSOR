import { PanelShell } from "./_components/panel-shell";
import { OperationalMount } from "@/app/app/_components/operational-mount";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperationalMount>
      <PanelShell basePath="/dashboard">{children}</PanelShell>
    </OperationalMount>
  );
}
