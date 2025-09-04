'use client';

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import * as React from 'react';

import { EditableCell } from '@/app/(main)/dashboard/property-management/_components/editable-cell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { AddUpdateDialog } from './_components/add-update-dialog';

interface UpdateItem {
  id: string;
  name: string;
  update: string;
  date: Date;
}

const initialData: UpdateItem[] = [];

export default function UpdatesPage() {
  const [data, setData] = React.useState<UpdateItem[]>(initialData);

  React.useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/updates');
        if (!res.ok) return;
        const items: Array<{ id: string; author: string; content: string; date: string }> =
          await res.json();
        setData(
          items.map((u) => ({
            id: u.id,
            name: u.author,
            update: u.content,
            date: new Date(u.date),
          }))
        );
      } catch {}
    })();
  }, []);

  const handleAddUpdate = async (newUpdate: Omit<UpdateItem, 'id'>) => {
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newUpdate.name,
          content: newUpdate.update,
          date: newUpdate.date,
        }),
      });
      if (!res.ok) return;
      const created: { id: string; author: string; content: string; date: string } =
        await res.json();
      setData((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.author,
          update: created.content,
          date: new Date(created.date),
        },
      ]);
    } catch {}
  };

  const columns: ColumnDef<UpdateItem>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Имя',
        cell: ({ row }) => (
          <EditableCell
            value={row.original.name}
            type="text"
            onSave={(newValue: unknown) => {
              const value = String(newValue ?? '');
              setData((prev) =>
                prev.map((item) => (item.id === row.original.id ? { ...item, name: value } : item))
              );
              fetch(`/api/updates/${row.original.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: value }),
              }).catch(() => {});
            }}
          />
        ),
      },
      {
        accessorKey: 'update',
        header: 'Обновление',
        cell: ({ row }) => (
          <EditableCell
            value={row.original.update}
            type="textarea"
            onSave={(newValue: unknown) => {
              const value = String(newValue ?? '');
              setData((prev) =>
                prev.map((item) =>
                  item.id === row.original.id ? { ...item, update: value } : item
                )
              );
              fetch(`/api/updates/${row.original.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: value }),
              }).catch(() => {});
            }}
          />
        ),
      },
      {
        accessorKey: 'date',
        header: 'Дата',
        cell: ({ row }) => (
          <EditableCell
            value={row.original.date}
            type="date"
            onSave={(newValue: unknown) => {
              if (!(newValue instanceof Date)) return;
              setData((prev) =>
                prev.map((item) =>
                  item.id === row.original.id ? { ...item, date: newValue } : item
                )
              );
              fetch(`/api/updates/${row.original.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newValue }),
              }).catch(() => {});
            }}
          />
        ),
      },
    ],
    []
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Обновления</CardTitle>
          <AddUpdateDialog onAddUpdate={handleAddUpdate} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
