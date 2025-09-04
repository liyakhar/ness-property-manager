import type {
  AddTenantFormData,
  Tenant,
} from '@/app/(main)/dashboard/property-management/_components/schema';

const API_BASE_URL = '/api';

export const tenantsApi = {
  // Get all tenants
  getTenants: async (): Promise<Tenant[]> => {
    const response = await fetch(`${API_BASE_URL}/tenants`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    return response.json();
  },

  // Get tenant by ID
  getTenant: async (id: string): Promise<Tenant> => {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }
    return response.json();
  },

  // Create new tenant
  createTenant: async (tenantData: AddTenantFormData): Promise<Tenant> => {
    const response = await fetch(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tenantData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create tenant');
    }

    return response.json();
  },

  // Update tenant
  updateTenant: async (id: string, updates: Partial<Tenant>): Promise<Tenant> => {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tenant');
    }

    return response.json();
  },

  // Delete tenant
  deleteTenant: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete tenant');
    }
  },
};
