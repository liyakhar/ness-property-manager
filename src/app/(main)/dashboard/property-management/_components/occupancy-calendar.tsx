"use client";

import * as React from "react";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";
import { Calendar, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyManagementStore } from "@/stores/property-management";

import { AddTenantDialog } from "./add-tenant-dialog";

interface OccupancyCalendarProps {
  searchQuery?: string;
}

export function OccupancyCalendar({ searchQuery = "" }: OccupancyCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedProperty, setSelectedProperty] = React.useState<string>("all");
  const {
    properties: mockProperties,
    tenants: mockTenants,
    isAddTenantDialogOpen,
    setAddTenantDialogOpen,
  } = usePropertyManagementStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter properties and tenants based on search query
  const filteredProperties = React.useMemo(() => {
    if (!searchQuery) return mockProperties;
    
    const query = searchQuery.toLowerCase();
    
    // First, check if any tenants match the search query
    const matchingTenantPropertyIds = mockTenants
      .filter(tenant => {
        const basicMatch = 
          tenant.name.toLowerCase().includes(query) ||
          tenant.apartmentId.toLowerCase().includes(query) ||
          (tenant.notes && tenant.notes.toLowerCase().includes(query));
        
        if (basicMatch) return true;
        
        // Search by apartment number - find the property and check its apartment number
        const property = mockProperties.find(p => p.id === tenant.apartmentId);
        if (property && property.apartmentNumber.toString().includes(query)) {
          return true;
        }
        
        return false;
      })
      .map(tenant => tenant.apartmentId);
    
    // Return properties that either match the search directly OR have matching tenants
    return mockProperties.filter(property => {
      const directMatch = 
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query);
      
      if (directMatch) return true;
      
      // Include properties that have matching tenants
      if (matchingTenantPropertyIds.includes(property.id)) {
        return true;
      }
      
      return false;
    });
  }, [mockProperties, searchQuery, mockTenants]);

  const filteredTenants = React.useMemo(() => {
    if (!searchQuery) return mockTenants;
    
    const query = searchQuery.toLowerCase();
    
    // Helper function to check if query matches date formats
    const isDateMatch = (date: Date, searchQuery: string) => {
      const query = searchQuery.toLowerCase();
      
      // Check various date formats
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      
      // Format: DD/MM (e.g., "01/02")
      if (query.includes('/') && query.length === 5) {
        const [dayPart, monthPart] = query.split('/');
        if (day === dayPart && month === monthPart) return true;
      }
      
      // Format: DD/MM/YYYY (e.g., "01/02/2024")
      if (query.includes('/') && query.length === 10) {
        const [dayPart, monthPart, yearPart] = query.split('/');
        if (day === dayPart && month === monthPart && year === yearPart) return true;
      }
      
      // Format: MM/DD (e.g., "02/01")
      if (query.includes('/') && query.length === 5) {
        const [monthPart, dayPart] = query.split('/');
        if (day === dayPart && month === monthPart) return true;
      }
      
      // Format: MM/DD/YYYY (e.g., "02/01/2024")
      if (query.includes('/') && query.length === 10) {
        const [monthPart, dayPart, yearPart] = query.split('/');
        if (day === dayPart && month === monthPart && year === yearPart) return true;
      }
      
      // Check individual components
      if (day.includes(query) || month.includes(query) || year.includes(query)) return true;
      
      // Check date string representation
      if (date.toDateString().toLowerCase().includes(query)) return true;
      
      return false;
    };
    
    return mockTenants.filter(tenant => {
      // Basic text search
      const basicMatch = 
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes && tenant.notes.toLowerCase().includes(query));
      
      if (basicMatch) return true;
      
      // Date search
      if (isDateMatch(tenant.entryDate, query)) return true;
      if (tenant.exitDate && isDateMatch(tenant.exitDate, query)) return true;
      
      // Search by property details - find the property and check its details
      const property = mockProperties.find(p => p.id === tenant.apartmentId);
      if (property) {
        // Check apartment number
        if (property.apartmentNumber.toString().includes(query)) {
          return true;
        }
        
        // Check property location/address
        if (property.location.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check property readiness status
        if (property.readinessStatus.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check property rooms
        if (property.rooms.toString().includes(query)) {
          return true;
        }
        
        // Check urgent matters
        if (property.urgentMatter && property.urgentMatter.toLowerCase().includes(query)) {
          return true;
        }
      }
      
      return false;
    });
  }, [mockTenants, searchQuery, mockProperties]);

  const getTenantsForDay = (date: Date) => {
    return filteredTenants.filter((tenant) => {
      // Only show tenants that are associated with visible properties
      const property = filteredProperties.find(p => p.id === tenant.apartmentId);
      if (!property) return false;
      
      const entryDate = new Date(tenant.entryDate);
      const exitDate = tenant.exitDate ? new Date(tenant.exitDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now if no exit date

      return isWithinInterval(date, { start: entryDate, end: exitDate });
    });
  };

  const getPropertyColor = (propertyId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
    ];

    const propertyIndex = filteredProperties.findIndex((p) => p.id === propertyId);
    return colors[propertyIndex % colors.length] || "bg-gray-500";
  };

  const displayProperties =
    selectedProperty === "all" ? filteredProperties : filteredProperties.filter((p) => p.id === selectedProperty);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground">
                (Найдено: {filteredProperties.length} недвижимость, {filteredTenants.length} арендаторов)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Легенда:</span>
                {displayProperties.slice(0, 6).map((property) => (
                  <div key={property.id} className="flex items-center gap-1">
                    <div className={`h-3 w-3 rounded-full ${getPropertyColor(property.id)}`} />
                    <span className="text-xs">#{property.apartmentNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setAddTenantDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить Арендатора
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-7 gap-1">
            {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
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
                  className={`min-h-[80px] rounded-md border p-2 ${isCurrentMonth ? "bg-background" : "bg-muted/30"}`}
                >
                  <div className="mb-1 text-sm font-medium">{format(day, "d")}</div>

                  <div className="space-y-1">
                    {tenants.map((tenant) => {
                      const property = filteredProperties.find((p) => p.id === tenant.apartmentId);
                      if (!property || (selectedProperty !== "all" && property.id !== selectedProperty)) return null;

                      return (
                        <div
                          key={tenant.id}
                          className={`rounded p-1 text-xs text-white ${getPropertyColor(property.id)}`}
                          title={`${tenant.name} - Квартира №${property.apartmentNumber}`}
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
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                Предыдущий Месяц
              </Button>
              <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                Следующий Месяц
              </Button>
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              {filteredTenants.length} Активных Арендаторов
            </div>
          </div>
        </CardContent>
      </Card>

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={() => {
          // Handle adding tenant
          setAddTenantDialogOpen(false);
        }}
        properties={filteredProperties}
      />
    </div>
  );
}
