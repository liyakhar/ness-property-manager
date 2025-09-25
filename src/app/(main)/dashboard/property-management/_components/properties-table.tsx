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
import { PROPERTY_DATABASE_CONSTANTS } from './constants/property-database.constants';
import { EditableCell } from './editable-cell';
import { createPropertyColumns } from './property-columns';
import type { AddPropertyFormData, Property } from './schema';
import { propertyDatabaseService } from './services/property-database.service';
import type { AddColumnData } from './types/property-database.props';

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
  const [customColumns, setCustomColumns] = React.useState<ColumnDef<Property>[]>([]);

  // Load custom columns from localStorage on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROPERTY_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS);
      if (saved) {
        try {
          const parsedColumns = JSON.parse(saved) as ColumnDef<Property>[];

          // Migrate any English headers to Russian
          const migratedColumns = parsedColumns.map((column: ColumnDef<Property>) => {
            if (column.header && typeof column.header === 'string') {
              // Check if header is in English and needs translation
              const englishToRussian: Record<string, string> = {
                'Apartment Number': 'Номер Квартиры',
                Location: 'Расположение',
                Rooms: 'Комнаты',
                'Readiness Status': 'Готовность',
                'Property Type': 'Тип',
                'Occupancy Status': 'Статус',
                'Urgent Matter': 'Срочные Вопросы',
                Test: 'Тест',
                Created: 'Создано',
                Updated: 'Обновлено',
                Actions: 'Действия',
              };

              if (englishToRussian[column.header]) {
                return { ...column, header: englishToRussian[column.header] };
              }
            }
            return column;
          });

          setCustomColumns(migratedColumns);

          // Save migrated columns back to localStorage
          localStorage.setItem(
            PROPERTY_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS,
            JSON.stringify(migratedColumns)
          );
        } catch (e) {
          console.error(PROPERTY_DATABASE_CONSTANTS.MESSAGES.FAILED_TO_PARSE, e);
        }
      }
    }
  }, []);

  // Function to handle adding new columns
  const handleAddColumn = async (columnData: AddColumnData) => {
    const result = await propertyDatabaseService.addCustomColumnToProperties(
      allProperties,
      columnData,
      async (id: string, updates: Partial<Property>) => {
        await updatePropertyMutation.mutateAsync({ id, updates });
      }
    );

    result.match(
      () => {
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

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            PROPERTY_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS,
            JSON.stringify(updatedColumns)
          );
        }
      },
      (error) => {
        console.error('Failed to add custom column:', error.message);
      }
    );
  };

  // Function to handle deleting custom columns
  const handleDeleteColumn = async (columnId: string) => {
    const result = await propertyDatabaseService.deleteCustomColumnFromProperties(
      allProperties,
      columnId,
      async (id: string, updates: Partial<Property>) => {
        await updatePropertyMutation.mutateAsync({ id, updates });
      }
    );

    result.match(
      () => {
        const updatedColumns = customColumns.filter((column) => column.id !== columnId);
        setCustomColumns(updatedColumns);

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            PROPERTY_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS,
            JSON.stringify(updatedColumns)
          );
        }
      },
      (error) => {
        console.error('Failed to delete custom column:', error.message);
      }
    );
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
              <DataTableViewOptions
                table={table}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
              />
              <Button variant="default" size="default" onClick={() => setAddPropertyDialogOpen(true)}>
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
