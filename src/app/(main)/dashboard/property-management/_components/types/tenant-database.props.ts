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
}

export interface TenantTableProps {
  table: Table<Tenant>;
  columns: ColumnDef<Tenant>[];
}

export interface TenantFiltersProps {
  showHiddenView: boolean;
  onToggleHiddenView: () => void;
  onAddColumn: (columnData: AddColumnData) => void;
  onAddTenant: () => void;
  selectedCount: number;
  onToggleHideSelected: () => void;
  onDeleteSelected: () => void;
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
