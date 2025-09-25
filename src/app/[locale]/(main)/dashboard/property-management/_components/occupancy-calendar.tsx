'use client';

import { eachDayOfInterval, endOfMonth, format, isWithinInterval, startOfMonth } from 'date-fns';
import { Calendar, Plus, Users } from 'lucide-react';
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

export function OccupancyCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedProperty, setSelectedProperty] = React.useState<string>('all');
  const { properties, tenants, isAddTenantDialogOpen, setAddTenantDialogOpen } =
    usePropertyManagementStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTenantsForDay = (date: Date) => {
    return tenants.filter((tenant) => {
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

    const propertyIndex = properties.findIndex((p) => p.id === propertyId);
    return colors[propertyIndex % colors.length] || 'bg-gray-500';
  };

  const filteredProperties =
    selectedProperty === 'all' ? properties : properties.filter((p) => p.id === selectedProperty);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Occupancy Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      Apartment #{property.apartmentNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Legend:</span>
                {filteredProperties.slice(0, 6).map((property) => (
                  <div key={property.id} className="flex items-center gap-1">
                    <div className={`h-3 w-3 rounded-full ${getPropertyColor(property.id)}`} />
                    <span className="text-xs">#{property.apartmentNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="default" size="default" onClick={() => setAddTenantDialogOpen(true)}>
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
              const tenants = getTenantsForDay(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] rounded-md border p-2 ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}`}
                >
                  <div className="mb-1 text-sm font-medium">{format(day, 'd')}</div>

                  <div className="space-y-1">
                    {tenants.map((tenant) => {
                      const property = properties.find((p) => p.id === tenant.apartmentId);
                      if (
                        !property ||
                        (selectedProperty !== 'all' && property.id !== selectedProperty)
                      )
                        return null;

                      return (
                        <div
                          key={tenant.id}
                          className={`rounded p-1 text-xs text-white ${getPropertyColor(property.id)}`}
                          title={`${tenant.name} - Apartment #${property.apartmentNumber}`}
                        >
                          <div className="truncate">{tenant.name}</div>
                          <div className="text-xs opacity-80">#{property.apartmentNumber}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }
              >
                Previous Month
              </Button>
              <span className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }
              >
                Next Month
              </Button>
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              {tenants.length} Active Tenants
            </div>
          </div>
        </CardContent>
      </Card>

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={async () => {
          // Handle adding tenant
          setAddTenantDialogOpen(false);
        }}
        properties={properties}
      />
    </div>
  );
}
