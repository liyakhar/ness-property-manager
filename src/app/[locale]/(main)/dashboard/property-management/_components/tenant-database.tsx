"use client";

import * as React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Plus, Users } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { usePropertyManagementStore } from "@/stores/property-management";

import { AddTenantDialog } from "./add-tenant-dialog";
import type { AddTenantFormData, Tenant } from "./schema";
import { tenantColumns } from "./tenant-columns";

export function TenantDatabase() {
  const {
    tenants: data,
    properties,
    addTenant,
    isAddTenantDialogOpen,
    setAddTenantDialogOpen,
  } = usePropertyManagementStore();

  // State for custom columns
  const [customColumns, setCustomColumns] = React.useState<ColumnDef<Tenant>[]>(() => {
    // Load custom columns from localStorage on component mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tenant-custom-columns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved custom columns:", e);
        }
      }
    }
    return [];
  });

  // Function to handle adding new columns
  const handleAddColumn = (columnData: { id: string; header: string; type: string }) => {
    const newColumn: ColumnDef<Tenant> = {
      id: columnData.id,
      accessorKey: columnData.id,
      header: () => <div className="font-medium">{columnData.header}</div>,
      cell: () => {
        // For now, show placeholder data based on type
        switch (columnData.type) {
          case "text":
            return <div className="text-muted-foreground text-sm">-</div>;
          case "number":
            return <div className="text-muted-foreground text-sm">0</div>;
          case "date":
            return <div className="text-muted-foreground text-sm">-</div>;
          case "select":
            return <div className="text-muted-foreground text-sm">-</div>;
          case "boolean":
            return <div className="text-muted-foreground text-sm">Нет</div>;
          default:
            return <div className="text-muted-foreground text-sm">-</div>;
        }
      },
      enableSorting: true,
      enableHiding: true,
    };

    const updatedColumns = [...customColumns, newColumn];
    setCustomColumns(updatedColumns);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant-custom-columns", JSON.stringify(updatedColumns));
    }
  };

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...tenantColumns, ...customColumns];
  }, [customColumns]);

  const table = useDataTableInstance({
    data,
    columns: allColumns,
    getRowId: (row) => row.id,
  });

  const handleAddTenant = (newTenant: AddTenantFormData) => {
    addTenant(newTenant);
    setAddTenantDialogOpen(false);
  };

  const getActiveTenants = () => data.filter((tenant) => tenant.status === "current");
  const getPastTenants = () => data.filter((tenant) => tenant.status === "past");
  const getFutureTenants = () => data.filter((tenant) => tenant.status === "future");
  const getUpcomingTenants = () => data.filter((tenant) => tenant.status === "upcoming");

  return (
    <div className="space-y-4">
      {/* Tenant Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            База Данных Арендаторов
          </CardTitle>
          <CardDescription>Управление всеми записями арендаторов и их назначениями в недвижимость</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {getActiveTenants().length} Текущие
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {getUpcomingTenants().length} Скоро
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {getFutureTenants().length} Будущие
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                  {getPastTenants().length} Прошлые
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} onAddColumn={handleAddColumn} />
              <Button onClick={() => setAddTenantDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить Арендатора
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={allColumns} />
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={handleAddTenant}
        properties={properties}
      />
    </div>
  );
}
