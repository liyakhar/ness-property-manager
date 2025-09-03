"use client";

import * as React from "react";

import { format } from "date-fns";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CalendarMonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  activeTenantsCount: number;
}

export function CalendarMonthNavigation({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  activeTenantsCount,
}: CalendarMonthNavigationProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreviousMonth}>
          Предыдущий Месяц
        </Button>
        <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
        <Button variant="outline" size="sm" onClick={onNextMonth}>
          Следующий Месяц
        </Button>
      </div>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Users className="h-4 w-4" />
        {activeTenantsCount} Активных Арендаторов
      </div>
    </div>
  );
}
