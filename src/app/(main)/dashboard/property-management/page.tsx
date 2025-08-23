"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OccupancyCalendar } from "./_components/occupancy-calendar";
import { PropertiesTable } from "./_components/properties-table";
import { TenantDatabase } from "./_components/tenant-database";

export default function PropertyManagementPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
        <p className="text-muted-foreground">
          Manage properties, track tenant occupancy, and maintain property database.
        </p>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          <PropertiesTable />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <OccupancyCalendar />
        </TabsContent>

        <TabsContent value="tenants" className="mt-6">
          <TenantDatabase />
        </TabsContent>
      </Tabs>
    </div>
  );
}
