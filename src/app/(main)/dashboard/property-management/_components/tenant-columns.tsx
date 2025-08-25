import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditableCell } from "./editable-cell";

import { mockProperties } from "./mock-data";
import { Tenant } from "./schema";

// Helper function to get status badge variant and text
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "current":
      return { variant: "default" as const, text: "Текущий", className: "bg-green-100 text-green-800 hover:bg-green-100" };
    case "past":
      return { variant: "secondary" as const, text: "Прошлый", className: "bg-gray-100 text-gray-800 hover:bg-green-100" };
    case "future":
      return { variant: "outline" as const, text: "Будущий", className: "bg-blue-100 text-blue-800 hover:bg-green-100" };
    case "upcoming":
      return { variant: "outline" as const, text: "Скоро", className: "bg-orange-100 text-orange-800 hover:bg-green-100" };
    default:
      return { variant: "secondary" as const, text: "Неизвестно", className: "bg-gray-100 text-gray-800 hover:bg-green-100" };
  }
};

export const createTenantColumns = (
  onUpdateTenant: (id: string, updates: Partial<Tenant>) => void,
  properties: any[]
): ColumnDef<Tenant>[] => [
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Имя Арендатора" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.name}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { name: value })}
        type="text"
      />
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "apartmentId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира" />,
    cell: ({ row, column }) => {
      const property = properties.find((p) => p.id === row.original.apartmentId);
      return (
        <div className="flex items-center gap-2">
          <EditableCell
            value={row.original.apartmentId}
            row={row}
            column={column}
            onSave={(value) => onUpdateTenant(row.original.id, { apartmentId: value })}
            type="apartment"
            properties={properties}
          />
          <span className="text-muted-foreground text-sm">
            {property?.location ? `(${property.location})` : ""}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.status}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { status: value })}
        type="status"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "entryDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Заезда" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.entryDate}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { entryDate: value })}
        type="date"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "exitDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Выезда" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.exitDate}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { exitDate: value })}
        type="date"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "receivePaymentDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Получение Платежа" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.receivePaymentDate}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { receivePaymentDate: value })}
        type="date"
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Заметки" />,
    cell: ({ row, column }) => (
      <EditableCell
        value={row.original.notes}
        row={row}
        column={column}
        onSave={(value) => onUpdateTenant(row.original.id, { notes: value })}
        type="textarea"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Создано" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
    enableSorting: true,
  },
];

// Legacy export for backward compatibility
export const tenantColumns = createTenantColumns(() => {}, []);
