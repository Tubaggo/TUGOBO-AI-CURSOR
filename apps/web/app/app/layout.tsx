import type { ReactNode } from "react";
import {
  getCurrentOrganization,
  getCurrentUser,
  getOrganizations,
} from "@/lib/data/overview";
import { AppShell } from "./_components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  const organizations = getOrganizations();
  const initialOrganization = getCurrentOrganization();
  const user = getCurrentUser();

  return (
    <AppShell
      organizations={organizations}
      initialOrganization={initialOrganization}
      user={user}
    >
      {children}
    </AppShell>
  );
}
