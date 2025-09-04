'use client';

/* eslint-disable max-lines */

import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Users } from 'lucide-react';
import * as React from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';
import { usePropertyManagementStore } from '@/stores/property-management';

import { AddTenantDialog } from './add-tenant-dialog';
import { EditableCell } from './editable-cell';
import type { AddTenantFormData, Tenant } from './schema';
import { createTenantColumns } from './tenant-columns';

interface TenantDatabaseProps {
  searchQuery?: string;
}

export function TenantDatabase({ searchQuery = '' }: TenantDatabaseProps) {
  const {
    tenants: allTenants,
    properties,
    addTenant,
    updateTenant,
    deleteTenant,
    setTenantsHidden,
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
    allTenants.forEach((tenant) => {
      if (!(tenant as Record<string, unknown>)[columnData.id]) {
        let defaultValue: unknown;
        switch (columnData.type) {
          case 'text':
            defaultValue = '';
            break;
          case 'number':
            defaultValue = 0;
            break;
          case 'date':
            defaultValue = new Date();
            break;
          case 'select':
            defaultValue = 'option1';
            break;
          case 'boolean':
            defaultValue = false;
            break;
          default:
            defaultValue = '';
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
        const value = (row.original as Record<string, unknown>)[columnData.id];
        return (
          <EditableCell
            value={value}
            onSave={(newValue: unknown) => {
              const updates = { [columnData.id]: newValue };
              updateTenant(row.original.id, updates);
            }}
            type={columnData.type as 'text' | 'number' | 'date' | 'select'}
            options={
              columnData.type === 'select'
                ? [
                    { value: 'option1', label: 'Опция 1' },
                    { value: 'option2', label: 'Опция 2' },
                    { value: 'option3', label: 'Опция 3' },
                  ]
                : []
            }
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

  const [showHiddenView, setShowHiddenView] = React.useState(false);

  // Create tenant columns with update function
  const tenantColumns = React.useMemo(() => {
    return createTenantColumns(updateTenant, properties, (id: string) => {
      // Optimistic local delete via store
      usePropertyManagementStore.getState().deleteTenant(id);
      // Fire-and-forget API delete to persist if backend used
      fetch(`/api/tenants/${id}`, { method: 'DELETE' }).catch(() => {});
    });
  }, [properties, updateTenant]);

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...tenantColumns, ...customColumns];
  }, [tenantColumns, customColumns]);

  // Helper function to check DD/MM format
  const isDDMMFormat = React.useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === 5) {
      const [dayPart, monthPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check DD/MM/YYYY format
  const isDDMMYYYYFormat = React.useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (query.includes('/') && query.length === 10) {
        const [dayPart, monthPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check MM/DD format
  const isMMDDFormat = React.useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === 5) {
      const [monthPart, dayPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check MM/DD/YYYY format
  const isMMDDYYYYFormat = React.useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (query.includes('/') && query.length === 10) {
        const [monthPart, dayPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check if query matches date formats
  const isDateMatch = React.useCallback(
    (date: Date, searchQuery: string) => {
      const query = searchQuery.toLowerCase();

      // Check various date formats
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      // Check different date formats
      if (isDDMMFormat(day, month, query)) return true;
      if (isDDMMYYYYFormat(day, month, year, query)) return true;
      if (isMMDDFormat(day, month, query)) return true;
      if (isMMDDYYYYFormat(day, month, year, query)) return true;

      // Check individual components
      if (day.includes(query) || month.includes(query) || year.includes(query)) return true;

      // Check date string representation
      if (date.toDateString().toLowerCase().includes(query)) return true;

      return false;
    },
    [isDDMMFormat, isDDMMYYYYFormat, isMMDDFormat, isMMDDYYYYFormat]
  );

  // Helper function to check if tenant matches property search
  const isTenantPropertyMatch = React.useCallback(
    (tenant: { apartmentId: string }, query: string) => {
      const property = properties.find((p) => p.id === tenant.apartmentId);
      if (!property) return false;

      return (
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query) ||
        property.rooms.toString().includes(query) ||
        (property.urgentMatter?.toLowerCase().includes(query) ?? false)
      );
    },
    [properties]
  );

  // Helper function to check if tenant matches basic search
  const isBasicMatch = React.useCallback(
    (tenant: { name: string; apartmentId: string; notes?: string }, query: string) => {
      return (
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes?.toLowerCase().includes(query) ?? false)
      );
    },
    []
  );

  // Helper function to check if tenant matches date search
  const isDateSearchMatch = React.useCallback(
    (tenant: { entryDate: Date; exitDate?: Date; receivePaymentDate: Date }, query: string) => {
      return (
        isDateMatch(tenant.entryDate, query) ||
        (tenant.exitDate ? isDateMatch(tenant.exitDate, query) : false) ||
        isDateMatch(tenant.receivePaymentDate, query)
      );
    },
    [isDateMatch]
  );

  // Non-hidden, filtered by search
  const filteredTenants = React.useMemo(() => {
    const base = allTenants.filter((t) => !t.hidden);
    if (!searchQuery) return base;

    const query = searchQuery.toLowerCase();

    return base.filter(
      (tenant: {
        name: string;
        apartmentId: string;
        notes?: string;
        entryDate: Date;
        exitDate?: Date;
        receivePaymentDate: Date;
      }) => {
        if (isBasicMatch(tenant, query)) return true;
        if (isDateSearchMatch(tenant, query)) return true;
        if (isTenantPropertyMatch(tenant, query)) return true;
        return false;
      }
    );
  }, [allTenants, searchQuery, isBasicMatch, isDateSearchMatch, isTenantPropertyMatch]);

  const hiddenTenants = React.useMemo(() => allTenants.filter((t) => !!t.hidden), [allTenants]);
  const tableData = showHiddenView ? hiddenTenants : filteredTenants;

  const table = useDataTableInstance({
    data: tableData,
    columns: allColumns,
    getRowId: (row) => row.id,
  });

  const selectedTenantIds = table.getSelectedRowModel().rows.map((r) => r.original.id);

  const hasSelection = selectedTenantIds.length > 0;

  const handleToggleHideSelected = () => {
    if (!hasSelection) return;
    setTenantsHidden(selectedTenantIds, !showHiddenView);
    table.resetRowSelection();
  };

  const handleDeleteSelected = () => {
    if (!hasSelection) return;
    selectedTenantIds.forEach((id) => {
      deleteTenant(id);
      fetch(`/api/tenants/${id}`, { method: 'DELETE' }).catch(() => {});
    });
    table.resetRowSelection();
  };

  const handleAddTenant = (newTenant: AddTenantFormData) => {
    addTenant(newTenant);
    setAddTenantDialogOpen(false);
  };

  const getActiveTenants = () => filteredTenants.filter((tenant) => tenant.status === 'current');
  const getPastTenants = () => filteredTenants.filter((tenant) => tenant.status === 'past');
  const getFutureTenants = () => filteredTenants.filter((tenant) => tenant.status === 'future');
  const getUpcomingTenants = () => filteredTenants.filter((tenant) => tenant.status === 'upcoming');

  return (
    <div className="space-y-4">
      {/* Tenant Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            База Данных Арендаторов
            {searchQuery && (
              <span className="text-muted-foreground text-sm font-normal">
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
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-100"
                >
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
              <Button variant="outline" size="sm" onClick={() => setShowHiddenView((v) => !v)}>
                {showHiddenView ? 'Показать основные' : 'Скрытые'}
              </Button>
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

          <div className="mt-3 flex items-center justify-start">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasSelection}
                onClick={handleToggleHideSelected}
              >
                {showHiddenView ? 'Вернуть в основные' : 'Скрыть выбранные'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasSelection}
                onClick={handleDeleteSelected}
              >
                Удалить выбранные
              </Button>
            </div>
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
