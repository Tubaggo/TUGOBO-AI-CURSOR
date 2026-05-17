import { AppSidebar } from "./_components/app-sidebar";
import { OperationalMount } from "./_components/operational-mount";
import { RuntimeStateBar } from "./_components/runtime-state-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OperationalMount>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <RuntimeStateBar />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </OperationalMount>
  );
}
