import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    vin: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']).optional(),
    registrationNumber: z.string().min(1).optional(),
    vin: z.string().optional(),
  }),
});

export const vehicleIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
