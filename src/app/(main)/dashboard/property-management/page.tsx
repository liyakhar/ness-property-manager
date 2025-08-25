"use client";

import React, { useState } from "react";

import { Building2, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePropertyManagementStore } from "@/stores/property-management";
import { DailyNotifications } from "./_components/daily-notifications";

export default function PropertyManagementPage() {
  const { properties, tenants } = usePropertyManagementStore();
  const [searchQuery, setSearchQuery] = useState("");

  const getActiveTenants = () => tenants.filter((tenant) => !tenant.exitDate);

  // Filter properties and tenants based on search query
  const filteredProperties = properties.filter(property => 
    !searchQuery || 
    property.apartmentNumber.toString().includes(searchQuery) ||
    property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.readinessStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.propertyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.occupancyStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (searchQuery.toLowerCase().includes("аренд") && property.propertyType === "аренда") ||
    (searchQuery.toLowerCase().includes("продаж") && property.propertyType === "продажа") ||
    (searchQuery.toLowerCase().includes("занят") && property.occupancyStatus === "занята") ||
    (searchQuery.toLowerCase().includes("свобод") && property.occupancyStatus === "свободна")
  );

  const filteredTenants = tenants.filter(tenant => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Basic text search
    const basicMatch = 
      tenant.name.toLowerCase().includes(query) ||
      tenant.apartmentId.toLowerCase().includes(query);
    
    if (basicMatch) return true;
    
    // Date search
    if (isDateMatch(tenant.entryDate, query)) return true;
    if (tenant.exitDate && isDateMatch(tenant.exitDate, query)) return true;
    
    // Search by property details - find the property and check its details
    const property = properties.find(p => p.id === tenant.apartmentId);
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

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Общие Показатели</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по недвижимости, арендаторам, номерам квартир..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Недвижимости</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProperties.length}</div>
            <p className="text-muted-foreground text-xs">
              {filteredProperties.filter((p) => p.readinessStatus === "меблированная").length} меблированная
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Для Аренды</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProperties.filter((p) => p.propertyType === "аренда").length}</div>
            <p className="text-muted-foreground text-xs">
              {filteredProperties.filter((p) => p.propertyType === "аренда" && p.readinessStatus === "меблированная").length} меблированная
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Для Продажи</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredProperties.filter((p) => p.propertyType === "продажа").length}</div>
            <p className="text-muted-foreground text-xs">
              {filteredProperties.filter((p) => p.propertyType === "продажа" && p.readinessStatus === "меблированная").length} меблированная
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Арендаторы</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTenants.length}</div>
            <p className="text-muted-foreground text-xs">{getActiveTenants().length} в настоящее время активны</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Notifications */}
      <DailyNotifications />
    </div>
  );
}
