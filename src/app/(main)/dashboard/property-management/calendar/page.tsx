"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { OccupancyCalendar } from "../_components/occupancy-calendar";
import { DailyNotifications } from "../_components/daily-notifications";

export default function CalendarPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Календарь</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по арендаторам, номерам квартир, датам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Daily Notifications */}
      <DailyNotifications />

      <OccupancyCalendar searchQuery={searchQuery} />
    </div>
  );
}
