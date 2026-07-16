import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  createReviewSchema,
} from '../validators/booking.validator.js';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .post(authorize('USER'), validate(createBookingSchema), bookingController.createBooking)
  .get(bookingController.getMyBookings);

router.get('/:id', bookingController.getBooking);

router.patch(
  '/:id/status',
  authorize('MECHANIC', 'ADMIN'),
  validate(updateBookingStatusSchema),
  bookingController.updateStatus
);

router.post(
  '/:id/review',
  authorize('USER'),
  validate(createReviewSchema),
  bookingController.addReview
);

export default router;
