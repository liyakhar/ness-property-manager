import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableCell } from "./editable-cell";

import { Property } from "./schema";

export const createPropertyColumns = (
  updateProperty: (id: string, updates: Partial<Property>) => void
): ColumnDef<Property>[] => [
  {
    id: "select",
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
    accessorKey: "apartmentNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира №" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.apartmentNumber}
        onSave={(newValue: unknown) => {
          updateProperty(row.original.id, { apartmentNumber: newValue as number });
        }}
        type="number"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "location",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
    cell: ({ row, column }) => (
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
    accessorKey: "rooms",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Комнаты" />,
    cell: ({ row, column }) => (
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
    accessorKey: "readinessStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Готовность" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.readinessStatus}
        onSave={(newValue: unknown) => {
          updateProperty(row.original.id, { readinessStatus: newValue as "меблированная" | "немеблированная" });
        }}
        type="select"
        options={[
          { value: "меблированная", label: "Меблированная" },
          { value: "немеблированная", label: "Немеблированная" },
        ]}
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "propertyType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Тип" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.propertyType}
        onSave={(newValue: unknown) => {
          updateProperty(row.original.id, { propertyType: newValue as "аренда" | "продажа" });
        }}
        type="select"
        options={[
          { value: "аренда", label: "Аренда" },
          { value: "продажа", label: "Продажа" },
        ]}
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "occupancyStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.occupancyStatus}
        onSave={(newValue: unknown) => {
          updateProperty(row.original.id, { occupancyStatus: newValue as "занята" | "свободна" });
        }}
        type="select"
        options={[
          { value: "занята", label: "Занята" },
          { value: "свободна", label: "Свободна" },
        ]}
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "urgentMatter",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Срочные Вопросы" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.urgentMatter || ""}
        onSave={(newValue: unknown) => {
          updateProperty(row.original.id, { urgentMatter: newValue as string || undefined });
        }}
        type="textarea"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "urgentMatterResolved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус Решения" />,
    cell: ({ row }) => {
      const hasUrgentMatter = !!row.original.urgentMatter;
      const isResolved = row.original.urgentMatterResolved;
      
      if (!hasUrgentMatter) {
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Нет проблем</Badge>;
      }
      
      return (
        <div className="flex items-center gap-2">
          <Badge 
            variant={isResolved ? "outline" : "destructive"}
            className={isResolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {isResolved ? "Решено" : "Требует решения"}
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
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Создано" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</div>
    ),
    enableSorting: true,
  },
];

// Keep the old export for backward compatibility
export const propertyColumns = createPropertyColumns(() => {});
