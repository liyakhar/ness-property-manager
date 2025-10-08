'use client';

import { Building2, Plus } from 'lucide-react';
import * as React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCreateCustomFieldMutation,
  useCustomFieldsQuery,
  useDeleteCustomFieldMutation,
} from '@/hooks/use-custom-fields-query';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';
import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  usePropertiesQuery,
  useUpdatePropertyMutation,
} from '@/hooks/use-properties-query';
import { createCustomFieldColumns } from '@/lib/custom-field-utils';
import { usePropertyManagementStore } from '@/stores/property-management';
import { EntityType } from '@/types/custom-field.schema';
import { AddPropertyDialog } from './add-property-dialog';
import { PropertyStats } from './components/property-stats';
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

  // Custom fields queries and mutations
  const { data: customFields = [], isLoading: isLoadingCustomFields } = useCustomFieldsQuery(
    EntityType.PROPERTY
  );
  const createCustomFieldMutation = useCreateCustomFieldMutation();
  const deleteCustomFieldMutation = useDeleteCustomFieldMutation();

  const { isAddPropertyDialogOpen, setAddPropertyDialogOpen } = usePropertyManagementStore();

  const [isMounted, setIsMounted] = React.useState(false);

  // State for custom status options
  const [customStatusOptions, setCustomStatusOptions] = React.useState<
    { value: string; label: string }[]
  >([]);

  // State for status filtering
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(undefined);

  // Track component mounting state
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Load custom status options from localStorage (keeping this for now)
  React.useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const savedStatusOptions = localStorage.getItem('property-custom-status-options');
    if (savedStatusOptions) {
      try {
        const parsedStatusOptions = JSON.parse(savedStatusOptions);
        setCustomStatusOptions(parsedStatusOptions);
      } catch (e) {
        console.error('Failed to parse custom status options:', e);
      }
    }
  }, [isMounted]);

  // Function to handle adding new status options
  const handleAddStatus = React.useCallback((status: { value: string; label: string }) => {
    setCustomStatusOptions((prev) => {
      const newOptions = [...prev, status];
      if (typeof window !== 'undefined') {
        localStorage.setItem('property-custom-status-options', JSON.stringify(newOptions));
      }
      return newOptions;
    });
  }, []);

  // Function to handle deleting custom status options
  const handleDeleteStatus = React.useCallback((statusValue: string) => {
    setCustomStatusOptions((prev) => {
      const newOptions = prev.filter((option) => option.value !== statusValue);
      if (typeof window !== 'undefined') {
        localStorage.setItem('property-custom-status-options', JSON.stringify(newOptions));
      }
      return newOptions;
    });
  }, []);

  // Function to handle status filtering
  const handleStatusFilter = React.useCallback(
    (status: string) => {
      setSelectedStatus(selectedStatus === status ? undefined : status);
    },
    [selectedStatus]
  );

  // Function to handle adding new columns
  const handleAddColumn = async (columnData: AddColumnData) => {
    if (!isMounted) return;

    try {
      // Create custom field definition in database
      await createCustomFieldMutation.mutateAsync({
        fieldId: columnData.id,
        header: columnData.header,
        type: columnData.type as 'text' | 'number' | 'date' | 'select' | 'boolean',
        entityType: EntityType.PROPERTY,
        order: customFields.length,
      });

      // Add default values to all existing properties
      const result = await propertyDatabaseService.addCustomColumnToProperties(
        allProperties,
        columnData,
        async (id: string, updates: Partial<Property>) => {
          if (isMounted) {
            await updatePropertyMutation.mutateAsync({ id, updates });
          }
        }
      );

      if (result.isErr()) {
        console.error('Failed to add custom column to properties:', result.error.message);
      }
    } catch (error) {
      console.error('Failed to add custom column:', error);
    }
  };

  // Function to handle deleting custom columns
  const handleDeleteColumn = async (columnId: string) => {
    if (!isMounted) return;

    try {
      // Find the custom field definition to get its ID
      const customField = customFields.find((field) => field.fieldId === columnId);
      if (!customField) {
        console.error('Custom field not found:', columnId);
        return;
      }

      // Delete custom field definition from database (with data cleanup)
      await deleteCustomFieldMutation.mutateAsync({
        id: customField.id,
        cleanupData: true,
      });
    } catch (error) {
      console.error('Failed to delete custom column:', error);
    }
  };

  // Create property columns with update function
  const propertyColumns = React.useMemo(() => {
    return createPropertyColumns(
      async (id: string, updates: Partial<Property>) => {
        if (isMounted) {
          await updatePropertyMutation.mutateAsync({ id, updates });
        }
      },
      async (id: string) => {
        if (isMounted) {
          await deletePropertyMutation.mutateAsync(id);
        }
      },
      handleAddStatus,
      handleDeleteStatus,
      customStatusOptions
    );
  }, [
    updatePropertyMutation,
    deletePropertyMutation,
    isMounted,
    handleAddStatus,
    handleDeleteStatus,
    customStatusOptions,
  ]);

  // Create custom field columns from database definitions
  const customColumns = React.useMemo(() => {
    return createCustomFieldColumns<Property>(customFields);
  }, [customFields]);

  // Combine default columns with custom columns
  const allColumns = React.useMemo(() => {
    return [...propertyColumns, ...customColumns];
  }, [propertyColumns, customColumns]);

  const [showHiddenView, setShowHiddenView] = React.useState(false);

  // Non-hidden, filtered by search and status
  const filteredProperties = React.useMemo(() => {
    let base = allProperties.filter((p) => !p.hidden);

    // Apply status filter
    if (selectedStatus) {
      base = base.filter((property) => property.occupancyStatus === selectedStatus);
    }

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
  }, [allProperties, searchQuery, selectedStatus]);

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
    if (!hasSelection || !isMounted) return;
    for (const id of selectedPropertyIds) {
      if (isMounted) {
        await updatePropertyMutation.mutateAsync({ id, updates: { hidden: true } });
      }
    }
    if (isMounted) {
      table.resetRowSelection();
    }
  };
  const handleUnhideSelected = async () => {
    if (!hasSelection || !isMounted) return;
    for (const id of selectedPropertyIds) {
      if (isMounted) {
        await updatePropertyMutation.mutateAsync({ id, updates: { hidden: false } });
      }
    }
    if (isMounted) {
      table.resetRowSelection();
    }
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection || !isMounted) return;
    for (const id of selectedPropertyIds) {
      if (isMounted) {
        await deletePropertyMutation.mutateAsync(id);
      }
    }
    if (isMounted) {
      table.resetRowSelection();
    }
  };

  const handleAddProperty = async (newProperty: AddPropertyFormData) => {
    if (!isMounted) return;

    try {
      await createPropertyMutation.mutateAsync(newProperty);
      if (isMounted) {
        setAddPropertyDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      // Error handling is done in the dialog component
    }
  };

  if (isLoading || isLoadingCustomFields) {
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
            <PropertyStats
              properties={filteredProperties}
              customStatusOptions={customStatusOptions}
              selectedStatus={selectedStatus}
              onStatusFilter={handleStatusFilter}
              onDeleteStatus={handleDeleteStatus}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowHiddenView((v) => !v)}>
                {showHiddenView ? 'Показать основные' : 'Скрытые'}
              </Button>
              <DataTableViewOptions
                table={table}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
              />
              <Button
                variant="default"
                size="default"
                onClick={() => setAddPropertyDialogOpen(true)}
              >
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
