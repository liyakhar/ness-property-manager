'use client';

import { eachDayOfInterval, endOfMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePropertyManagementStore } from '@/stores/property-management';

import { AddTenantDialog } from './add-tenant-dialog';
import { CalendarDayCell } from './calendar-day-cell';
import { CalendarDayDialog } from './calendar-day-dialog';
import { CalendarMonthNavigation } from './calendar-month-navigation';

interface OccupancyCalendarProps {
  searchQuery?: string;
}

export function OccupancyCalendar({ searchQuery = '' }: OccupancyCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedProperty, setSelectedProperty] = React.useState<string>('all');
  const [dayDialogOpen, setDayDialogOpen] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [selectedDayTenants, setSelectedDayTenants] = React.useState<
    Array<{ id: string; name: string; apartmentId: string; entryDate: Date; exitDate?: Date }>
  >([]);
  const { properties, tenants, isAddTenantDialogOpen, setAddTenantDialogOpen } =
    usePropertyManagementStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Helper function to check if tenant matches search query
  const isTenantMatch = React.useCallback(
    (tenant: { name: string; apartmentId: string; notes?: string }, query: string) => {
      const basicMatch =
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes?.toLowerCase().includes(query) ?? false);

      if (basicMatch) return true;

      // Search by apartment number - find the property and check its apartment number
      const property = properties.find((p) => p.id === tenant.apartmentId);
      if (property?.apartmentNumber.toString().includes(query)) {
        return true;
      }

      return false;
    },
    [properties]
  );

  // Helper function to check if property matches search query
  const isPropertyMatch = React.useCallback(
    (
      property: { apartmentNumber: number; location: string; readinessStatus: string },
      query: string
    ) => {
      return (
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query)
      );
    },
    []
  );

  // Filter properties and tenants based on search query
  const filteredProperties = React.useMemo(() => {
    if (!searchQuery) return properties;

    const query = searchQuery.toLowerCase();

    // First, check if any tenants match the search query
    const matchingTenantPropertyIds = tenants
      .filter((tenant) => isTenantMatch(tenant, query))
      .map((tenant) => tenant.apartmentId);

    // Return properties that either match the search directly OR have matching tenants
    return properties.filter((property) => {
      if (isPropertyMatch(property, query)) return true;

      // Include properties that have matching tenants
      if (matchingTenantPropertyIds.includes(property.id)) {
        return true;
      }

      return false;
    });
  }, [properties, searchQuery, tenants, isTenantMatch, isPropertyMatch]);

  // Helper function to check DD/MM format
  const isDDMMFormat = React.useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === 5) {
      const [dayPart, monthPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check DD/MM/YYYY format
  const isDDMMYYYYFormat = React.useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (query.includes('/') && query.length === 10) {
        const [dayPart, monthPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check MM/DD format
  const isMMDDFormat = React.useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === 5) {
      const [monthPart, dayPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check MM/DD/YYYY format
  const isMMDDYYYYFormat = React.useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (query.includes('/') && query.length === 10) {
        const [monthPart, dayPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check if query matches date formats
  const isDateMatch = React.useCallback(
    (date: Date, searchQuery: string) => {
      const query = searchQuery.toLowerCase();

      // Check various date formats
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      // Check different date formats
      if (isDDMMFormat(day, month, query)) return true;
      if (isDDMMYYYYFormat(day, month, year, query)) return true;
      if (isMMDDFormat(day, month, query)) return true;
      if (isMMDDYYYYFormat(day, month, year, query)) return true;

      // Check individual components
      if (day.includes(query) || month.includes(query) || year.includes(query)) return true;

      // Check date string representation
      if (date.toDateString().toLowerCase().includes(query)) return true;

      return false;
    },
    [isDDMMFormat, isDDMMYYYYFormat, isMMDDFormat, isMMDDYYYYFormat]
  );

  // Helper function to check if tenant matches property search
  const isTenantPropertyMatch = React.useCallback(
    (tenant: { apartmentId: string }, query: string) => {
      const property = properties.find((p) => p.id === tenant.apartmentId);
      if (!property) return false;

      return (
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query) ||
        property.rooms.toString().includes(query) ||
        (property.urgentMatter?.toLowerCase().includes(query) ?? false)
      );
    },
    [properties]
  );

  const filteredTenants = React.useMemo(() => {
    if (!searchQuery) return tenants;

    const query = searchQuery.toLowerCase();

    return tenants.filter((tenant) => {
      // Basic text search
      const basicMatch =
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes?.toLowerCase().includes(query) ?? false);

      if (basicMatch) return true;

      // Date search
      if (isDateMatch(tenant.entryDate, query)) return true;
      if (tenant.exitDate && isDateMatch(tenant.exitDate, query)) return true;

      // Search by property details
      if (isTenantPropertyMatch(tenant, query)) return true;

      return false;
    });
  }, [tenants, searchQuery, isDateMatch, isTenantPropertyMatch]);

  const getTenantsForDay = (date: Date) => {
    return filteredTenants.filter((tenant) => {
      // Only show tenants that are associated with visible properties
      const property = filteredProperties.find((p) => p.id === tenant.apartmentId);
      if (!property) return false;

      const entryDate = new Date(tenant.entryDate);
      const exitDate = tenant.exitDate
        ? new Date(tenant.exitDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now if no exit date

      return isWithinInterval(date, { start: entryDate, end: exitDate });
    });
  };

  const getPropertyColor = (propertyId: string) => {
    const colors = [
      'bg-blue-200',
      'bg-green-200',
      'bg-purple-200',
      'bg-orange-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-red-200',
      'bg-yellow-200',
      'bg-teal-200',
      'bg-cyan-200',
      'bg-lime-200',
      'bg-amber-200',
    ];

    const propertyIndex = filteredProperties.findIndex((p) => p.id === propertyId);
    return colors[propertyIndex % colors.length] || 'bg-gray-200';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {searchQuery && (
              <span className="text-muted-foreground text-sm font-normal">
                (Найдено: {filteredProperties.length} недвижимость, {filteredTenants.length}{' '}
                арендаторов)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите недвижимость" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Вся Недвижимость</SelectItem>
                {filteredProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    Квартира #{property.apartmentNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setAddTenantDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить Арендатора
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-7 gap-1">
            {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
              <div key={day} className="text-muted-foreground p-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const tenantsForDay = getTenantsForDay(day).filter((tenant) => {
                if (selectedProperty === 'all') return true;
                return tenant.apartmentId === selectedProperty;
              });

              return (
                <CalendarDayCell
                  key={day.toISOString()}
                  day={day}
                  currentMonth={currentMonth}
                  tenantsForDay={tenantsForDay}
                  filteredProperties={filteredProperties}
                  getPropertyColor={getPropertyColor}
                  onShowMore={(day, tenants) => {
                    setSelectedDay(day);
                    setSelectedDayTenants(tenants);
                    setDayDialogOpen(true);
                  }}
                />
              );
            })}
          </div>

          <CalendarMonthNavigation
            currentMonth={currentMonth}
            onPreviousMonth={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            onNextMonth={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            activeTenantsCount={filteredTenants.length}
          />
        </CardContent>
      </Card>

      <CalendarDayDialog
        open={dayDialogOpen}
        onOpenChange={setDayDialogOpen}
        selectedDay={selectedDay}
        selectedDayTenants={selectedDayTenants}
        filteredProperties={filteredProperties}
      />

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={() => setAddTenantDialogOpen(false)}
        properties={filteredProperties}
      />
    </div>
  );
}
