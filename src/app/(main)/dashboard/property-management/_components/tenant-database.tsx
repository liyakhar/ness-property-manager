'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTenantDialog } from './add-tenant-dialog';
import { TenantDatabaseSkeleton } from './components/tenant-database-skeleton';
import { TenantFilters } from './components/tenant-filters';
import { TenantStats } from './components/tenant-stats';
import { TenantTable } from './components/tenant-table';
import { TENANT_DATABASE_CONSTANTS } from './constants/tenant-database.constants';
import { useTenantDatabase } from './hooks/use-tenant-database';
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
              onAddTenant={() => {
                // This would need to be connected to the store
                console.log('Add tenant clicked');
              }}
              selectedCount={selectedTenantIds.length}
              onToggleHideSelected={handleToggleHideSelected}
              onDeleteSelected={handleDeleteSelected}
            />
          </div>

          <TenantTable table={table} columns={allColumns} />

          <AddTenantDialog
            open={false} // This would need to be connected to the store
            onOpenChange={() => {}}
            onAddTenant={handleAddTenant}
            properties={properties as never}
          />
        </CardContent>
      </Card>
    </div>
  );
}
