"use client";

import { TenantDatabase } from "../_components/tenant-database";

export default function TenantsPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Арендаторы</h1>
        <p className="text-muted-foreground">Управляйте всеми записями арендаторов и их назначениями в недвижимость</p>
      </div>

      <TenantDatabase />
    </div>
  );
}
