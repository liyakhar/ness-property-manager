import type React from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { TenantTableProps } from '../types/tenant-database.props';

export const TenantTable: React.FC<TenantTableProps> = ({ table, columns }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <DataTable table={table} columns={columns} />
      </div>
      <DataTablePagination table={table} />
    </div>
  );
};
