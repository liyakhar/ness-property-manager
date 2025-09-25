import type {
  AddPropertyFormData,
  Property,
} from '@/app/(main)/dashboard/property-management/_components/schema';

const API_BASE_URL = '/api';

// Transform English enum values from API to Russian for UI
const transformPropertyFromApi = (property: Record<string, unknown>): Property =>
  ({
    ...property,
    readinessStatus: property.readinessStatus === 'furnished' ? 'меблированная' : 'немеблированная',
    propertyType: property.propertyType === 'rent' ? 'аренда' : 'продажа',
    occupancyStatus: property.occupancyStatus === 'occupied' ? 'занята' : 'свободна',
  }) as Property;

export const propertiesApi = {
  // Get all properties
  getProperties: async (): Promise<Property[]> => {
    const response = await fetch(`${API_BASE_URL}/properties`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    const properties = await response.json();
    return properties.map(transformPropertyFromApi);
  },

  // Get property by ID
  getProperty: async (id: string): Promise<Property> => {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    const property = await response.json();
    return transformPropertyFromApi(property);
  },

  // Create new property
  createProperty: async (propertyData: AddPropertyFormData): Promise<Property> => {
    // Transform Russian enum values to English for API
    const transformedData = {
      ...propertyData,
      readinessStatus:
        propertyData.readinessStatus === 'меблированная' ? 'furnished' : 'unfurnished',
      propertyType: propertyData.propertyType === 'аренда' ? 'rent' : 'sale',
      occupancyStatus: propertyData.occupancyStatus === 'занята' ? 'occupied' : 'available',
    };

    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create property');
    }

    const property = await response.json();
    return transformPropertyFromApi(property);
  },

  // Update property
  updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
    // Transform Russian enum values to English for API if they exist
    const transformedUpdates: any = { ...updates };
    if (updates.readinessStatus) {
      transformedUpdates.readinessStatus =
        updates.readinessStatus === 'меблированная' ? 'furnished' : 'unfurnished';
    }
    if (updates.propertyType) {
      transformedUpdates.propertyType = updates.propertyType === 'аренда' ? 'rent' : 'sale';
    }
    if (updates.occupancyStatus) {
      transformedUpdates.occupancyStatus =
        updates.occupancyStatus === 'занята' ? 'occupied' : 'available';
    }

    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedUpdates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update property');
    }

    const property = await response.json();
    return transformPropertyFromApi(property);
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
