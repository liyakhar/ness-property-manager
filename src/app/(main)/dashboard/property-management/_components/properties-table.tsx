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

export function PropertiesTable() {
  const {
    properties: data,
    addProperty,
    isAddPropertyDialogOpen,
    setAddPropertyDialogOpen,
  } = usePropertyManagementStore();

  const table = useDataTableInstance({
    data,
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  {data.filter((p) => p.readinessStatus === "FURNISHED").length} Меблированная
                </Badge>
                <Badge variant="outline" className="text-orange-600">
                  {data.filter((p) => p.readinessStatus === "UNFURNISHED").length} Немеблированная
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
