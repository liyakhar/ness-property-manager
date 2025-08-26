import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { mockProperties, mockTenants } from "@/app/(main)/dashboard/property-management/_components/mock-data";
import {
  Property,
  Tenant,
  AddPropertyFormData,
  AddTenantFormData,
} from "@/app/(main)/dashboard/property-management/_components/schema";

interface PropertyManagementState {
  // Data
  properties: Property[];
  tenants: Tenant[];

  // UI State
  selectedProperty: string | null;
  selectedTenant: string | null;
  isAddPropertyDialogOpen: boolean;
  isAddTenantDialogOpen: boolean;

  // Actions
  setProperties: (properties: Property[]) => void;
  setTenants: (tenants: Tenant[]) => void;
  addProperty: (property: AddPropertyFormData) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setPropertiesHidden: (ids: string[], hidden: boolean) => void;
  addTenant: (tenant: AddTenantFormData) => void;
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
      // Initial State
      properties: mockProperties,
      tenants: mockTenants,
      selectedProperty: null,
      selectedTenant: null,
      isAddPropertyDialogOpen: false,
      isAddTenantDialogOpen: false,

      // Actions
      setProperties: (properties) => set({ properties }),
      setTenants: (tenants) => set({ tenants }),

      addProperty: (propertyData) => {
        const newProperty: Property = {
          id: `prop-${Date.now()}`,
          ...propertyData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          properties: [...state.properties, newProperty],
        }));
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((prop) =>
            prop.id === id ? { ...prop, ...updates, updatedAt: new Date() } : prop,
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
            ids.includes(prop.id) ? { ...prop, hidden, updatedAt: new Date() } : prop,
          ),
        }));
      },

      addTenant: (tenantData) => {
        const newTenant: Tenant = {
          id: `tenant-${Date.now()}`,
          ...tenantData,
          status: "current", // Default status for new tenants
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tenants: [...state.tenants, newTenant],
        }));
      },

      updateTenant: (id, updates) => {
        set((state) => ({
          tenants: state.tenants.map((tenant) =>
            tenant.id === id ? { ...tenant, ...updates, updatedAt: new Date() } : tenant,
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
            ids.includes(tenant.id) ? { ...tenant, hidden, updatedAt: new Date() } : tenant,
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

      getTenantsByProperty: (propertyId) => get().tenants.filter((tenant) => tenant.apartmentId === propertyId),

      getVacantProperties: () => {
        const state = get();
        return state.properties.filter((prop) => prop.occupancyStatus === "свободна");
      },

      getOccupiedProperties: () => {
        const state = get();
        return state.properties.filter((prop) => prop.occupancyStatus === "занята");
      },

      getActiveTenants: () => get().tenants.filter((tenant) => tenant.status === "current"),
    }),
    {
      name: "property-management-store",
    },
  ),
);
