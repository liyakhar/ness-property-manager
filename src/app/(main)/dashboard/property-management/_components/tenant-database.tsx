"use client";

import * as React from "react";

import { Plus, Users } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { usePropertyManagementStore } from "@/stores/property-management";

import { AddTenantDialog } from "./add-tenant-dialog";
import type { AddTenantFormData, Tenant } from "./schema";
import { createTenantColumns } from "./tenant-columns";
import { EditableCell } from "./editable-cell";
import { ColumnDef } from "@tanstack/react-table";

interface TenantDatabaseProps {
  searchQuery?: string;
}

export function TenantDatabase({ searchQuery = "" }: TenantDatabaseProps) {
  const {
    tenants: allTenants,
    properties: mockProperties,
    addTenant,
    updateTenant,
    isAddTenantDialogOpen,
    setAddTenantDialogOpen,
  } = usePropertyManagementStore();

  // State for custom columns
  const [customColumns, setCustomColumns] = React.useState<ColumnDef<Tenant>[]>(() => {
    // Load custom columns from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tenant-custom-columns');
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
    // Add the new field to all existing tenants with a default value
    allTenants.forEach(tenant => {
      if (!(tenant as any)[columnData.id]) {
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
        updateTenant(tenant.id, { [columnData.id]: defaultValue });
      }
    });

    const newColumn: ColumnDef<Tenant> = {
      id: columnData.id,
      accessorKey: columnData.id,
      header: () => <div className="font-medium">{columnData.header}</div>,
      cell: ({ row }) => {
        // Use EditableCell for custom columns
        const value = (row.original as any)[columnData.id];
        return (
                  <EditableCell
          value={value}
          onSave={(newValue: unknown) => {
            const updates = { [columnData.id]: newValue };
            updateTenant(row.original.id, updates);
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
      localStorage.setItem('tenant-custom-columns', JSON.stringify(updatedColumns));
    }
  };

  // Create tenant columns with update function
  const tenantColumns = React.useMemo(() => {
    return createTenantColumns(updateTenant, mockProperties);
  }, [mockProperties]);

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...tenantColumns, ...customColumns];
  }, [tenantColumns, customColumns]);

  // Filter tenants based on search query
  const filteredTenants = React.useMemo(() => {
    if (!searchQuery) return allTenants;
    
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
    
    return allTenants.filter(tenant => {
      // Basic text search
      const basicMatch = 
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes && tenant.notes.toLowerCase().includes(query));
      
      if (basicMatch) return true;
      
      // Date search
      if (isDateMatch(tenant.entryDate, query)) return true;
      if (tenant.exitDate && isDateMatch(tenant.exitDate, query)) return true;
      if (isDateMatch(tenant.receivePaymentDate, query)) return true;
      
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
  }, [allTenants, searchQuery, mockProperties]);

  const table = useDataTableInstance({
    data: filteredTenants,
    columns: allColumns,
    getRowId: (row) => row.id,
  });

  const handleAddTenant = (newTenant: AddTenantFormData) => {
    addTenant(newTenant);
    setAddTenantDialogOpen(false);
  };

  const getActiveTenants = () => filteredTenants.filter((tenant) => tenant.status === "current");
  const getPastTenants = () => filteredTenants.filter((tenant) => tenant.status === "past");
  const getFutureTenants = () => filteredTenants.filter((tenant) => tenant.status === "future");
  const getUpcomingTenants = () => filteredTenants.filter((tenant) => tenant.status === "upcoming");

  return (
    <div className="space-y-4">
      {/* Tenant Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            База Данных Арендаторов
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground">
                (Найдено: {filteredTenants.length})
              </span>
            )}
          </CardTitle>
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
        properties={mockProperties}
      />
    </div>
  );
}
