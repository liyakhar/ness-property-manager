import { err, ok, type Result } from 'neverthrow';

import type {
  CreateCustomFieldData,
  CustomFieldDefinition,
  EntityType,
  UpdateCustomFieldData,
} from '@/types/custom-field.schema';

interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

class CustomFieldsApiClient {
  private baseUrl = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Result<T, ApiError>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/custom-fields${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return err({
          message: data.error || 'Request failed',
          code: `HTTP_${response.status}`,
          details: data.details,
        });
      }

      return ok(data);
    } catch (error) {
      return err({
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      });
    }
  }

  async getCustomFields(
    entityType?: EntityType
  ): Promise<Result<CustomFieldDefinition[], ApiError>> {
    const endpoint = entityType ? `?entityType=${entityType}` : '';
    return this.makeRequest<CustomFieldDefinition[]>(endpoint);
  }

  async createCustomField(
    data: CreateCustomFieldData
  ): Promise<Result<CustomFieldDefinition, ApiError>> {
    return this.makeRequest<CustomFieldDefinition>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomField(
    id: string,
    data: UpdateCustomFieldData
  ): Promise<Result<CustomFieldDefinition, ApiError>> {
    return this.makeRequest<CustomFieldDefinition>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomField(
    id: string,
    cleanupData = false
  ): Promise<Result<{ success: boolean }, ApiError>> {
    const endpoint = `/${id}${cleanupData ? '?cleanupData=true' : ''}`;
    return this.makeRequest<{ success: boolean }>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const customFieldsApiClient = new CustomFieldsApiClient();
