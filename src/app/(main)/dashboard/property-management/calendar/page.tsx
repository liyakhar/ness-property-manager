"use client";

import { OccupancyCalendar } from "../_components/occupancy-calendar";

export default function CalendarPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Календарь Занятости</h1>
        <p className="text-muted-foreground">
          Визуальная временная шкала, показывающая периоды занятости арендаторов по всей недвижимости
        </p>
      </div>

      <OccupancyCalendar />
    </div>
  );
}
