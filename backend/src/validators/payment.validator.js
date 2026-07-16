import { z } from 'zod';

export const initializePaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    method: z.enum(['CARD', 'WALLET', 'CASH']).default('CARD'),
  }),
});

export const releasePaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
  }),
});
