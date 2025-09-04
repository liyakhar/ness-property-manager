'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { Building2, Plus } from 'lucide-react';
import * as React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';
import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  usePropertiesQuery,
  useUpdatePropertyMutation,
} from '@/hooks/use-properties-query';
import { usePropertyManagementStore } from '@/stores/property-management';
import { AddPropertyDialog } from './add-property-dialog';
import { EditableCell } from './editable-cell';
import { createPropertyColumns } from './property-columns';
import type { AddPropertyFormData, Property } from './schema';

// import { HiddenPropertiesTable } from "./hidden-properties-table";

// Loading skeleton component
const PropertiesTableSkeleton = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
            </div>
          </div>
          {/* Table rows skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={`property-skeleton-row-${Date.now()}-${i}`}
                className="flex items-center space-x-4"
              >
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          {/* Pagination skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface PropertiesTableProps {
  searchQuery?: string;
}

export function PropertiesTable({ searchQuery = '' }: PropertiesTableProps) {
  const { data: allProperties = [], isLoading } = usePropertiesQuery();
  const createPropertyMutation = useCreatePropertyMutation();
  const updatePropertyMutation = useUpdatePropertyMutation();
  const deletePropertyMutation = useDeletePropertyMutation();

  const { isAddPropertyDialogOpen, setAddPropertyDialogOpen } = usePropertyManagementStore();

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
  const handleAddColumn = async (columnData: { id: string; header: string; type: string }) => {
    // Add the new field to all existing properties with a default value
    for (const property of allProperties) {
      if (!(property as Record<string, unknown>)[columnData.id]) {
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
        await updatePropertyMutation.mutateAsync({
          id: property.id,
          updates: { [columnData.id]: defaultValue },
        });
      }
    }

    const newColumn: ColumnDef<Property> = {
      id: columnData.id,
      accessorKey: columnData.id,
      header: () => <div className="font-medium">{columnData.header}</div>,
      cell: ({ row }) => {
        // Use EditableCell for custom columns
        const value = (row.original as Record<string, unknown>)[columnData.id];
        return (
          <EditableCell
            value={value}
            onSave={async (newValue: unknown) => {
              const updates = { [columnData.id]: newValue };
              await updatePropertyMutation.mutateAsync({ id: row.original.id, updates });
            }}
            type={
              columnData.type === 'boolean'
                ? 'text'
                : (columnData.type as 'text' | 'number' | 'date' | 'select')
            }
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
      localStorage.setItem('property-custom-columns', JSON.stringify(updatedColumns));
    }
  };

  // Create property columns with update function
  const propertyColumns = React.useMemo(() => {
    return createPropertyColumns(
      async (id: string, updates: Partial<Property>) => {
        await updatePropertyMutation.mutateAsync({ id, updates });
      },
      async (id: string) => {
        await deletePropertyMutation.mutateAsync(id);
      }
    );
  }, [updatePropertyMutation, deletePropertyMutation]);

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...propertyColumns, ...customColumns];
  }, [propertyColumns, customColumns]);

  const [showHiddenView, setShowHiddenView] = React.useState(false);

  // Non-hidden, filtered by search
  const filteredProperties = React.useMemo(() => {
    const base = allProperties.filter((p) => !p.hidden);
    if (!searchQuery) return base;
    const query = searchQuery.toLowerCase();
    return base.filter(
      (property) =>
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query) ||
        property.propertyType.toLowerCase().includes(query) ||
        property.occupancyStatus.toLowerCase().includes(query) ||
        property.rooms.toString().includes(query) ||
        property.urgentMatter?.toLowerCase().includes(query)
    );
  }, [allProperties, searchQuery]);

  // Hidden (not search-filtered to keep all hidden visible)
  const hiddenProperties = React.useMemo(
    () => allProperties.filter((p) => !!p.hidden),
    [allProperties]
  );

  const tableData = showHiddenView ? hiddenProperties : filteredProperties;

  const table = useDataTableInstance({
    data: tableData,
    columns: allColumns,
    getRowId: (row) => row.id,
  });

  const selectedPropertyIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
  const hasSelection = selectedPropertyIds.length > 0;

  const handleHideSelected = async () => {
    if (!hasSelection) return;
    for (const id of selectedPropertyIds) {
      await updatePropertyMutation.mutateAsync({ id, updates: { hidden: true } });
    }
    table.resetRowSelection();
  };
  const handleUnhideSelected = async () => {
    if (!hasSelection) return;
    for (const id of selectedPropertyIds) {
      await updatePropertyMutation.mutateAsync({ id, updates: { hidden: false } });
    }
    table.resetRowSelection();
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection) return;
    for (const id of selectedPropertyIds) {
      await deletePropertyMutation.mutateAsync(id);
    }
    table.resetRowSelection();
  };

  const handleAddProperty = async (newProperty: AddPropertyFormData) => {
    try {
      await createPropertyMutation.mutateAsync(newProperty);
      setAddPropertyDialogOpen(false);
    } catch (error) {
      console.error('Error adding property:', error);
      // Error handling is done in the dialog component
    }
  };

  if (isLoading) {
    return <PropertiesTableSkeleton />;
  }

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
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  {filteredProperties.filter((p) => p.occupancyStatus === 'свободна').length}{' '}
                  Свободна
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 hover:bg-orange-50"
                >
                  {filteredProperties.filter((p) => p.occupancyStatus === 'занята').length} Занята
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowHiddenView((v) => !v)}>
                {showHiddenView ? 'Показать основные' : 'Скрытые'}
              </Button>
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

          <div className="mt-3 flex items-center justify-start">
            <div className="flex items-center gap-2">
              {showHiddenView ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasSelection}
                  onClick={handleUnhideSelected}
                >
                  Вернуть в основные
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasSelection}
                  onClick={handleHideSelected}
                >
                  Скрыть выбранные
                </Button>
              )}
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

      <AddPropertyDialog
        open={isAddPropertyDialogOpen}
        onOpenChange={setAddPropertyDialogOpen}
        onAddProperty={handleAddProperty}
      />
    </div>
  );
}
