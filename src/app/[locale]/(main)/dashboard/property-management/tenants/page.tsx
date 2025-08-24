"use client";

import { useTranslations } from "next-intl";

import { TenantDatabase } from "../_components/tenant-database";

export default function TenantsPage() {
  const t = useTranslations("propertyManagement.tenants");

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <TenantDatabase />
    </div>
  );
}
