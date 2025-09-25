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
  onAddTenant,
  selectedCount,
  onToggleHideSelected,
  onDeleteSelected,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0}
            onClick={onToggleHideSelected}
          >
            {showHiddenView
              ? TENANT_DATABASE_CONSTANTS.MESSAGES.RETURN_TO_MAIN
              : TENANT_DATABASE_CONSTANTS.MESSAGES.HIDE_SELECTED}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCount === 0}
            onClick={onDeleteSelected}
          >
            {TENANT_DATABASE_CONSTANTS.MESSAGES.DELETE_SELECTED}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleHiddenView}>
          {showHiddenView
            ? TENANT_DATABASE_CONSTANTS.MESSAGES.SHOW_MAIN
            : TENANT_DATABASE_CONSTANTS.MESSAGES.HIDDEN}
        </Button>
        <DataTableViewOptions table={table} onAddColumn={onAddColumn} />
        <Button onClick={onAddTenant}>
          <Plus className="mr-2 h-4 w-4" />
          {TENANT_DATABASE_CONSTANTS.MESSAGES.ADD_TENANT}
        </Button>
      </div>
    </div>
  );
};
