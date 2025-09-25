'use client';

import { Users } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTenantDialog } from './add-tenant-dialog';
import { TenantDatabaseSkeleton } from './components/tenant-database-skeleton';
import { TenantFilters } from './components/tenant-filters';
import { TenantStats } from './components/tenant-stats';
import { TENANT_DATABASE_CONSTANTS } from './constants/tenant-database.constants';
import { useTenantDatabase } from './hooks/use-tenant-database';
import { usePropertyManagementStore } from '@/stores/property-management';
import type { TenantDatabaseProps } from './types/tenant-database.props';

export function TenantDatabase({ searchQuery = '' }: TenantDatabaseProps) {
  const {
    filteredTenants,
    properties,
    isLoading,
    table,
    allColumns,
    showHiddenView,
    selectedTenantIds,
    setShowHiddenView,
    handleAddColumn,
    handleDeleteColumn,
    handleToggleHideSelected,
    handleDeleteSelected,
    handleAddTenant,
  } = useTenantDatabase(searchQuery);

  const { isAddTenantDialogOpen, setAddTenantDialogOpen } = usePropertyManagementStore();

  if (isLoading) {
    return <TenantDatabaseSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {TENANT_DATABASE_CONSTANTS.MESSAGES.TENANT_DATABASE}
            {searchQuery && (
              <span className="text-muted-foreground text-sm font-normal">
                ({TENANT_DATABASE_CONSTANTS.MESSAGES.FOUND} {filteredTenants.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <TenantStats tenants={filteredTenants} />
            <TenantFilters
              table={table}
              showHiddenView={showHiddenView}
              onToggleHiddenView={() => setShowHiddenView(!showHiddenView)}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddTenant={() => setAddTenantDialogOpen(true)}
            />
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
                  disabled={selectedTenantIds.length === 0}
                  onClick={handleToggleHideSelected}
                >
                  {TENANT_DATABASE_CONSTANTS.MESSAGES.RETURN_TO_MAIN}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedTenantIds.length === 0}
                  onClick={handleToggleHideSelected}
                >
                  {TENANT_DATABASE_CONSTANTS.MESSAGES.HIDE_SELECTED}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={selectedTenantIds.length === 0}
                onClick={handleDeleteSelected}
              >
                {TENANT_DATABASE_CONSTANTS.MESSAGES.DELETE_SELECTED}
              </Button>
            </div>
          </div>

          <DataTablePagination table={table} />

          <AddTenantDialog
            open={isAddTenantDialogOpen}
            onOpenChange={setAddTenantDialogOpen}
            onAddTenant={handleAddTenant}
            properties={properties as never}
          />
        </CardContent>
      </Card>
    </div>
  );
}
