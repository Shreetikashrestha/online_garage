import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import { calculateDistance } from '../utils/helpers.js';

export const getAllServices = async () => {
  return prisma.serviceCatalog.findMany({
    where: { isActive: true },
  });
};

export const getSpareParts = async () => {
  return prisma.sparePart.findMany({
    where: { isActive: true },
  });
};

export const getSparePartById = async (id) => {
  return prisma.sparePart.findUnique({
    where: { id },
    include: {
      compatibilities: true,
    },
  });
};

export const getCompatibleSpareParts = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) return [];

  const parts = await prisma.sparePart.findMany({
    where: {
      isActive: true,
      compatibilities: {
        some: {
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          yearFrom: { lte: vehicle.year },
          yearTo: { gte: vehicle.year },
        },
      },
    },
  });

  return parts;
};

export const createPartsOrder = async (userId, data) => {
  const { cart, vehicleId, scheduledTime } = data;

  let sparePartsService = await prisma.serviceCatalog.findFirst({
    where: { serviceType: 'SPARE_PARTS', isActive: true },
  });

  if (!sparePartsService) {
    sparePartsService = await prisma.serviceCatalog.findFirst({
      where: { name: 'Spare Parts Order' },
    });
  }

  if (!sparePartsService) {
    sparePartsService = await prisma.serviceCatalog.create({
      data: {
        name: 'Spare Parts Order',
        description: 'Automated service entry for spare parts ordering and installation checkout.',
        serviceType: 'SPARE_PARTS',
        basePrice: 0,
        hourlyLaborRate: 0,
        travelFeePerKm: 0,
        isActive: true,
      },
    });
  }

  if (cart.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.userId !== userId) {
    throw new ApiError(400, 'Invalid vehicle');
  }

  const normalizedCart = cart.map((item) => ({
    ...item,
    orderType: item.orderType || (item.withInstall ? 'order_install' : 'order'),
  }));

  const needsInstall = normalizedCart.some(i => i.orderType === 'install' || i.orderType === 'order_install');

  let mechanicId = null;
  if (needsInstall) {
    const mechanic = await prisma.mechanicProfile.findFirst({
      where: { isAvailable: true },
      orderBy: { rating: 'desc' },
    });

    if (!mechanic) {
      throw new ApiError(400, 'No mechanics available for installation service');
    }
    mechanicId = mechanic.userId;
  }

  let partsTotal = 0;
  let installTotal = 0;

  for (const item of normalizedCart) {
    const qty = item.qty || 1;
    if (item.orderType === 'order') {
      partsTotal += item.price * qty;
    } else if (item.orderType === 'install') {
      installTotal += (item.installationFee || 0) * qty;
    } else if (item.orderType === 'order_install') {
      partsTotal += item.price * qty;
      installTotal += (item.installationFee || 0) * qty;
    }
  }

  const estimatedTotal = partsTotal + installTotal;

  const booking = await prisma.booking.create({
    data: {
      userId,
      mechanicId,
      serviceId: sparePartsService.id,
      vehicleId,
      scheduledTime: new Date(scheduledTime),
      userLatitude: 27.7172,
      userLongitude: 85.3240,
      notes: JSON.stringify({ type: 'PARTS_ORDER', cart }),
      estimatedTotal,
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

export const searchMechanics = async (params) => {
  const { latitude, longitude, radius = 10, serviceId } = params;

  const mechanics = await prisma.mechanicProfile.findMany({
    where: { isAvailable: true },
    take: 20,
    include: {
      user: {
        select: { name: true, avatarUrl: true },
      },
    },
  });

  if (latitude && longitude) {
    const filtered = mechanics
      .filter((m) => {
        if (m.latitude == null || m.longitude == null) return false;
        const d = calculateDistance(latitude, longitude, m.latitude, m.longitude);
        return d <= radius;
      })
      .map((m) => ({
        ...m,
        distance_km: calculateDistance(latitude, longitude, m.latitude, m.longitude),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    return filtered;
  }

  return mechanics;
};
