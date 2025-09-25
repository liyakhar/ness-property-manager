import type {
  AddTenantFormData,
  Tenant,
} from '@/app/(main)/dashboard/property-management/_components/schema';
import { usePropertyManagementStore } from '@/stores/property-management';

export const useTenants = () => {
  const {
    tenants,
    properties,
    isLoading,
    fetchTenants,
    addTenant,
    updateTenant,
    deleteTenant,
    setTenantsHidden,
  } = usePropertyManagementStore();

  const handleAddTenant = async (tenantData: AddTenantFormData) => {
    try {
      await addTenant(tenantData);
    } catch (error) {
      console.error('Error adding tenant:', error);
      throw error;
    }
  };

  const handleUpdateTenant = (id: string, updates: Partial<Tenant>) => {
    updateTenant(id, updates);
  };

  const handleDeleteTenant = (id: string) => {
    deleteTenant(id);
  };

  const handleSetTenantsHidden = (ids: string[], hidden: boolean) => {
    setTenantsHidden(ids, hidden);
  };

  return {
    tenants,
    properties,
    isLoading,
    addTenant: handleAddTenant,
    updateTenant: handleUpdateTenant,
    deleteTenant: handleDeleteTenant,
    setTenantsHidden: handleSetTenantsHidden,
    refetch: fetchTenants,
  };
};
