import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').optional(),
    phone: z.string().min(10, 'Invalid phone number').optional(),
  }),
});

export const mechanicProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    yearsOfExperience: z.number().int().min(0).optional(),
    specialty: z.array(z.string()).optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});
