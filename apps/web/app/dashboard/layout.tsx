import { PanelShell } from "./_components/panel-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell basePath="/dashboard">{children}</PanelShell>;
}
