import type {
  AddPropertyFormData,
  Property,
} from '@/app/(main)/dashboard/property-management/_components/schema';

const API_BASE_URL = '/api';

export const propertiesApi = {
  // Get all properties
  getProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/properties`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  },

  // Get property by ID
  getProperty: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    return response.json();
  },

  // Create new property
  createProperty: async (propertyData: AddPropertyFormData): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties`, {
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

    return response.json();
  },

  // Update property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update property');
    }

    return response.json();
  },

  // Delete property
  deleteProperty: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete property');
    }
  },
};
