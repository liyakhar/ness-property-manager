import { err, ok, type Result } from 'neverthrow';
import { useCallback, useEffect, useState } from 'react';
import type { Property } from '@/app/(main)/dashboard/property-management/_components/schema';
import { usePropertyManagementStore } from '@/stores/property-management';

interface UsePropertyManagementReturn {
  properties: Property[];
  tenants: unknown[]; // This would need proper typing
  isLoading: boolean;
  error: string | null;
  updateProperty: (id: string, updates: Partial<Property>) => Result<void, string>;
  refetch: () => Promise<Result<void, string>>;
}

export const usePropertyManagement = (): UsePropertyManagementReturn => {
  const { properties, tenants, isLoading, fetchProperties, fetchTenants, updateProperty } =
    usePropertyManagementStore();

  const [error, setError] = useState<string | null>(null);

  // Fetch both properties and tenants on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([fetchProperties(), fetchTenants()]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading data:', errorMessage);
      }
    };

    loadData();
  }, [fetchProperties, fetchTenants]); // We intentionally want to fetch only on mount

  const handleUpdateProperty = useCallback(
    (id: string, updates: Partial<Property>): Result<void, string> => {
      try {
        updateProperty(id, updates);
        return ok(undefined);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update property';
        setError(errorMessage);
        console.error('Error updating property:', errorMessage);
        return err(errorMessage);
      }
    },
    [updateProperty]
  );

  const handleRefetch = useCallback(async (): Promise<Result<void, string>> => {
    try {
      setError(null);
      await Promise.all([fetchProperties(), fetchTenants()]);
      return ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refetch data';
      setError(errorMessage);
      console.error('Error refetching data:', errorMessage);
      return err(errorMessage);
    }
  }, [fetchProperties, fetchTenants]);

  return {
    properties,
    tenants,
    isLoading,
    error,
    updateProperty: handleUpdateProperty,
    refetch: handleRefetch,
  };
};
