import { z } from 'zod';

// Enums matching Prisma schema
export const EntityType = {
  PROPERTY: 'PROPERTY',
  TENANT: 'TENANT',
} as const;

export const CustomFieldType = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  BOOLEAN: 'boolean',
} as const;

// Zod schemas
export const entityTypeSchema = z.enum([EntityType.PROPERTY, EntityType.TENANT]);

export const customFieldTypeSchema = z.enum([
  CustomFieldType.TEXT,
  CustomFieldType.NUMBER,
  CustomFieldType.DATE,
  CustomFieldType.SELECT,
  CustomFieldType.BOOLEAN,
]);

export const createCustomFieldSchema = z.object({
  fieldId: z
    .string()
    .min(1, 'Field ID is required')
    .max(50, 'Field ID must be less than 50 characters'),
  header: z
    .string()
    .min(1, 'Header is required')
    .max(100, 'Header must be less than 100 characters'),
  type: customFieldTypeSchema,
  entityType: entityTypeSchema,
  order: z.number().int().min(0).default(0),
});

export const updateCustomFieldSchema = z.object({
  header: z
    .string()
    .min(1, 'Header is required')
    .max(100, 'Header must be less than 100 characters')
    .optional(),
  type: customFieldTypeSchema.optional(),
  order: z.number().int().min(0).optional(),
});

export const customFieldDefinitionSchema = z.object({
  id: z.string(),
  fieldId: z.string(),
  header: z.string(),
  type: customFieldTypeSchema,
  entityType: entityTypeSchema,
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// TypeScript types
export type EntityType = z.infer<typeof entityTypeSchema>;
export type CustomFieldType = z.infer<typeof customFieldTypeSchema>;
export type CreateCustomFieldData = z.infer<typeof createCustomFieldSchema>;
export type UpdateCustomFieldData = z.infer<typeof updateCustomFieldSchema>;
export type CustomFieldDefinition = z.infer<typeof customFieldDefinitionSchema>;

// Default values for custom field types
export const CUSTOM_FIELD_DEFAULT_VALUES = {
  [CustomFieldType.TEXT]: '',
  [CustomFieldType.NUMBER]: 0,
  [CustomFieldType.DATE]: new Date(),
  [CustomFieldType.SELECT]: 'option1',
  [CustomFieldType.BOOLEAN]: false,
} as const;

// Select options for dropdown fields
export const SELECT_OPTIONS = [
  { value: 'option1', label: 'Опция 1' },
  { value: 'option2', label: 'Опция 2' },
  { value: 'option3', label: 'Опция 3' },
] as const;
