import type { ColumnDef } from '@tanstack/react-table';
import React, { useCallback, useMemo, useState } from 'react';
import { useDataTableInstance } from '@/hooks/use-data-table-instance';
import { usePropertiesQuery } from '@/hooks/use-properties-query';
import {
  useCreateTenantMutation,
  useDeleteTenantMutation,
  useTenantsQuery,
  useUpdateTenantMutation,
} from '@/hooks/use-tenants-query';
import { usePropertyManagementStore } from '@/stores/property-management';
import { TENANT_DATABASE_CONSTANTS } from '../constants/tenant-database.constants';
import type { AddTenantFormData, Tenant } from '../schema';
import { tenantDatabaseService } from '../services/tenant-database.service';
import { createTenantColumns } from '../tenant-columns';
import type { AddColumnData } from '../types/tenant-database.props';

interface UseTenantDatabaseReturn {
  // Data
  allTenants: Tenant[];
  filteredTenants: Tenant[];
  hiddenTenants: Tenant[];
  properties: Array<{ id: string; location: string; apartmentNumber: number }>;

  // Loading states
  isLoading: boolean;

  // Table state
  table: ReturnType<typeof useDataTableInstance<Tenant, unknown>>;
  customColumns: ColumnDef<Tenant>[];
  allColumns: ColumnDef<Tenant>[];
  showHiddenView: boolean;
  selectedTenantIds: string[];
  hasSelection: boolean;

  // Actions
  setShowHiddenView: (show: boolean) => void;
  handleAddColumn: (columnData: AddColumnData) => Promise<void>;
  handleToggleHideSelected: () => Promise<void>;
  handleDeleteSelected: () => Promise<void>;
  handleAddTenant: (newTenant: AddTenantFormData) => Promise<void>;

  // Computed
  getActiveTenants: () => Tenant[];
  getPastTenants: () => Tenant[];
  getFutureTenants: () => Tenant[];
  getUpcomingTenants: () => Tenant[];
}

