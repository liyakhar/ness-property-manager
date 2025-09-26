import type { ColumnDef, Table } from '@tanstack/react-table';
import type { Tenant } from '../schema';

export interface TenantDatabaseProps {
  searchQuery?: string;
}

export interface TenantDatabaseSkeletonProps {
  rowsCount?: number;
}

export interface TenantStatsProps {
  tenants: Tenant[];
  customStatusOptions?: { value: string; label: string }[];
  selectedStatus?: string;
  onStatusFilter?: (status: string) => void;
}

export interface TenantTableProps {
  table: Table<Tenant>;
  columns: ColumnDef<Tenant>[];
}

export interface TenantFiltersProps {
  table: Table<Tenant>;
  showHiddenView: boolean;
  onToggleHiddenView: () => void;
  onAddColumn: (columnData: AddColumnData) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTenant: () => void;
}

export interface AddColumnData {
  id: string;
  header: string;
  type: string;
}

export interface TenantSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface TenantStatusBadgeProps {
  count: number;
  variant: 'current' | 'upcoming' | 'future' | 'past';
  label: string;
}
