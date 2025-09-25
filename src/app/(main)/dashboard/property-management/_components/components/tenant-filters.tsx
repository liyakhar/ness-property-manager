import { Plus } from 'lucide-react';
import type React from 'react';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { TENANT_DATABASE_CONSTANTS } from '../constants/tenant-database.constants';
import type { TenantFiltersProps } from '../types/tenant-database.props';

export const TenantFilters: React.FC<TenantFiltersProps> = ({
  table,
  showHiddenView,
  onToggleHiddenView,
  onAddColumn,
  onDeleteColumn,
  onAddTenant,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onToggleHiddenView}>
        {showHiddenView
          ? TENANT_DATABASE_CONSTANTS.MESSAGES.SHOW_MAIN
          : TENANT_DATABASE_CONSTANTS.MESSAGES.HIDDEN}
      </Button>
      <DataTableViewOptions
        table={table}
        onAddColumn={onAddColumn}
        onDeleteColumn={onDeleteColumn}
      />
      <Button onClick={onAddTenant}>
        <Plus className="mr-2 h-4 w-4" />
        {TENANT_DATABASE_CONSTANTS.MESSAGES.ADD_TENANT}
      </Button>
    </div>
  );
};
