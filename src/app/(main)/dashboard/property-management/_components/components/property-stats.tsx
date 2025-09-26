import { Trash2 } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import type { PropertyStatsProps } from '../types/property-database.props';

export const PropertyStats: React.FC<PropertyStatsProps> = ({
  properties,
  customStatusOptions = [],
  selectedStatus,
  onStatusFilter,
  onDeleteStatus,
}) => {
  const getAvailableProperties = () =>
    properties.filter((property) => property.occupancyStatus === 'свободна');
  const getOccupiedProperties = () =>
    properties.filter((property) => property.occupancyStatus === 'занята');

  const getCustomStatusProperties = (statusValue: string) =>
    properties.filter((property) => property.occupancyStatus === statusValue);

  const defaultStatuses = [
    {
      value: 'свободна',
      label: 'Свободна',
      count: getAvailableProperties().length,
      className: 'bg-green-500/10 text-green-700 dark:text-green-300',
    },
    {
      value: 'занята',
      label: 'Занята',
      count: getOccupiedProperties().length,
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    },
  ];

  const customStatuses = customStatusOptions.map((status) => ({
    value: status.value,
    label: status.label,
    count: getCustomStatusProperties(status.value).length,
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  }));

  const allStatuses = [...defaultStatuses, ...customStatuses];

  return (
    <div className="flex items-center gap-2">
      {allStatuses.map((status) => {
        const isCustomStatus = customStatusOptions.some((opt) => opt.value === status.value);
        return (
          <div key={status.value} className="flex items-center gap-1 group">
            <Button
              variant={selectedStatus === status.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusFilter?.(status.value)}
              className={`${status.className} ${selectedStatus === status.value ? 'ring-2 ring-offset-2' : ''}`}
            >
              {status.count} {status.label}
            </Button>
            {isCustomStatus && onDeleteStatus && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => onDeleteStatus(status.value)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};
