import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Tenant } from '../schema';
import type { AddColumnData } from '../types/tenant-database.props';

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
}

export type ApiResult<T> = Result<T, ApiError>;

class TenantDatabaseService {
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

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<ApiResult<Tenant>> {
    return this.makeRequest<Tenant>(`${this.baseUrl}/api/tenants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
  }

  async deleteTenant(id: string): Promise<ApiResult<boolean>> {
    const result = await this.makeRequest<{ success: boolean }>(
      `${this.baseUrl}/api/tenants/${id}`,
      {
        method: 'DELETE',
      }
    );

    return result.map(() => true);
  }

  async addCustomColumnToTenants(
    tenants: Tenant[],
    columnData: AddColumnData,
    updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  ): Promise<ApiResult<void>> {
    try {
      for (const tenant of tenants) {
        if (!(tenant as Record<string, unknown>)[columnData.id]) {
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

          await updateTenant(tenant.id, { [columnData.id]: defaultValue });
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

  async deleteCustomColumnFromTenants(
    tenants: Tenant[],
    columnId: string,
    updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  ): Promise<ApiResult<void>> {
    try {
      for (const tenant of tenants) {
        if ((tenant as Record<string, unknown>)[columnId] !== undefined) {
          const updates = { [columnId]: undefined };
          await updateTenant(tenant.id, updates);
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

export const tenantDatabaseService = new TenantDatabaseService();