export const useTenantDatabase = (searchQuery = ''): UseTenantDatabaseReturn => {
  const { data: allTenants = [], isLoading } = useTenantsQuery();
  const createTenantMutation = useCreateTenantMutation();
  const updateTenantMutation = useUpdateTenantMutation();
  const deleteTenantMutation = useDeleteTenantMutation();
  const { data: properties = [] } = usePropertiesQuery();
  const { setAddTenantDialogOpen } = usePropertyManagementStore();

  // State for custom columns
  const [customColumns, setCustomColumns] = useState<ColumnDef<Tenant>[]>([]);

  // Load custom columns from localStorage on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TENANT_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS);
      if (saved) {
        try {
          const parsedColumns = JSON.parse(saved);
          setCustomColumns(parsedColumns);
        } catch (error) {
          console.error(TENANT_DATABASE_CONSTANTS.MESSAGES.FAILED_TO_PARSE, error);
        }
      }
    }
  }, []);

  const [showHiddenView, setShowHiddenView] = useState(false);

  // Create tenant columns with update function
  const tenantColumns = useMemo(() => {
    return createTenantColumns(
      async (id: string, updates: Partial<Tenant>) => {
        await updateTenantMutation.mutateAsync({ id, updates });
      },
      properties,
      async (id: string) => {
        await deleteTenantMutation.mutateAsync(id);
      }
    );
  }, [properties, updateTenantMutation, deleteTenantMutation]);

  // Combine default columns with custom columns
  const allColumns = useMemo(() => {
    return [...tenantColumns, ...customColumns];
  }, [tenantColumns, customColumns]);

  // Helper function to check DD/MM format
  const isDDMMFormat = useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === TENANT_DATABASE_CONSTANTS.UI.DATE_FORMATS.DD_MM) {
      const [dayPart, monthPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check DD/MM/YYYY format
  const isDDMMYYYYFormat = useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (
        query.includes('/') &&
        query.length === TENANT_DATABASE_CONSTANTS.UI.DATE_FORMATS.DD_MM_YYYY
      ) {
        const [dayPart, monthPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check MM/DD format
  const isMMDDFormat = useCallback((day: string, month: string, query: string) => {
    if (query.includes('/') && query.length === TENANT_DATABASE_CONSTANTS.UI.DATE_FORMATS.DD_MM) {
      const [monthPart, dayPart] = query.split('/');
      return day === dayPart && month === monthPart;
    }
    return false;
  }, []);

  // Helper function to check MM/DD/YYYY format
  const isMMDDYYYYFormat = useCallback(
    (day: string, month: string, year: string, query: string) => {
      if (
        query.includes('/') &&
        query.length === TENANT_DATABASE_CONSTANTS.UI.DATE_FORMATS.DD_MM_YYYY
      ) {
        const [monthPart, dayPart, yearPart] = query.split('/');
        return day === dayPart && month === monthPart && year === yearPart;
      }
      return false;
    },
    []
  );

  // Helper function to check if query matches date formats
  const isDateMatch = useCallback(
    (date: Date, searchQuery: string) => {
      const query = searchQuery.toLowerCase();

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      if (isDDMMFormat(day, month, query)) return true;
      if (isDDMMYYYYFormat(day, month, year, query)) return true;
      if (isMMDDFormat(day, month, query)) return true;
      if (isMMDDYYYYFormat(day, month, year, query)) return true;

      if (day.includes(query) || month.includes(query) || year.includes(query)) return true;
      if (date.toDateString().toLowerCase().includes(query)) return true;

      return false;
    },
    [isDDMMFormat, isDDMMYYYYFormat, isMMDDFormat, isMMDDYYYYFormat]
  );

  // Helper function to check if tenant matches property search
  const isTenantPropertyMatch = useCallback(
    (tenant: { apartmentId: string }, query: string) => {
      const property = properties.find((p) => p.id === tenant.apartmentId);
      if (!property) return false;

      return (
        property.apartmentNumber.toString().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.readinessStatus.toLowerCase().includes(query) ||
        property.rooms.toString().includes(query) ||
        (property.urgentMatter?.toLowerCase().includes(query) ?? false)
      );
    },
    [properties]
  );

  // Helper function to check if tenant matches basic search
  const isBasicMatch = useCallback(
    (tenant: { name: string; apartmentId: string; notes?: string }, query: string) => {
      return (
        tenant.name.toLowerCase().includes(query) ||
        tenant.apartmentId.toLowerCase().includes(query) ||
        (tenant.notes?.toLowerCase().includes(query) ?? false)
      );
    },
    []
  );

  // Helper function to check if tenant matches date search
  const isDateSearchMatch = useCallback(
    (tenant: { entryDate: Date; exitDate?: Date; receivePaymentDate: Date }, query: string) => {
      return (
        isDateMatch(tenant.entryDate, query) ||
        (tenant.exitDate ? isDateMatch(tenant.exitDate, query) : false) ||
        isDateMatch(tenant.receivePaymentDate, query)
      );
    },
    [isDateMatch]
  );

  // Non-hidden, filtered by search
  const filteredTenants = useMemo(() => {
    const base = allTenants.filter((t) => !t.hidden);
    if (!searchQuery) return base;

    const query = searchQuery.toLowerCase();

    return base.filter((tenant) => {
      if (isBasicMatch(tenant, query)) return true;
      if (isDateSearchMatch(tenant, query)) return true;
      if (isTenantPropertyMatch(tenant, query)) return true;
      return false;
    });
  }, [allTenants, searchQuery, isBasicMatch, isDateSearchMatch, isTenantPropertyMatch]);

  const hiddenTenants = useMemo(() => allTenants.filter((t) => !!t.hidden), [allTenants]);
  const tableData = showHiddenView ? hiddenTenants : filteredTenants;

  const table = useDataTableInstance<Tenant, unknown>({
    data: tableData,
    columns: allColumns,
    getRowId: (row) => row.id,
  });

  const selectedTenantIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
  const hasSelection = selectedTenantIds.length > 0;

  // Function to handle adding new columns
  const handleAddColumn = async (columnData: AddColumnData) => {
    const result = await tenantDatabaseService.addCustomColumnToTenants(
      allTenants,
      columnData,
      async (id: string, updates: Partial<Tenant>) => {
        await updateTenantMutation.mutateAsync({ id, updates });
      }
    );

    result.match(
      () => {
        const newColumn: ColumnDef<Tenant> = {
          id: columnData.id,
          accessorKey: columnData.id,
          header: columnData.header,
          cell: ({ row }) => {
            const value = (row.original as Record<string, unknown>)[columnData.id];
            return String(value);
          },
          enableSorting: true,
          enableHiding: true,
        };

        const updatedColumns = [...customColumns, newColumn];
        setCustomColumns(updatedColumns);

        if (typeof window !== 'undefined') {
          localStorage.setItem(
            TENANT_DATABASE_CONSTANTS.STORAGE_KEYS.CUSTOM_COLUMNS,
            JSON.stringify(updatedColumns)
          );
        }
      },
      (error) => {
        console.error('Failed to add custom column:', error.message);
      }
    );
  };

  const handleToggleHideSelected = async () => {
    if (!hasSelection) return;
    for (const id of selectedTenantIds) {
      await updateTenantMutation.mutateAsync({ id, updates: { hidden: !showHiddenView } });
    }
    table.resetRowSelection();
  };

  const handleDeleteSelected = async () => {
    if (!hasSelection) return;
    for (const id of selectedTenantIds) {
      await deleteTenantMutation.mutateAsync(id);
    }
    table.resetRowSelection();
  };

  const handleAddTenant = async (newTenant: AddTenantFormData) => {
    try {
      await createTenantMutation.mutateAsync(newTenant);
      setAddTenantDialogOpen(false);
    } catch (error) {
      console.error('Error adding tenant:', error);
    }
  };

  const getActiveTenants = () => filteredTenants.filter((tenant) => tenant.status === 'current');
  const getPastTenants = () => filteredTenants.filter((tenant) => tenant.status === 'past');
  const getFutureTenants = () => filteredTenants.filter((tenant) => tenant.status === 'future');
  const getUpcomingTenants = () => filteredTenants.filter((tenant) => tenant.status === 'upcoming');

  return {
    allTenants,
    filteredTenants,
    hiddenTenants,
    properties,
    isLoading,
    table,
    customColumns,
    allColumns,
    showHiddenView,
    selectedTenantIds,
    hasSelection,
    setShowHiddenView,
    handleAddColumn,
    handleToggleHideSelected,
    handleDeleteSelected,
    handleAddTenant,
    getActiveTenants,
    getPastTenants,
    getFutureTenants,
    getUpcomingTenants,
  };
};
