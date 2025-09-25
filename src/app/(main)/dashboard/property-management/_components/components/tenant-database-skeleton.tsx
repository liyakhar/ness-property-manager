import { Users } from 'lucide-react';
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TENANT_DATABASE_CONSTANTS } from '../constants/tenant-database.constants';
import type { TenantDatabaseSkeletonProps } from '../types/tenant-database.props';

export const TenantDatabaseSkeleton: React.FC<TenantDatabaseSkeletonProps> = ({
  rowsCount = TENANT_DATABASE_CONSTANTS.UI.SKELETON_ROWS_COUNT,
}) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
            </div>
          </div>
          {/* Table rows skeleton */}
          <div className="space-y-2">
            {Array.from({ length: rowsCount }, (_, i) => (
              <div
                key={`tenant-skeleton-row-${Date.now()}-${i}`}
                className="flex items-center space-x-4"
              >
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          {/* Pagination skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
