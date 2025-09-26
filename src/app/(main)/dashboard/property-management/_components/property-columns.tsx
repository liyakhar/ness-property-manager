import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { EditableCell } from './editable-cell';
import { PropertyImagesCell } from './property-images-cell';
import type { Property } from './schema';

export const createPropertyColumns = (
  updateProperty: (id: string, updates: Partial<Property>) => void,
  onDeleteProperty?: (id: string) => void,
  onAddStatus?: (status: { value: string; label: string }) => void,
  onDeleteStatus?: (statusValue: string) => void,
  customStatusOptions?: { value: string; label: string }[]
): ColumnDef<Property>[] => {
  const columns: ColumnDef<Property>[] = [
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
      cell: ({ row }) => (
        <PropertyImagesCell
          value={(row.original as Record<string, unknown>).images as string[] | undefined}
          onSave={(value) => updateProperty(row.original.id, { images: value })}
          propertyId={row.original.id}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'apartmentNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира №" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.apartmentNumber}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { apartmentNumber: newValue as number });
          }}
          type="apartmentNumber"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.location}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { location: newValue as string });
          }}
          type="text"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'rooms',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Комнаты" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.rooms}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { rooms: newValue as number });
          }}
          type="number"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'readinessStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Готовность" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.readinessStatus}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, {
              readinessStatus: newValue as 'меблированная' | 'немеблированная',
            });
          }}
          type="readiness"
          options={[
            { value: 'меблированная', label: 'Меблированная' },
            { value: 'немеблированная', label: 'Немеблированная' },
          ]}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'propertyType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Тип" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.propertyType}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { propertyType: newValue as 'аренда' | 'продажа' });
          }}
          type="propertyType"
          options={[
            { value: 'аренда', label: 'Аренда' },
            { value: 'продажа', label: 'Продажа' },
          ]}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'occupancyStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.occupancyStatus}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { occupancyStatus: newValue as 'занята' | 'свободна' });
          }}
          type="occupancy"
          options={[
            { value: 'свободна', label: 'Свободна' },
            {
              value: 'занята',
              label: row.original.propertyType === 'продажа' ? 'Продана' : 'Занята',
            },
          ]}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.status || 'current'}
          onSave={(value: unknown) => {
            updateProperty(row.original.id, {
              status: value as 'current' | 'past' | 'future' | 'upcoming',
            });
          }}
          type="status"
          options={customStatusOptions}
          onAddStatus={onAddStatus}
          onDeleteStatus={onDeleteStatus}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'apartmentContents',
      header: ({ column }) => <DataTableColumnHeader column={column} title="В квартире есть" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.apartmentContents ?? ''}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, {
              apartmentContents: (newValue as string) || undefined,
            });
          }}
          type="textarea"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'urgentMatter',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Срочные Вопросы" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.urgentMatter ?? ''}
          onSave={(newValue: unknown) => {
            updateProperty(row.original.id, { urgentMatter: (newValue as string) || undefined });
          }}
          type="textarea"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'urgentMatterResolved',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Статус Решения" />,
      cell: ({ row }) => {
        const hasUrgentMatter = !!row.original.urgentMatter;
        const isResolved = row.original.urgentMatterResolved;

        if (!hasUrgentMatter) {
          return (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Нет проблем
            </Badge>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isResolved ? 'outline' : 'destructive'}
              className={isResolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {isResolved ? 'Решено' : 'Требует решения'}
            </Badge>
            {!isResolved && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateProperty(row.original.id, { urgentMatterResolved: true })}
                className="h-6 px-2 text-xs"
              >
                Решено
              </Button>
            )}
          </div>
        );
      },
      enableSorting: true,
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

  if (onDeleteProperty) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-right">Действия</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                <AlertDialogDescription>
                  Действие необратимо. Запись будет удалена.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeleteProperty(row.original.id);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return columns;
};

// Keep the old export for backward compatibility
export const propertyColumns = createPropertyColumns(
  () => {},
  () => {}
);
