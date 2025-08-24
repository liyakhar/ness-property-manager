"use client";

import * as React from "react";

import { Plus, Users, Building2 } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { usePropertyManagementStore } from "@/stores/property-management";

import { AddTenantDialog } from "./add-tenant-dialog";
import type { AddTenantFormData } from "./schema";
import { tenantColumns } from "./tenant-columns";

export function TenantDatabase() {
  const {
    tenants: data,
    properties: mockProperties,
    addTenant,
    isAddTenantDialogOpen,
    setAddTenantDialogOpen,
  } = usePropertyManagementStore();

  const table = useDataTableInstance({
    data,
    columns: tenantColumns,
    getRowId: (row) => row.id,
  });

  const handleAddTenant = (newTenant: AddTenantFormData) => {
    addTenant(newTenant);
    setAddTenantDialogOpen(false);
  };

  const getActiveTenants = () => data.filter((tenant) => !tenant.exitDate);
  const getVacantProperties = () => {
    const occupiedPropertyIds = data.filter((tenant) => !tenant.exitDate).map((tenant) => tenant.apartmentId);
    return mockProperties.filter((property) => !occupiedPropertyIds.includes(property.id));
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-muted-foreground text-xs">{getActiveTenants().length} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Properties</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveTenants().length}</div>
            <p className="text-muted-foreground text-xs">of {mockProperties.length} total properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Properties</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVacantProperties().length}</div>
            <p className="text-muted-foreground text-xs">Available for new tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tenant Database
          </CardTitle>
          <CardDescription>Manage all tenant records and their property assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  {getActiveTenants().length} Active
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {data.filter((t) => t.exitDate).length} Inactive
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button onClick={() => setAddTenantDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={tenantColumns} />
          </div>

          <DataTablePagination table={table} />
        </CardContent>
      </Card>

      <AddTenantDialog
        open={isAddTenantDialogOpen}
        onOpenChange={setAddTenantDialogOpen}
        onAddTenant={handleAddTenant}
        properties={mockProperties}
      />
    </div>
  );
}
