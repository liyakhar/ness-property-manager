import { z } from 'zod';

export const propertySchema = z
  .object({
    id: z.string(),
    apartmentNumber: z.number().min(1),
    location: z.string().min(1),
    rooms: z.number().min(1).max(10),
    readinessStatus: z.enum(['меблированная', 'немеблированная']),
    propertyType: z.enum(['аренда', 'продажа']),
    occupancyStatus: z.enum(['занята', 'свободна']),
    images: z.array(z.string()).optional(),
    apartmentContents: z.string().optional(),
    urgentMatter: z.string().optional(),
    urgentMatterResolved: z.boolean().default(false),
    hidden: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .passthrough(); // Allow additional properties for custom fields

export const tenantSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    apartmentId: z.string(),
    entryDate: z.date(),
    exitDate: z.date().optional(),
    notes: z.string().optional(),
    status: z.enum(['current', 'past', 'future', 'upcoming']),
    receivePaymentDate: z.date(),
    utilityPaymentDate: z.date().optional(),
    internetPaymentDate: z.date().optional(),
    isPaid: z.boolean().default(false),
    paymentAttachment: z.string().optional(),
    hidden: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .passthrough(); // Allow additional properties for custom fields

export const addTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apartmentId: z.string().min(1, 'Apartment is required'),
  entryDate: z.date({
    required_error: 'Entry date is required',
  }),
  status: z.enum(['current', 'past', 'future', 'upcoming']).default('current'),
  notes: z.string().optional(),
  receivePaymentDate: z.date().default(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }),
  utilityPaymentDate: z.date().optional(),
  internetPaymentDate: z.date().optional(),
  isPaid: z.boolean().default(false),
  paymentAttachment: z.string().optional(),
});

export const addPropertySchema = z.object({
  apartmentNumber: z.number().min(1, 'Apartment number must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  rooms: z
    .number()
    .min(1, 'Number of rooms must be at least 1')
    .max(10, 'Number of rooms cannot exceed 10'),
  readinessStatus: z.enum(['меблированная', 'немеблированная']),
  propertyType: z.enum(['аренда', 'продажа']),
  occupancyStatus: z.enum(['занята', 'свободна']),
  apartmentContents: z.string().optional(),
  urgentMatter: z.string().optional(),
  urgentMatterResolved: z.boolean().default(false),
});

export type Property = z.infer<typeof propertySchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type AddTenantFormData = z.infer<typeof addTenantSchema>;
export type AddPropertyFormData = z.infer<typeof addPropertySchema>;
