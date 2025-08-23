"use client";

import { OccupancyCalendar } from "../_components/occupancy-calendar";

export default function CalendarPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Occupancy Calendar</h1>
        <p className="text-muted-foreground">Visual timeline showing tenant occupancy periods across all properties</p>
      </div>

      <OccupancyCalendar />
    </div>
  );
}
