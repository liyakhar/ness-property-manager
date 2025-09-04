import type { ColumnDef } from '@tanstack/react-table';
import { Image as ImageIcon } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import type { Property } from './schema';

export const propertyColumns: ColumnDef<Property>[] = [
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
    id: 'images',
    accessorKey: 'images',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Изображения" />,
    cell: ({ row }) => {
      const images = (row.original as Record<string, unknown>).images as string[] | undefined;
      return (
        <div className="flex items-center gap-1">
          {(images ?? []).slice(0, 3).map((src) => (
            <Avatar key={`img-${src}`} className="h-8 w-8">
              <AvatarImage src={src} alt="" />
              <AvatarFallback>
                <ImageIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
          {!images || images.length === 0 ? (
            <span className="text-muted-foreground text-xs">Нет</span>
          ) : images.length > 3 ? (
            <Badge variant="outline" className="text-[10px]">
              +{images.length - 3}
            </Badge>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'apartmentNumber',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира №" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        #{row.original.apartmentNumber}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.location}>
        {row.original.location}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'rooms',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Комнаты" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-16 justify-center">
        {row.original.rooms}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'readinessStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Готовность" />,
    cell: ({ row }) => (
      <span>
        {row.original.readinessStatus === 'меблированная' ? 'Меблированная' : 'Немеблированная'}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'propertyType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Тип" />,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.propertyType === 'аренда'
            ? 'bg-amber-50 hover:bg-amber-50'
            : 'bg-stone-200 hover:bg-stone-200'
        }
      >
        {row.original.propertyType === 'аренда' ? 'Аренда' : 'Продажа'}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'occupancyStatus',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.occupancyStatus === 'занята'
            ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
            : 'bg-green-100 text-green-800 hover:bg-green-100'
        }
      >
        {row.original.occupancyStatus === 'занята'
          ? row.original.propertyType === 'продажа'
            ? 'Продана'
            : 'Занята'
          : 'Свободна'}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'apartmentContents',
    header: ({ column }) => <DataTableColumnHeader column={column} title="В квартире есть" />,
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original.apartmentContents ? (
          <Badge variant="outline" className="bg-gray-100 text-xs text-gray-700 hover:bg-gray-100">
            {row.original.apartmentContents}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'urgentMatter',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Срочные Вопросы" />,
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        {row.original.urgentMatter ? (
          <Badge variant="outline" className="bg-blue-100 text-xs text-blue-700 hover:bg-blue-100">
            {row.original.urgentMatter}
          </Badge>
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
