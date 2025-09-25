import { err, ok, type Result } from 'neverthrow';
import { useCallback, useEffect, useState } from 'react';
import type {
  AddPropertyFormData,
  Property,
} from '@/app/(main)/dashboard/property-management/_components/schema';
import { usePropertyManagementStore } from '@/stores/property-management';

interface UsePropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  addProperty: (propertyData: AddPropertyFormData) => Promise<Result<Property, string>>;
  updateProperty: (id: string, updates: Partial<Property>) => Result<void, string>;
  deleteProperty: (id: string) => Result<void, string>;
  setPropertiesHidden: (ids: string[], hidden: boolean) => Result<void, string>;
  refetch: () => Promise<Result<void, string>>;
}

export const useProperties = (): UsePropertiesReturn => {
  const {
    properties,
    isLoading,
    fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    setPropertiesHidden,
  } = usePropertyManagementStore();

  const [error, setError] = useState<string | null>(null);

  // Fetch properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setError(null);
        await fetchProperties();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error loading properties:', error);
      }
    };

    loadProperties();
  }, [fetchProperties]); // We intentionally want to fetch only on mount

  const handleAddProperty = useCallback(
    async (propertyData: AddPropertyFormData): Promise<Result<Property, string>> => {
      try {
        setError(null);
        await addProperty(propertyData);
        return ok(propertyData as Property); // This would need to return the actual created property
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add property';
        setError(errorMessage);
        console.error('Error adding property:', error);
        return err(errorMessage);
      }
    },
    [addProperty]
  );

  const handleUpdateProperty = useCallback(
    (id: string, updates: Partial<Property>): Result<void, string> => {
      try {
        updateProperty(id, updates);
        return ok(undefined);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update property';
        setError(errorMessage);
        console.error('Error updating property:', error);
        return err(errorMessage);
      }
    },
    [updateProperty]
  );

  const handleDeleteProperty = useCallback(
    (id: string): Result<void, string> => {
      try {
        deleteProperty(id);
        return ok(undefined);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete property';
        setError(errorMessage);
        console.error('Error deleting property:', error);
        return err(errorMessage);
      }
    },
    [deleteProperty]
  );

  const handleSetPropertiesHidden = useCallback(
    (ids: string[], hidden: boolean): Result<void, string> => {
      try {
        setPropertiesHidden(ids, hidden);
        return ok(undefined);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set properties hidden';
        setError(errorMessage);
        console.error('Error setting properties hidden:', error);
        return err(errorMessage);
      }
    },
    [setPropertiesHidden]
  );

  const handleRefetch = useCallback(async (): Promise<Result<void, string>> => {
    try {
      setError(null);
      await fetchProperties();
      return ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refetch properties';
      setError(errorMessage);
      console.error('Error refetching properties:', error);
      return err(errorMessage);
    }
  }, [fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    addProperty: handleAddProperty,
    updateProperty: handleUpdateProperty,
    deleteProperty: handleDeleteProperty,
    setPropertiesHidden: handleSetPropertiesHidden,
    refetch: handleRefetch,
  };
};
