import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import { calculateDistance } from '../utils/helpers.js';

export const calculateEstimate = async (serviceId, mechanicId, userLat, userLng) => {
  const service = await prisma.serviceCatalog.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  const mechanic = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicId },
  });

  if (!mechanic) {
    throw new ApiError(404, 'Mechanic not found');
  }

  let distanceKm = 5;

  if (userLat && userLng && mechanic.latitude && mechanic.longitude) {
    distanceKm = calculateDistance(userLat, userLng, mechanic.latitude, mechanic.longitude);
  }

  const travelFee = distanceKm * service.travelFeePerKm;
  const estimatedTotal = service.basePrice + travelFee;

  return {
    basePrice: service.basePrice,
    travelFee,
    distanceKm,
    estimatedTotal,
  };
};
