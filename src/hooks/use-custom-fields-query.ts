import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customFieldsApiClient } from '@/lib/api/custom-fields';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateCustomFieldData,
  CustomFieldDefinition,
  EntityType,
  UpdateCustomFieldData,
} from '@/types/custom-field.schema';

export function useCustomFieldsQuery(entityType?: EntityType) {
  return useQuery({
    queryKey: queryKeys.customFields.list(entityType),
    queryFn: async () => {
      const result = await customFieldsApiClient.getCustomFields(entityType);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCustomFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomFieldData) => {
      const result = await customFieldsApiClient.createCustomField(data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: (newField) => {
      // Invalidate and refetch custom fields queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customFields.list(),
      });

      // Also invalidate the specific entity type query
      queryClient.invalidateQueries({
        queryKey: queryKeys.customFields.list(newField.entityType),
      });

      // Add the new field to the cache optimistically
      queryClient.setQueryData(
        queryKeys.customFields.list(newField.entityType),
        (oldData: CustomFieldDefinition[] | undefined) => {
          if (!oldData) return [newField];
          return [...oldData, newField];
        }
      );
    },
  });
}

export function useUpdateCustomFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomFieldData }) => {
      const result = await customFieldsApiClient.updateCustomField(id, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: (updatedField) => {
      // Invalidate and refetch custom fields queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customFields.list(),
      });

      // Also invalidate the specific entity type query
      queryClient.invalidateQueries({
        queryKey: queryKeys.customFields.list(updatedField.entityType),
      });

      // Update the field in the cache optimistically
      queryClient.setQueryData(
        queryKeys.customFields.list(updatedField.entityType),
        (oldData: CustomFieldDefinition[] | undefined) => {
          if (!oldData) return [updatedField];
          return oldData.map((field) => (field.id === updatedField.id ? updatedField : field));
        }
      );
    },
  });
}

export function useDeleteCustomFieldMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cleanupData = false }: { id: string; cleanupData?: boolean }) => {
      const result = await customFieldsApiClient.deleteCustomField(id, cleanupData);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return { id, cleanupData };
    },
    onSuccess: ({ id }) => {
      // Invalidate all custom fields queries since we don't know which entity type
      queryClient.invalidateQueries({
        queryKey: queryKeys.customFields.list(),
      });

      // Remove the field from all caches optimistically
      queryClient.setQueriesData(
        { queryKey: queryKeys.customFields.list() },
        (oldData: CustomFieldDefinition[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((field) => field.id !== id);
        }
      );
    },
  });
}
