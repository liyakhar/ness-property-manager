import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { mockProperties } from "./mock-data";
import { Tenant } from "./schema";

export const tenantColumns: ColumnDef<Tenant>[] = [
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
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "apartmentId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира" />,
    cell: ({ row }) => {
      const property = mockProperties.find((p) => p.id === row.original.apartmentId);
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            #{property?.apartmentNumber ?? "Unknown"}
          </Badge>
          <span className="text-muted-foreground text-sm">{property?.location ?? "Неизвестно"}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "entryDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Заезда" />,
    cell: ({ row }) => <div className="text-sm">{new Date(row.original.entryDate).toLocaleDateString()}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "exitDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Выезда" />,
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.exitDate ? (
          new Date(row.original.exitDate).toLocaleDateString()
        ) : (
          <Badge variant="secondary">Активный</Badge>
        )}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "notes",
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
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Создано" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</div>
    ),
    enableSorting: true,
  },
];
