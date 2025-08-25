import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { Property } from "./schema";

export const propertyColumns: ColumnDef<Property>[] = [
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
    cell: ({ row }) => <div className="font-mono font-medium">#{row.original.apartmentNumber}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "location",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.location}>
        {row.original.location}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "rooms",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Комнаты" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="w-16 justify-center">
        {row.original.rooms}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "readinessStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Готовность" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={row.original.readinessStatus === "UNFURNISHED" 
        ? "text-red-600" 
        : ""
      }>
        {row.original.readinessStatus === "FURNISHED" ? "Меблированная" : "Немеблированная"}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "propertyType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Тип" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={row.original.propertyType === "FOR_RENT" 
        ? "bg-amber-50 hover:bg-amber-50" 
        : "bg-stone-200 hover:bg-stone-200"
      }>
        {row.original.propertyType === "FOR_RENT" ? "Аренда" : "Продажа"}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "occupancyStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className={row.original.occupancyStatus === "OCCUPIED" 
          ? "bg-orange-100 text-orange-800 hover:bg-orange-100" 
          : "bg-green-100 text-green-800 hover:bg-green-100"
        }
      >
        {row.original.occupancyStatus === "OCCUPIED" ? "Занята" : "Свободна"}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "urgentMatter",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Срочные Вопросы" />,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.urgentMatter}>
        {row.original.urgentMatter || "—"}
      </div>
    ),
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
