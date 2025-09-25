import { useEffect } from 'react';
import type { Property } from '@/app/(main)/dashboard/property-management/_components/schema';
import { usePropertyManagementStore } from '@/stores/property-management';

export const usePropertyManagement = () => {
  const { properties, tenants, isLoading, fetchProperties, fetchTenants, updateProperty } =
    usePropertyManagementStore();

  // Fetch both properties and tenants on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally want to fetch only on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProperties(), fetchTenants()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []); // Intentionally empty dependency array - we only want to fetch on mount

  const handleUpdateProperty = (id: string, updates: Partial<Property>) => {
    updateProperty(id, updates);
  };

  return {
    properties,
    tenants,
    isLoading,
    updateProperty: handleUpdateProperty,
    refetch: async () => {
      try {
        await Promise.all([fetchProperties(), fetchTenants()]);
      } catch (error) {
        console.error('Error refetching data:', error);
        throw error;
      }
    },
  };
};
