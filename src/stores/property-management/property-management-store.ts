import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type {
  AddPropertyFormData,
  AddTenantFormData,
  Property,
  Tenant,
} from '@/app/(main)/dashboard/property-management/_components/schema';

// Type for raw API response where dates are strings
type TenantApiResponse = {
  id: string;
  name: string;
  apartmentId: string;
  entryDate: string;
  exitDate: string | null;
  status: 'current' | 'past' | 'future' | 'upcoming';
  notes?: string;
  receivePaymentDate: string;
  utilityPaymentDate: string | null;
  internetPaymentDate: string | null;
  isPaid: boolean;
  paymentAttachment?: string;
  hidden?: boolean;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

interface PropertyManagementState {
  // Data
  properties: Property[];
  tenants: Tenant[];

  // UI State
  selectedProperty: string | null;
  selectedTenant: string | null;
  isAddPropertyDialogOpen: boolean;
  isAddTenantDialogOpen: boolean;
  isLoading: boolean;

  // Actions
  setProperties: (properties: Property[]) => void;
  setTenants: (tenants: Tenant[]) => void;
  fetchProperties: () => Promise<void>;
  fetchTenants: () => Promise<void>;
  addProperty: (property: AddPropertyFormData) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setPropertiesHidden: (ids: string[], hidden: boolean) => void;
  addTenant: (tenant: AddTenantFormData) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  setTenantsHidden: (ids: string[], hidden: boolean) => void;

  // UI Actions
  setSelectedProperty: (id: string | null) => void;
  setSelectedTenant: (id: string | null) => void;
  setAddPropertyDialogOpen: (open: boolean) => void;
  setAddTenantDialogOpen: (open: boolean) => void;

  // Computed
  getPropertyById: (id: string) => Property | undefined;
  getTenantById: (id: string) => Tenant | undefined;
  getTenantsByProperty: (propertyId: string) => Tenant[];
  getVacantProperties: () => Property[];
  getOccupiedProperties: () => Property[];
  getActiveTenants: () => Tenant[];
}

export const usePropertyManagementStore = create<PropertyManagementState>()(
  devtools(
    (set, get) => ({
      // Initial State (empty for production use)
      properties: [],
      tenants: [],
      selectedProperty: null,
      selectedTenant: null,
      isAddPropertyDialogOpen: false,
      isAddTenantDialogOpen: false,
      isLoading: false,

      // Actions
      setProperties: (properties) => set({ properties }),
      setTenants: (tenants) => set({ tenants }),

      fetchProperties: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/properties');
          if (!response.ok) {
            throw new Error('Failed to fetch properties');
          }
          const properties = await response.json();
          set({ properties, isLoading: false });
        } catch (error) {
          console.error('Error fetching properties:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      fetchTenants: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/tenants');
          if (!response.ok) {
            throw new Error('Failed to fetch tenants');
          }
          const tenants: TenantApiResponse[] = await response.json();

          // Convert date strings to Date objects
          const processedTenants: Tenant[] = tenants.map((tenant) => ({
            id: tenant.id,
            name: tenant.name,
            apartmentId: tenant.apartmentId,
            status: tenant.status,
            isPaid: tenant.isPaid,
            notes: tenant.notes,
            paymentAttachment: tenant.paymentAttachment,
            hidden: tenant.hidden,
            customFields: tenant.customFields,
            entryDate: tenant.entryDate ? new Date(tenant.entryDate) : new Date(),
            exitDate: tenant.exitDate ? new Date(tenant.exitDate) : undefined,
            receivePaymentDate: tenant.receivePaymentDate
              ? new Date(tenant.receivePaymentDate)
              : new Date(),
            utilityPaymentDate: tenant.utilityPaymentDate
              ? new Date(tenant.utilityPaymentDate)
              : undefined,
            internetPaymentDate: tenant.internetPaymentDate
              ? new Date(tenant.internetPaymentDate)
              : undefined,
            createdAt: tenant.createdAt ? new Date(tenant.createdAt) : new Date(),
            updatedAt: tenant.updatedAt ? new Date(tenant.updatedAt) : new Date(),
          }));

          set({ tenants: processedTenants, isLoading: false });
        } catch (error) {
          console.error('Error fetching tenants:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      addProperty: async (propertyData) => {
        try {
          const response = await fetch('/api/properties', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create property');
          }

          const newProperty = await response.json();

          set((state) => ({
            properties: [...state.properties, newProperty],
          }));
        } catch (error) {
          console.error('Error creating property:', error);
          throw error;
        }
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((prop) =>
            prop.id === id ? { ...prop, ...updates, updatedAt: new Date() } : prop
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((prop) => prop.id !== id),
          tenants: state.tenants.filter((tenant) => tenant.apartmentId !== id),
        }));
      },

      setPropertiesHidden: (ids, hidden) => {
        set((state) => ({
          properties: state.properties.map((prop) =>
            ids.includes(prop.id) ? { ...prop, hidden, updatedAt: new Date() } : prop
          ),
        }));
      },

      addTenant: async (tenantData) => {
        try {
          const response = await fetch('/api/tenants', {
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

          const newTenant: TenantApiResponse = await response.json();

          // Convert date strings to Date objects for the new tenant
          const processedTenant: Tenant = {
            id: newTenant.id,
            name: newTenant.name,
            apartmentId: newTenant.apartmentId,
            status: newTenant.status,
            isPaid: newTenant.isPaid,
            notes: newTenant.notes,
            paymentAttachment: newTenant.paymentAttachment,
            hidden: newTenant.hidden,
            customFields: newTenant.customFields,
            entryDate: newTenant.entryDate ? new Date(newTenant.entryDate) : new Date(),
            exitDate: newTenant.exitDate ? new Date(newTenant.exitDate) : undefined,
            receivePaymentDate: newTenant.receivePaymentDate
              ? new Date(newTenant.receivePaymentDate)
              : new Date(),
            utilityPaymentDate: newTenant.utilityPaymentDate
              ? new Date(newTenant.utilityPaymentDate)
              : undefined,
            internetPaymentDate: newTenant.internetPaymentDate
              ? new Date(newTenant.internetPaymentDate)
              : undefined,
            createdAt: newTenant.createdAt ? new Date(newTenant.createdAt) : new Date(),
            updatedAt: newTenant.updatedAt ? new Date(newTenant.updatedAt) : new Date(),
          };

          set((state) => ({
            tenants: [...state.tenants, processedTenant],
          }));
        } catch (error) {
          console.error('Error creating tenant:', error);
          throw error;
        }
      },

      updateTenant: (id, updates) => {
        set((state) => ({
          tenants: state.tenants.map((tenant) =>
            tenant.id === id ? { ...tenant, ...updates, updatedAt: new Date() } : tenant
          ),
        }));
      },

      deleteTenant: (id) => {
        set((state) => ({
          tenants: state.tenants.filter((tenant) => tenant.id !== id),
        }));
      },

      setTenantsHidden: (ids, hidden) => {
        set((state) => ({
          tenants: state.tenants.map((tenant) =>
            ids.includes(tenant.id) ? { ...tenant, hidden, updatedAt: new Date() } : tenant
          ),
        }));
      },

      // UI Actions
      setSelectedProperty: (id) => set({ selectedProperty: id }),
      setSelectedTenant: (id) => set({ selectedTenant: id }),
      setAddPropertyDialogOpen: (open) => set({ isAddPropertyDialogOpen: open }),
      setAddTenantDialogOpen: (open) => set({ isAddTenantDialogOpen: open }),

      // Computed
      getPropertyById: (id) => get().properties.find((prop) => prop.id === id),
      getTenantById: (id) => get().tenants.find((tenant) => tenant.id === id),

      getTenantsByProperty: (propertyId) =>
        get().tenants.filter((tenant) => tenant.apartmentId === propertyId),

      getVacantProperties: () => {
        const state = get();
        return state.properties.filter((prop) => prop.occupancyStatus === 'свободна');
      },

      getOccupiedProperties: () => {
        const state = get();
        return state.properties.filter((prop) => prop.occupancyStatus === 'занята');
      },

      getActiveTenants: () => get().tenants.filter((tenant) => tenant.status === 'current'),
    }),
    {
      name: 'property-management-store',
    }
  )
);
