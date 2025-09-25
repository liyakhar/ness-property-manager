import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { TENANT_DATABASE_CONSTANTS } from '../constants/tenant-database.constants';
import type { TenantStatsProps } from '../types/tenant-database.props';

export const TenantStats: React.FC<TenantStatsProps> = ({ tenants }) => {
  const getActiveTenants = () => tenants.filter((tenant) => tenant.status === 'current');
  const getPastTenants = () => tenants.filter((tenant) => tenant.status === 'past');
  const getFutureTenants = () => tenants.filter((tenant) => tenant.status === 'future');
  const getUpcomingTenants = () => tenants.filter((tenant) => tenant.status === 'upcoming');

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.CURRENT}>
        {getActiveTenants().length} {TENANT_DATABASE_CONSTANTS.MESSAGES.CURRENT}
      </Badge>
      <Badge variant="outline" className={TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.UPCOMING}>
        {getUpcomingTenants().length} {TENANT_DATABASE_CONSTANTS.MESSAGES.UPCOMING}
      </Badge>
      <Badge variant="outline" className={TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.FUTURE}>
        {getFutureTenants().length} {TENANT_DATABASE_CONSTANTS.MESSAGES.FUTURE}
      </Badge>
      <Badge variant="outline" className={TENANT_DATABASE_CONSTANTS.BADGE_VARIANTS.PAST}>
        {getPastTenants().length} {TENANT_DATABASE_CONSTANTS.MESSAGES.PAST}
      </Badge>
    </div>
  );
};
