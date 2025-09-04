import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tenant } from '@/app/(main)/dashboard/property-management/_components/schema';
import { tenantsApi } from '@/lib/api/tenants';
import { queryKeys } from '@/lib/query-keys';

export const useTenantsQuery = () => {
  return useQuery({
    queryKey: queryKeys.tenants.lists(),
    queryFn: tenantsApi.getTenants,
  });
};

export const useTenantQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => tenantsApi.getTenant(id),
    enabled: !!id,
  });
};

export const useCreateTenantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantsApi.createTenant,
    onSuccess: (newTenant) => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.lists() });

      // Add the new tenant to the cache
      queryClient.setQueryData(queryKeys.tenants.detail(newTenant.id), newTenant);
    },
  });
};

export const useUpdateTenantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tenant> }) =>
      tenantsApi.updateTenant(id, updates),
    onSuccess: (updatedTenant) => {
      // Update the specific tenant in cache
      queryClient.setQueryData(queryKeys.tenants.detail(updatedTenant.id), updatedTenant);

      // Update the tenant in the list cache
      queryClient.setQueryData(queryKeys.tenants.lists(), (oldData: Tenant[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((tenant) => (tenant.id === updatedTenant.id ? updatedTenant : tenant));
      });
    },
  });
};

export const useDeleteTenantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantsApi.deleteTenant,
    onSuccess: (_, deletedId) => {
      // Remove from list cache
      queryClient.setQueryData(queryKeys.tenants.lists(), (oldData: Tenant[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((tenant) => tenant.id !== deletedId);
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.tenants.detail(deletedId) });
    },
  });
};
