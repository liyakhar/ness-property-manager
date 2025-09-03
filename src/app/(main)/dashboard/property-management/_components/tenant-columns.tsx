import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { EditableCell } from "./editable-cell";
import { PaymentAttachmentCell } from "./payment-attachment-cell";
import { Tenant } from "./schema";

export const createTenantColumns = (
  onUpdateTenant: (id: string, updates: Partial<Tenant>) => void,
  properties: any[],
  onDeleteTenant?: (id: string) => void,
): ColumnDef<Tenant>[] => {
  const persistUpdate = (id: string, updates: Partial<Tenant>) => {
    onUpdateTenant(id, updates);
    // Fire-and-forget API update to persist changes
    fetch(`/api/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const columns: ColumnDef<Tenant>[] = [
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
      cell: ({ row }) => (
        <EditableCell
          value={row.original.name}
          onSave={(value: unknown) => persistUpdate(row.original.id, { name: value as string })}
          type="text"
        />
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "apartmentId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Квартира №" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EditableCell
            value={row.original.apartmentId}
            onSave={(value: unknown) => persistUpdate(row.original.id, { apartmentId: value as string })}
            type="apartment"
            properties={properties}
          />
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "location",
      accessorFn: (row) => {
        const property = properties.find((p) => p.id === row.apartmentId);
        return property?.location ?? "";
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Расположение" />,
      cell: ({ getValue }) => <div className="text-muted-foreground text-sm">{(getValue() as string) || "-"}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Статус" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.status}
          onSave={(value: unknown) =>
            persistUpdate(row.original.id, { status: value as "current" | "past" | "future" | "upcoming" })
          }
          type="status"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "entryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Заезда" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.entryDate}
          onSave={(value: unknown) => persistUpdate(row.original.id, { entryDate: value as Date })}
          type="date"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "exitDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Дата Выезда" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.exitDate}
          onSave={(value: unknown) => persistUpdate(row.original.id, { exitDate: value as Date | undefined })}
          type="date"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "receivePaymentDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Платеж за аренду" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.receivePaymentDate}
          onSave={(value: unknown) => persistUpdate(row.original.id, { receivePaymentDate: value as Date })}
          type="date"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "utilityPaymentDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Платеж за счета" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.utilityPaymentDate}
          onSave={(value: unknown) => persistUpdate(row.original.id, { utilityPaymentDate: value as Date | undefined })}
          type="date"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "internetPaymentDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Платеж за интернет" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.internetPaymentDate}
          onSave={(value: unknown) =>
            persistUpdate(row.original.id, { internetPaymentDate: value as Date | undefined })
          }
          type="date"
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "isPaid",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Оплачено" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={row.original.isPaid}
            onCheckedChange={(checked) => persistUpdate(row.original.id, { isPaid: !!checked })}
          />
          <PaymentAttachmentCell
            value={row.original.paymentAttachment}
            onSave={(value: string | undefined) => persistUpdate(row.original.id, { paymentAttachment: value })}
          />
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "notes",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Заметки" />,
      cell: ({ row }) => (
        <EditableCell
          value={row.original.notes}
          onSave={(value: unknown) => onUpdateTenant(row.original.id, { notes: value as string | undefined })}
          type="textarea"
        />
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

  if (onDeleteTenant) {
    columns.push({
      id: "actions",
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
                <AlertDialogDescription>Действие необратимо. Запись будет удалена.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeleteTenant(row.original.id);
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

// Legacy export for backward compatibility
export const tenantColumns = createTenantColumns(
  () => {},
  [],
  () => {},
);
