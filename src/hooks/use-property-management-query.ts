import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  usePropertiesQuery,
  useUpdatePropertyMutation,
} from './use-properties-query';
import {
  useCreateTenantMutation,
  useDeleteTenantMutation,
  useTenantsQuery,
  useUpdateTenantMutation,
} from './use-tenants-query';

export const usePropertyManagementQuery = () => {
  const propertiesQuery = usePropertiesQuery();
  const tenantsQuery = useTenantsQuery();

  const createPropertyMutation = useCreatePropertyMutation();
  const updatePropertyMutation = useUpdatePropertyMutation();
  const deletePropertyMutation = useDeletePropertyMutation();

  const createTenantMutation = useCreateTenantMutation();
  const updateTenantMutation = useUpdateTenantMutation();
  const deleteTenantMutation = useDeleteTenantMutation();

  return {
    // Data
    properties: propertiesQuery.data ?? [],
    tenants: tenantsQuery.data ?? [],

    // Loading states
    isLoading: propertiesQuery.isLoading || tenantsQuery.isLoading,
    isPropertiesLoading: propertiesQuery.isLoading,
    isTenantsLoading: tenantsQuery.isLoading,

    // Error states
    error: propertiesQuery.error || tenantsQuery.error,
    propertiesError: propertiesQuery.error,
    tenantsError: tenantsQuery.error,

    // Refetch functions
    refetchProperties: propertiesQuery.refetch,
    refetchTenants: tenantsQuery.refetch,
    refetch: () => {
      propertiesQuery.refetch();
      tenantsQuery.refetch();
    },

    // Mutations
    createProperty: createPropertyMutation.mutateAsync,
    updateProperty: updatePropertyMutation.mutateAsync,
    deleteProperty: deletePropertyMutation.mutateAsync,

    createTenant: createTenantMutation.mutateAsync,
    updateTenant: updateTenantMutation.mutateAsync,
    deleteTenant: deleteTenantMutation.mutateAsync,

    // Mutation states
    isCreatingProperty: createPropertyMutation.isPending,
    isUpdatingProperty: updatePropertyMutation.isPending,
    isDeletingProperty: deletePropertyMutation.isPending,

    isCreatingTenant: createTenantMutation.isPending,
    isUpdatingTenant: updateTenantMutation.isPending,
    isDeletingTenant: deleteTenantMutation.isPending,
  };
};
