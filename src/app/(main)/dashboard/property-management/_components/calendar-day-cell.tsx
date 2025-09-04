"use client";

import * as React from "react";

import { format } from "date-fns";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tenantsForDay: Array<{
    id: string;
    name: string;
    apartmentId: string;
    entryDate: Date;
    exitDate?: Date;
  }>;
  filteredProperties: Array<{ id: string; apartmentNumber: number }>;
  getPropertyColor: (propertyId: string) => string;
  onShowMore: (
    day: Date,
    tenants: Array<{ id: string; name: string; apartmentId: string; entryDate: Date; exitDate?: Date }>,
  ) => void;
}

export function CalendarDayCell({
  day,
  currentMonth,
  tenantsForDay,
  filteredProperties,
  getPropertyColor,
  onShowMore,
}: CalendarDayCellProps) {
  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
  const maxVisible = 3;
  const visibleTenants = tenantsForDay.slice(0, maxVisible);
  const hiddenCount = Math.max(tenantsForDay.length - maxVisible, 0);

  return (
    <div
      key={day.toISOString()}
      className={`min-h-[80px] rounded-md border p-2 ${isCurrentMonth ? "bg-background" : "bg-muted/30"}`}
    >
      <div className="mb-1 text-sm font-medium">{format(day, "d")}</div>
      <div className="space-y-1">
        {visibleTenants.map((tenant) => {
          const property = filteredProperties.find((p) => p.id === tenant.apartmentId);
          if (!property) return null;
          return (
            <div
              key={tenant.id}
              className={`rounded p-1 text-xs text-gray-800 ${getPropertyColor(property.id)}`}
              title={`${tenant.name} - Квартира №${property.apartmentNumber}`}
            >
              <div className="truncate">{tenant.name}</div>
              <div className="text-xs text-gray-600">#{property.apartmentNumber}</div>
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <button className="text-xs text-blue-700 underline" onClick={() => onShowMore(day, tenantsForDay)}>
            +{hiddenCount} ещё
          </button>
        )}
      </div>
    </div>
  );
}
