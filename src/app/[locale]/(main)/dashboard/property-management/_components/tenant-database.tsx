'use client';

import { Plus, Users } from 'lucide-react';
import * as React from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCreateCustomFieldMutation,
  useCustomFieldsQuery,
  useDeleteCustomFieldMutation,
} from '@/hooks/use-custom-fields-query';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';
import { createCustomFieldColumns } from '@/lib/custom-field-utils';
import { usePropertyManagementStore } from '@/stores/property-management';
import { EntityType } from '@/types/custom-field.schema';

import { AddTenantDialog } from './add-tenant-dialog';
import type { AddTenantFormData, Tenant } from './schema';
import { tenantColumns } from './tenant-columns';

export function TenantDatabase() {
  const {
    tenants: data,
    properties,
    addTenant,
    isAddTenantDialogOpen,
    setAddTenantDialogOpen,
  } = usePropertyManagementStore();

  // Custom fields queries and mutations
  const { data: customFields = [] } = useCustomFieldsQuery(EntityType.TENANT);
  const createCustomFieldMutation = useCreateCustomFieldMutation();
  const deleteCustomFieldMutation = useDeleteCustomFieldMutation();

  // Function to handle adding new columns
  const handleAddColumn = async (columnData: { id: string; header: string; type: string }) => {
    try {
      // Create custom field definition in database
      await createCustomFieldMutation.mutateAsync({
        fieldId: columnData.id,
        header: columnData.header,
        type: columnData.type as 'text' | 'number' | 'date' | 'select' | 'boolean',
        entityType: EntityType.TENANT,
        order: customFields.length,
      });
    } catch (error) {
      console.error('Failed to add custom column:', error);
    }
  };

  // Function to handle deleting custom columns
  const handleDeleteColumn = async (columnId: string) => {
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

  // Create custom field columns from database definitions
  const customColumns = React.useMemo(() => {
    return createCustomFieldColumns<Tenant>(customFields);
  }, [customFields]);

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

  const getActiveTenants = () => data.filter((tenant) => tenant.status === 'current');
  const getPastTenants = () => data.filter((tenant) => tenant.status === 'past');
  const getFutureTenants = () => data.filter((tenant) => tenant.status === 'future');
  const getUpcomingTenants = () => data.filter((tenant) => tenant.status === 'upcoming');

  return (
    <div className="space-y-4">
      {/* Tenant Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            База Данных Арендаторов
          </CardTitle>
          <CardDescription>
            Управление всеми записями арендаторов и их назначениями в недвижимость
          </CardDescription>
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
              <DataTableViewOptions
                table={table}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
              />
              <Button variant="default" size="default" onClick={() => setAddTenantDialogOpen(true)}>
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
