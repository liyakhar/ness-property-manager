import type { ColumnDef, Table } from '@tanstack/react-table';
import type { Property } from '../schema';

export interface PropertyDatabaseProps {
  searchQuery?: string;
}

export interface PropertyDatabaseSkeletonProps {
  rowsCount?: number;
}

export interface PropertyStatsProps {
  properties: Property[];
  customStatusOptions?: { value: string; label: string }[];
  selectedStatus?: string;
  onStatusFilter?: (status: string) => void;
  onDeleteStatus?: (statusValue: string) => void;
}

export interface PropertyTableProps {
  table: Table<Property>;
  columns: ColumnDef<Property>[];
}

export interface PropertyFiltersProps {
  table: Table<Property>;
  showHiddenView: boolean;
  onToggleHiddenView: () => void;
  onAddColumn: (columnData: AddColumnData) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddProperty: () => void;
  selectedCount: number;
  onToggleHideSelected: () => void;
  onDeleteSelected: () => void;
}

export interface AddColumnData {
  id: string;
  header: string;
  type: string;
}

export interface PropertySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface PropertyStatusBadgeProps {
  count: number;
  variant: 'available' | 'occupied';
  label: string;
}
