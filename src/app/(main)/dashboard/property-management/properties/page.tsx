"use client";

import { PropertiesTable } from "../_components/properties-table";

export default function PropertiesPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Недвижимость</h1>
        <p className="text-muted-foreground">Управляйте всей недвижимостью и их текущим статусом</p>
      </div>

      <PropertiesTable />
    </div>
  );
}
