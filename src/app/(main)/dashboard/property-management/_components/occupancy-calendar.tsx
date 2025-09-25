'use client';

import { eachDayOfInterval, endOfMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';
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
import { usePropertyManagement } from '@/hooks/use-property-management';
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
  const { properties, tenants, isLoading, error } = usePropertyManagement();
  const { isAddTenantDialogOpen, setAddTenantDialogOpen } = usePropertyManagementStore();

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

      return (
        isDDMMFormat(day, month, query) ||
        isDDMMYYYYFormat(day, month, year, query) ||
        isMMDDFormat(day, month, query) ||
        isMMDDYYYYFormat(day, month, year, query)
      );
    },
    [isDDMMFormat, isDDMMYYYYFormat, isMMDDFormat, isMMDDYYYYFormat]
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

  // Filter tenants based on search query
  const filteredTenants = React.useMemo(() => {
    if (!searchQuery) return tenants;

    const query = searchQuery.toLowerCase();

    return tenants.filter((tenant) => {
      // Check basic text matches
      if (isTenantMatch(tenant, query)) return true;

      // Check date matches for entry and exit dates
      const entryDate = new Date(tenant.entryDate);
      const exitDate = tenant.exitDate ? new Date(tenant.exitDate) : null;

      if (isDateMatch(entryDate, query)) return true;
      if (exitDate && isDateMatch(exitDate, query)) return true;

      return false;
    });
  }, [tenants, searchQuery, isTenantMatch, isDateMatch]);

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календарь заселения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Загрузка данных...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календарь заселения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Ошибка загрузки: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTenantsForDay = (date: Date) => {
    return filteredTenants.filter((tenant) => {
      const entryDate = new Date(tenant.entryDate);
      const exitDate = tenant.exitDate
        ? new Date(tenant.exitDate)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now if no exit date

      return isWithinInterval(date, { start: entryDate, end: exitDate });
    });
  };

  const getPropertyColor = (propertyId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
    ];

    const propertyIndex = filteredProperties.findIndex((p) => p.id === propertyId);
    return colors[propertyIndex % colors.length] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календарь заселения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Выберите квартиру" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все квартиры</SelectItem>
                  {filteredProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      Квартира #{property.apartmentNumber} - {property.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setAddTenantDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
        onAddTenant={async () => setAddTenantDialogOpen(false)}
        properties={filteredProperties}
      />
    </div>
  );
}
