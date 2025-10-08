import type { ColumnDef } from '@tanstack/react-table';
import type * as React from 'react';

import type { CustomFieldDefinition, CustomFieldType } from '@/types/custom-field.schema';
import { CUSTOM_FIELD_DEFAULT_VALUES, SELECT_OPTIONS } from '@/types/custom-field.schema';

// Generic function to create table columns from custom field definitions
export function createCustomFieldColumns<TData extends Record<string, unknown>>(
  customFields: CustomFieldDefinition[]
): ColumnDef<TData>[] {
  return customFields.map((field) => ({
    id: field.fieldId,
    accessorKey: field.fieldId,
    header: () => <div className="font-medium">{field.header}</div>,
    cell: ({ row }) => {
      const customFields = (row.original.customFields as Record<string, unknown>) || {};
      const value = customFields[field.fieldId];

      return renderCustomFieldValue(value, field.type);
    },
    enableSorting: true,
    enableHiding: true,
  }));
}

// Function to render custom field values based on their type
function renderCustomFieldValue(value: unknown, type: CustomFieldType): React.ReactNode {
  if (value === null || value === undefined) {
    return <div className="text-muted-foreground text-sm">-</div>;
  }

  switch (type) {
    case 'text':
      return <div className="text-sm">{String(value)}</div>;

    case 'number':
      return <div className="text-sm">{String(value)}</div>;

    case 'date':
      try {
        const date = new Date(value as string);
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      } catch {
        return <div className="text-muted-foreground text-sm">-</div>;
      }

    case 'select': {
      const selectOption = SELECT_OPTIONS.find((option) => option.value === value);
      return <div className="text-sm">{selectOption ? selectOption.label : String(value)}</div>;
    }

    case 'boolean':
      return <div className="text-sm">{value ? 'Да' : 'Нет'}</div>;

    default:
      return <div className="text-sm">{String(value)}</div>;
  }
}

// Function to get default value for a custom field type
export function getDefaultValueForType(type: CustomFieldType): unknown {
  return CUSTOM_FIELD_DEFAULT_VALUES[type];
}
