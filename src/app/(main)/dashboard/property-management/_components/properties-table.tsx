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
import { createPropertyColumns } from "./property-columns";
import type { AddPropertyFormData, Property } from "./schema";
import { EditableCell } from "./editable-cell";
import { ColumnDef } from "@tanstack/react-table";

interface PropertiesTableProps {
  searchQuery?: string;
}

export function PropertiesTable({ searchQuery = "" }: PropertiesTableProps) {
  const {
    properties: allProperties,
    addProperty,
    updateProperty,
    isAddPropertyDialogOpen,
    setAddPropertyDialogOpen,
  } = usePropertyManagementStore();

  // State for custom columns
  const [customColumns, setCustomColumns] = React.useState<ColumnDef<Property>[]>(() => {
    // Load custom columns from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('property-custom-columns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Не удалось разобрать сохраненные пользовательские колонки:', e);
        }
      }
    }
    return [];
  });

  // Function to handle adding new columns
  const handleAddColumn = (columnData: { id: string; header: string; type: string }) => {
    // Add the new field to all existing properties with a default value
    allProperties.forEach(property => {
      if (!(property as any)[columnData.id]) {
        let defaultValue: any;
        switch (columnData.type) {
          case "text":
            defaultValue = "";
            break;
          case "number":
            defaultValue = 0;
            break;
          case "date":
            defaultValue = new Date();
            break;
          case "select":
            defaultValue = "option1";
            break;
          case "boolean":
            defaultValue = false;
            break;
          default:
            defaultValue = "";
        }
        updateProperty(property.id, { [columnData.id]: defaultValue });
      }
    });

    const newColumn: ColumnDef<Property> = {
      id: columnData.id,
      accessorKey: columnData.id,
      header: () => <div className="font-medium">{columnData.header}</div>,
      cell: ({ row }) => {
        // Use EditableCell for custom columns
        const value = (row.original as any)[columnData.id];
        return (
          <EditableCell
            value={value}
            onSave={(newValue: any) => {
              const updates = { [columnData.id]: newValue };
              updateProperty(row.original.id, updates);
            }}
            type={columnData.type as any}
            options={columnData.type === "select" ? [
              { value: "option1", label: "Опция 1" },
              { value: "option2", label: "Опция 2" },
              { value: "option3", label: "Опция 3" },
            ] : []}
          />
        );
      },
      enableSorting: true,
      enableHiding: true,
    };

    const updatedColumns = [...customColumns, newColumn];
    setCustomColumns(updatedColumns);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('property-custom-columns', JSON.stringify(updatedColumns));
    }
  };

  // Create property columns with update function
  const propertyColumns = React.useMemo(() => {
    return createPropertyColumns(updateProperty);
  }, []);

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...propertyColumns, ...customColumns];
  }, [propertyColumns, customColumns]);

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
    columns: allColumns,
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
                  {filteredProperties.filter((p) => p.occupancyStatus === "свободна").length} Свободна
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {filteredProperties.filter((p) => p.occupancyStatus === "занята").length} Занята
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} onAddColumn={handleAddColumn} />
              <Button onClick={() => setAddPropertyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить Недвижимость
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={allColumns} />
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
