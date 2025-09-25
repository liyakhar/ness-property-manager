'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { Plus, Settings2, Trash2 } from 'lucide-react';
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
  onDeleteColumn?: (columnId: string) => void;
}

// Function to translate column IDs to Russian names
const getColumnDisplayName = (columnId: string): string => {
  const columnNames: Record<string, string> = {
    select: 'Выбор',
    name: 'Имя Арендатора',
    apartmentId: 'Квартира',
    location: 'Расположение',
    status: 'Статус',
    entryDate: 'Дата Заезда',
    exitDate: 'Дата Выезда',
    receivePaymentDate: 'Платеж за аренду',
    utilityPaymentDate: 'Платеж за счета',
    internetPaymentDate: 'Платеж за интернет',
    isPaid: 'Оплачено',
    notes: 'Заметки',
    createdAt: 'Создано',
    updatedAt: 'Обновлено',
    // Property columns
    apartmentNumber: 'Номер Квартиры',
    rooms: 'Комнаты',
    readinessStatus: 'Готовность',
    propertyType: 'Тип',
    occupancyStatus: 'Статус',
    urgentMatter: 'Срочные Вопросы',
    // Common custom column names
    test: 'Тест',
    paymentAttachment: 'Вложение Платежа',
    actions: 'Действия',
    // Additional mappings for column IDs that might be used
    'apartment-id': 'Квартира',
    'entry-date': 'Дата Заезда',
    'exit-date': 'Дата Выезда',
    'receive-payment-date': 'Платеж за аренду',
    'utility-payment-date': 'Платеж за счета',
    'internet-payment-date': 'Платеж за интернет',
    'is-paid': 'Оплачено',
    'created-at': 'Создано',
    'updated-at': 'Обновлено',
  };

  // If it's a custom column, try to extract a readable name from the ID
  if (!columnNames[columnId]) {
    // Common English to Russian translations for custom columns
    const commonTranslations: Record<string, string> = {
      'receive payment date': 'Дата Получения Платежа',
      'utility payment date': 'Дата Платежа за Счета',
      'internet payment date': 'Дата Платежа за Интернет',
      'is paid': 'Оплачено',
      'payment date': 'Дата Платежа',
      'entry date': 'Дата Заезда',
      'exit date': 'Дата Выезда',
      'apartment number': 'Номер Квартиры',
      'apartment id': 'ID Квартиры',
      'created at': 'Создано',
      'updated at': 'Обновлено',
      test: 'Тест',
      notes: 'Заметки',
      status: 'Статус',
      location: 'Расположение',
      name: 'Имя',
    };

    // Convert camelCase or snake_case to readable text
    const readableName = columnId
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim()
      .toLowerCase();

    // Check if we have a translation for this common pattern
    if (commonTranslations[readableName]) {
      return commonTranslations[readableName];
    }

    // Return the original readable name if no translation found
    return columnId
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return columnNames[columnId];
};

export function DataTableViewOptions<TData>({
  table,
  onAddColumn,
  onDeleteColumn,
}: DataTableViewOptionsProps<TData>) {
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  // Define default columns that cannot be deleted
  const defaultColumns = [
    'select',
    'name',
    'apartmentId',
    'status',
    'entryDate',
    'exitDate',
    'notes',
    'createdAt',
    'updatedAt',
    'apartmentNumber',
    'location',
    'rooms',
    'readinessStatus',
    'propertyType',
    'occupancyStatus',
    'urgentMatter',
  ];

  // Get all columns that can be hidden
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  // Separate custom columns from default columns
  const customColumns = hideableColumns.filter((column) => !defaultColumns.includes(column.id));
  const defaultHideableColumns = hideableColumns.filter((column) =>
    defaultColumns.includes(column.id)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 />
            Колонки
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Показать колонки</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Default columns */}
          {defaultHideableColumns.map((column) => {
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

          {/* Custom columns with delete option */}
          {customColumns.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Пользовательские колонки</DropdownMenuLabel>
              {customColumns.map((column) => {
                return (
                  <div key={column.id} className="flex items-center justify-between">
                    <DropdownMenuCheckboxItem
                      className="capitalize flex-1"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {getColumnDisplayName(column.id)}
                    </DropdownMenuCheckboxItem>
                    {onDeleteColumn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteColumn(column.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </>
          )}

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
