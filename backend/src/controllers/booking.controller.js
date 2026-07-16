import * as bookingService from '../services/booking.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { booking },
  });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings },
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status
  );

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const review = await bookingService.addReview(req.params.id, req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { review },
  });
});
