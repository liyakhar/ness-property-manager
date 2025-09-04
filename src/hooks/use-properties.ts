import { useEffect } from 'react';
import type {
  AddPropertyFormData,
  Property,
} from '@/app/(main)/dashboard/property-management/_components/schema';
import { usePropertyManagementStore } from '@/stores/property-management';

export const useProperties = () => {
  const {
    properties,
    isLoading,
    fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    setPropertiesHidden,
  } = usePropertyManagementStore();

  // Fetch properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        await fetchProperties();
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    };

    loadProperties();
  }, [fetchProperties]);

  const handleAddProperty = async (propertyData: AddPropertyFormData) => {
    try {
      await addProperty(propertyData);
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const handleUpdateProperty = (id: string, updates: Partial<Property>) => {
    updateProperty(id, updates);
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
  };

  const handleSetPropertiesHidden = (ids: string[], hidden: boolean) => {
    setPropertiesHidden(ids, hidden);
  };

  return {
    properties,
    isLoading,
    addProperty: handleAddProperty,
    updateProperty: handleUpdateProperty,
    deleteProperty: handleDeleteProperty,
    setPropertiesHidden: handleSetPropertiesHidden,
    refetch: fetchProperties,
  };
};
