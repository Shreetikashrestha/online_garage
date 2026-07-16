import redis, { isRedisAvailable } from '../config/redis.js';
import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';

export const updateMechanicLocation = async (mechanicId, bookingId, latitude, longitude) => {
  if (!isRedisAvailable()) {
    return null;
  }

  const key = `tracking:booking:${bookingId}`;
  
  const locationData = {
    mechanicId,
    latitude,
    longitude,
    timestamp: Date.now(),
  };

  await redis.set(key, JSON.stringify(locationData), 'EX', 3600);

  await redis.geoadd('active:mechanics', longitude, latitude, mechanicId);

  return locationData;
};

export const getMechanicLocation = async (bookingId, userId, role) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new ApiError(404, 'Booking not found');
  
  if (role !== 'ADMIN' && booking.userId !== userId && booking.mechanicId !== userId) {
    throw new ApiError(403, 'Unauthorized to track this booking');
  }

  if (!isRedisAvailable()) {
    return {
      message: 'Real-time tracking is currently unavailable',
      latitude: null,
      longitude: null,
    };
  }

  const key = `tracking:booking:${bookingId}`;
  const data = await redis.get(key);

  if (!data) {
    return {
      message: 'No active tracking data available',
      latitude: null,
      longitude: null,
    };
  }

  return JSON.parse(data);
};
