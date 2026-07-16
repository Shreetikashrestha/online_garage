import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    mechanicId: z.string().min(1, 'Mechanic ID is required'),
    serviceId: z.string().min(1, 'Service ID is required'),
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    scheduledTime: z.string().datetime({ message: 'Must be a valid ISO 8601 datetime' }),
    userLatitude: z.number().min(-90).max(90),
    userLongitude: z.number().min(-180).max(180),
    notes: z.string().optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  }),
});

export const createReviewSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});
