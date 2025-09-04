'use client';

import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';

import type { Tenant } from './schema';

interface HiddenTenantsTableProps {
  data: Tenant[];
  columns: ColumnDef<Tenant, unknown>[];
  onUnhide: (ids: string[]) => void;
}

export function HiddenTenantsTable({ data, columns, onUnhide }: HiddenTenantsTableProps) {
  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id,
  });

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="p-3">
      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      <div className="mt-3 flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasSelection}
          onClick={() => {
            onUnhide(selectedIds);
            table.resetRowSelection();
          }}
        >
          Вернуть в основные
        </Button>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
