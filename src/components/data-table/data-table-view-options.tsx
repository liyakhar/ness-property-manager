'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AddColumnDialog } from './add-column-dialog';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  onAddColumn?: (column: { id: string; header: string; type: string }) => void;
}

// Function to translate column IDs to Russian names
const getColumnDisplayName = (columnId: string): string => {
  const columnNames: Record<string, string> = {
    select: 'Выбор',
    name: 'Имя Арендатора',
    apartmentId: 'Квартира',
    status: 'Статус',
    entryDate: 'Дата Заезда',
    exitDate: 'Дата Выезда',
    notes: 'Заметки',
    createdAt: 'Создано',
    updatedAt: 'Обновлено',
    // Property columns
    apartmentNumber: 'Номер Квартиры',
    location: 'Расположение',
    rooms: 'Комнаты',
    readinessStatus: 'Готовность',
    propertyType: 'Тип',
    occupancyStatus: 'Статус',
    urgentMatter: 'Срочные Вопросы',
  };

  // If it's a custom column, try to extract a readable name from the ID
  if (!columnNames[columnId]) {
    // Convert camelCase or snake_case to readable text
    const readableName = columnId
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();

    return readableName;
  }

  return columnNames[columnId];
};

export function DataTableViewOptions<TData>({
  table,
  onAddColumn,
}: DataTableViewOptionsProps<TData>) {
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 />
            Колонки
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Показать колонки</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {getColumnDisplayName(column.id)}
                </DropdownMenuCheckboxItem>
              );
            })}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            onClick={() => setIsAddColumnDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить колонку
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onAddColumn && (
        <AddColumnDialog
          open={isAddColumnDialogOpen}
          onOpenChange={setIsAddColumnDialogOpen}
          onAddColumn={onAddColumn}
        />
      )}
    </>
  );
}
