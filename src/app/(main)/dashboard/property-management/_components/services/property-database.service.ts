import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Property } from '../schema';
import type { AddColumnData } from '../types/property-database.props';

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
}

export type ApiResult<T> = Result<T, ApiError>;

class PropertyDatabaseService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        return err({
          message: `HTTP Error: ${response.statusText}`,
          code: 'HTTP_ERROR',
          statusCode: response.status,
        });
      }

      const data = await response.json();
      return ok(data);
    } catch (error) {
      return err({
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      });
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<ApiResult<Property>> {
    return this.makeRequest<Property>(`${this.baseUrl}/api/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteProperty(id: string): Promise<ApiResult<boolean>> {
    const result = await this.makeRequest<{ success: boolean }>(
      `${this.baseUrl}/api/properties/${id}`,
      {
        method: 'DELETE',
      }
    );

    return result.map(() => true);
  }

  async addCustomColumnToProperties(
    properties: Property[],
    columnData: AddColumnData,
    updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  ): Promise<ApiResult<void>> {
    try {
      for (const property of properties) {
        // Get existing custom fields or initialize empty object
        const existingCustomFields =
          ((property as Record<string, unknown>).customFields as Record<string, unknown>) || {};

        // Only add the column if it doesn't already exist
        if (!(existingCustomFields as Record<string, unknown>)[columnData.id]) {
          let defaultValue: unknown;

          switch (columnData.type) {
            case 'text':
              defaultValue = '';
              break;
            case 'number':
              defaultValue = 0;
              break;
            case 'date':
              defaultValue = new Date();
              break;
            case 'select':
              defaultValue = 'option1';
              break;
            case 'boolean':
              defaultValue = false;
              break;
            default:
              defaultValue = '';
          }

          // Update the customFields with the new column
          const updatedCustomFields = {
            ...existingCustomFields,
            [columnData.id]: defaultValue,
          };

          await updateProperty(property.id, { customFields: updatedCustomFields });
        }
      }

      return ok(undefined);
    } catch (error) {
      return err({
        message: error instanceof Error ? error.message : 'Failed to add custom column',
        code: 'CUSTOM_COLUMN_ERROR',
      });
    }
  }

  async deleteCustomColumnFromProperties(
    properties: Property[],
    columnId: string,
    updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  ): Promise<ApiResult<void>> {
    try {
      for (const property of properties) {
        // Get existing custom fields
        const existingCustomFields =
          ((property as Record<string, unknown>).customFields as Record<string, unknown>) || {};

        // Only update if the column exists in custom fields
        if ((existingCustomFields as Record<string, unknown>)[columnId] !== undefined) {
          // Remove the column from custom fields
          const { [columnId]: _removed, ...updatedCustomFields } = existingCustomFields;

          await updateProperty(property.id, { customFields: updatedCustomFields });
        }
      }

      return ok(undefined);
    } catch (error) {
      return err({
        message: error instanceof Error ? error.message : 'Failed to delete custom column',
        code: 'DELETE_COLUMN_ERROR',
      });
    }
  }
}

export const propertyDatabaseService = new PropertyDatabaseService();
