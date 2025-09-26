import type React from 'react';
import { Button } from '@/components/ui/button';
import { TENANT_DATABASE_CONSTANTS } from '../constants/tenant-database.constants';
import type { TenantStatsProps } from '../types/tenant-database.props';

export const TenantStats: React.FC<TenantStatsProps> = ({
  tenants,
  customStatusOptions = [],
  selectedStatus,
  onStatusFilter,
}) => {
  const getActiveTenants = () => tenants.filter((tenant) => tenant.status === 'current');
  const getPastTenants = () => tenants.filter((tenant) => tenant.status === 'past');
  const getFutureTenants = () => tenants.filter((tenant) => tenant.status === 'future');
  const getUpcomingTenants = () => tenants.filter((tenant) => tenant.status === 'upcoming');

  const getCustomStatusTenants = (statusValue: string) =>
    tenants.filter((tenant) => tenant.status === statusValue);

  const defaultStatuses = [
    {
      value: 'current',
      label: TENANT_DATABASE_CONSTANTS.MESSAGES.CURRENT,
      count: getActiveTenants().length,
      className: TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.CURRENT,
    },
    {
      value: 'upcoming',
      label: TENANT_DATABASE_CONSTANTS.MESSAGES.UPCOMING,
      count: getUpcomingTenants().length,
      className: TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.UPCOMING,
    },
    {
      value: 'future',
      label: TENANT_DATABASE_CONSTANTS.MESSAGES.FUTURE,
      count: getFutureTenants().length,
      className: TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.FUTURE,
    },
    {
      value: 'past',
      label: TENANT_DATABASE_CONSTANTS.MESSAGES.PAST,
      count: getPastTenants().length,
      className: TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.PAST,
    },
  ];

  const customStatuses = customStatusOptions.map((status) => ({
    value: status.value,
    label: status.label,
    count: getCustomStatusTenants(status.value).length,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  }));

  const allStatuses = [...defaultStatuses, ...customStatuses];

  return (
    <div className="flex items-center gap-2">
      {allStatuses.map((status) => (
        <Button
          key={status.value}
          variant={selectedStatus === status.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusFilter?.(status.value)}
          className={`${status.className} ${selectedStatus === status.value ? 'ring-2 ring-offset-2' : ''}`}
        >
          {status.count} {status.label}
        </Button>
      ))}
    </div>
  );
};
