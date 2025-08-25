"use client";

import * as React from "react";

import { Plus, Building2 } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { usePropertyManagementStore } from "@/stores/property-management";

import { AddPropertyDialog } from "./add-property-dialog";
import { propertyColumns } from "./property-columns";
import type { AddPropertyFormData } from "./schema";

interface PropertiesTableProps {
  searchQuery?: string;
}

export function PropertiesTable({ searchQuery = "" }: PropertiesTableProps) {
  const {
    properties: allProperties,
    addProperty,
    isAddPropertyDialogOpen,
    setAddPropertyDialogOpen,
  } = usePropertyManagementStore();

  // Filter properties based on search query
  const filteredProperties = React.useMemo(() => {
    if (!searchQuery) return allProperties;
    
    const query = searchQuery.toLowerCase();
    return allProperties.filter(property => 
      property.apartmentNumber.toString().includes(query) ||
      property.location.toLowerCase().includes(query) ||
      property.readinessStatus.toLowerCase().includes(query) ||
      property.propertyType.toLowerCase().includes(query) ||
      property.occupancyStatus.toLowerCase().includes(query) ||
      property.rooms.toString().includes(query) ||
      (property.urgentMatter && property.urgentMatter.toLowerCase().includes(query))
    );
  }, [allProperties, searchQuery]);

  const table = useDataTableInstance({
    data: filteredProperties,
    columns: propertyColumns,
    getRowId: (row) => row.id,
  });

  const handleAddProperty = (newProperty: AddPropertyFormData) => {
    addProperty(newProperty);
    setAddPropertyDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Обзор Недвижимости
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground">
                (Найдено: {filteredProperties.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {filteredProperties.filter((p) => p.occupancyStatus === "NOT_OCCUPIED").length} Свободна
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {filteredProperties.filter((p) => p.occupancyStatus === "OCCUPIED").length} Занята
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button onClick={() => setAddPropertyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить Недвижимость
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={propertyColumns} />
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <AddPropertyDialog
        open={isAddPropertyDialogOpen}
        onOpenChange={setAddPropertyDialogOpen}
        onAddProperty={handleAddProperty}
      />
    </div>
  );
}
