import type { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { usePropertyManagementStore } from '@/stores/property-management';

import type { Tenant } from './schema';

// Helper function to get status badge variant and text
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'current':
      return {
        variant: 'default' as const,
        text: 'Текущий',
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
      };
    case 'past':
      return {
        variant: 'secondary' as const,
        text: 'Прошлый',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      };
    case 'future':
      return {
        variant: 'outline' as const,
        text: 'Будущий',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      };
    case 'upcoming':
      return {
        variant: 'outline' as const,
        text: 'Скоро',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      };
    default:
      return {
        variant: 'secondary' as const,
        text: 'Неизвестно',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      };
  }
};

export const tenantColumns: ColumnDef<Tenant>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Выбрать все"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Выбрать строку"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Имя Арендатора" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'apartmentId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира №" />,
    cell: ({ row }) => {
      const { properties } = usePropertyManagementStore.getState();
      const property = properties.find((p) => p.id === row.original.apartmentId);
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            #{property?.apartmentNumber ?? 'Unknown'}
          </Badge>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: 'location',
    accessorFn: (row) => {
      const { properties } = usePropertyManagementStore.getState();
      const property = properties.find((p) => p.id === row.apartmentId);
      return property?.location ?? '';
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
    cell: ({ getValue }) => (
      <div className="text-muted-foreground text-sm">{(getValue() as string) || '-'}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
    cell: ({ row }) => {
      const statusDisplay = getStatusDisplay(row.original.status);
      return (
        <Badge variant={statusDisplay.variant} className={statusDisplay.className}>
          {statusDisplay.text}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'entryDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Заезда" />,
    cell: ({ row }) => (
      <div className="text-sm">{new Date(row.original.entryDate).toLocaleDateString()}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'exitDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Выезда" />,
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.exitDate ? (
          new Date(row.original.exitDate).toLocaleDateString()
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'receivePaymentDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Получение Платежа" />,
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.original.receivePaymentDate).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Заметки" />,
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original.notes ? (
          <div className="text-muted-foreground truncate text-sm" title={row.original.notes}>
            {row.original.notes}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Создано" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
];
