import { z } from "zod";

export const propertySchema = z.object({
  id: z.string(),
  apartmentNumber: z.number().min(1),
  location: z.string().min(1),
  rooms: z.number().min(1).max(10),
  readinessStatus: z.enum(["FURNISHED", "UNFURNISHED"]),
  urgentMatter: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  apartmentId: z.string(),
  entryDate: z.date(),
  exitDate: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const addTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  apartmentId: z.string().min(1, "Apartment is required"),
  entryDate: z.date({
    required_error: "Entry date is required",
  }),
  notes: z.string().optional(),
});

export const addPropertySchema = z.object({
  apartmentNumber: z.number().min(1, "Apartment number must be at least 1"),
  location: z.string().min(1, "Location is required"),
  rooms: z.number().min(1, "Number of rooms must be at least 1").max(10, "Number of rooms cannot exceed 10"),
  readinessStatus: z.enum(["FURNISHED", "UNFURNISHED"]),
  urgentMatter: z.string().optional(),
});

export type Property = z.infer<typeof propertySchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type AddTenantFormData = z.infer<typeof addTenantSchema>;
export type AddPropertyFormData = z.infer<typeof addPropertySchema>;
