"use client";

import { useCallback, useState } from "react";
import type { Organization, User as AppUser } from "@/app/app/_types";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

type AppShellProps = {
  children: React.ReactNode;
  organizations: Organization[];
  initialOrganization: Organization;
  user: AppUser;
};

export function AppShell({
  children,
  organizations,
  initialOrganization,
  user,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState(
    initialOrganization.id
  );

  const activeOrganization =
    organizations.find((o) => o.id === activeOrganizationId) ?? initialOrganization;

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-dvh bg-zinc-950 text-white">
      <AppSidebar
        organization={activeOrganization}
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          organizations={organizations}
          activeOrganizationId={activeOrganization.id}
          onOrganizationChange={setActiveOrganizationId}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}
