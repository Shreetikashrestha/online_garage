import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import * as pricingService from './pricing.service.js';

export const createBooking = async (userId, data) => {
  const { mechanicId, serviceId, vehicleId, scheduledTime, userLatitude, userLongitude, notes } = data;

  const mechanic = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicId },
  });

  if (!mechanic || !mechanic.isAvailable) {
    throw new ApiError(400, 'Mechanic is currently unavailable');
  }

  const estimate = await pricingService.calculateEstimate(serviceId, mechanicId, userLatitude, userLongitude);

  const booking = await prisma.booking.create({
    data: {
      userId,
      mechanicId,
      serviceId,
      vehicleId,
      scheduledTime: new Date(scheduledTime),
      userLatitude,
      userLongitude,
      notes,
      estimatedTotal: estimate.estimatedTotal,
      priceLockedAt: new Date(),
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: booking.id,
      status: 'PENDING',
      changedBy: userId,
    },
  });

  return booking;
};

export const getBookingById = async (id, userId, role) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phone: true } },
      mechanic: { select: { name: true, phone: true } },
      service: true,
      vehicle: true,
      statusHistory: { orderBy: { changedAt: 'asc' } },
    },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (role !== 'ADMIN' && booking.userId !== userId && booking.mechanicId !== userId) {
    throw new ApiError(403, 'You do not have permission to access this booking');
  }

  return booking;
};

export const getUserBookings = async (userId, role) => {
  const where = role === 'MECHANIC' ? { mechanicId: userId } : { userId };
  const include = {
    service: { select: { name: true, basePrice: true } },
    vehicle: { select: { make: true, model: true, registrationNumber: true } },
    payment: true,
    review: { select: { id: true, rating: true } },
  };
  if (role === 'MECHANIC') include.user = { select: { name: true, phone: true } };
  if (role === 'USER') include.mechanic = { select: { name: true, phone: true } };

  return prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' }, include });
};

export const updateBookingStatus = async (id, userId, role, status) => {
  const booking = await getBookingById(id, userId, role);

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: id,
      status,
      changedBy: userId,
    },
  });

  return updatedBooking;
};

export const addReview = async (bookingId, userId, data) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.userId !== userId) throw new ApiError(403, 'Unauthorized');
  if (booking.status !== 'COMPLETED') throw new ApiError(400, 'Can only review completed bookings');

  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) throw new ApiError(400, 'Review already exists for this booking');

  const review = await prisma.review.create({
    data: {
      bookingId,
      reviewerId: userId,
      revieweeId: booking.mechanicId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  updateMechanicRating(booking.mechanicId);

  return review;
};

const updateMechanicRating = async (mechanicId) => {
  const reviews = await prisma.review.aggregate({
    where: { revieweeId: mechanicId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.mechanicProfile.update({
    where: { userId: mechanicId },
    data: {
      rating: reviews._avg.rating || 0,
      totalReviews: reviews._count.rating || 0,
    },
  });
};
