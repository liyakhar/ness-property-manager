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
import { usePropertyManagement } from '@/hooks/use-property-management';
import { usePropertyManagementStore } from '@/stores/property-management';

import { AddTenantDialog } from './add-tenant-dialog';

export function OccupancyCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedProperty, setSelectedProperty] = React.useState<string>('all');
  const { properties, tenants, isLoading, error } = usePropertyManagement();
  const { isAddTenantDialogOpen, setAddTenantDialogOpen } = usePropertyManagementStore();

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

  // Show loading state
  if (isLoading) {
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
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Загрузка данных...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
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
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">Ошибка загрузки: {error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Активных арендаторов: {tenants.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }
              >
                Предыдущий
              </Button>
              <span className="text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: undefined })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }
              >
                Следующий
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={async () => setAddTenantDialogOpen(false)}
        properties={filteredProperties}
      />
    </div>
  );
}
