"use client";

import { useTranslations } from "next-intl";

import { OccupancyCalendar } from "../_components/occupancy-calendar";

export default function CalendarPage() {
  const t = useTranslations("propertyManagement.calendar");

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <OccupancyCalendar />
    </div>
  );
}
