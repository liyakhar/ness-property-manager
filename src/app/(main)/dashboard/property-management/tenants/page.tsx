"use client";

import { TenantDatabase } from "../_components/tenant-database";

export default function TenantsPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">Manage all tenant records and their property assignments</p>
      </div>

      <TenantDatabase />
    </div>
  );
}
