import { Sidebar } from "./_components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
