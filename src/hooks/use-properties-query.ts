import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Property } from '@/app/(main)/dashboard/property-management/_components/schema';
import { propertiesApi } from '@/lib/api/properties';
import { queryKeys } from '@/lib/query-keys';

export const usePropertiesQuery = () => {
  return useQuery({
    queryKey: queryKeys.properties.lists(),
    queryFn: propertiesApi.getProperties,
  });
};

export const usePropertyQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesApi.getProperty(id),
    enabled: !!id,
  });
};

export const useCreatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: propertiesApi.createProperty,
    onSuccess: (newProperty) => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });

      // Add the new property to the cache
      queryClient.setQueryData(queryKeys.properties.detail(newProperty.id), newProperty);
    },
  });
};

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Property> }) =>
      propertiesApi.updateProperty(id, updates),
    onSuccess: (updatedProperty) => {
      // Update the specific property in cache
      queryClient.setQueryData(queryKeys.properties.detail(updatedProperty.id), updatedProperty);

      // Update the property in the list cache
      queryClient.setQueryData(queryKeys.properties.lists(), (oldData: Property[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((property) =>
          property.id === updatedProperty.id ? updatedProperty : property
        );
      });
    },
  });
};

export const useDeletePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: propertiesApi.deleteProperty,
    onSuccess: (_, deletedId) => {
      // Remove from list cache
      queryClient.setQueryData(queryKeys.properties.lists(), (oldData: Property[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((property) => property.id !== deletedId);
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.properties.detail(deletedId) });
    },
  });
};
