import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';

export const getUserVehicles = async (userId) => {
  return prisma.vehicle.findMany({
    where: { userId },
    orderBy: { isPrimary: 'desc' },
  });
};

export const getVehicleById = async (id, userId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  if (vehicle.userId !== userId) {
    throw new ApiError(403, 'You do not have permission to access this vehicle');
  }

  return vehicle;
};

export const addVehicle = async (userId, data) => {
  const { isPrimary, ...restData } = data;

  const existingVehiclesCount = await prisma.vehicle.count({
    where: { userId },
  });

  const shouldBePrimary = isPrimary || existingVehiclesCount === 0;

  if (shouldBePrimary && existingVehiclesCount > 0) {
    await prisma.vehicle.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.vehicle.create({
    data: {
      ...restData,
      userId,
      isPrimary: shouldBePrimary,
    },
  });
};

export const updateVehicle = async (id, userId, data) => {
  await getVehicleById(id, userId);

  return prisma.vehicle.update({
    where: { id },
    data,
  });
};

export const deleteVehicle = async (id, userId) => {
  await getVehicleById(id, userId);

  const bookingsCount = await prisma.booking.count({
    where: { vehicleId: id },
  });

  if (bookingsCount > 0) {
    throw new ApiError(400, 'Cannot delete a vehicle that has associated bookings');
  }

  await prisma.vehicle.delete({
    where: { id },
  });

  const remainingVehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 1,
  });

  if (remainingVehicles.length > 0) {
    await prisma.vehicle.update({
      where: { id: remainingVehicles[0].id },
      data: { isPrimary: true },
    });
  }

  return null;
};

export const setPrimaryVehicle = async (id, userId) => {
  await getVehicleById(id, userId);

  await prisma.vehicle.updateMany({
    where: { userId, isPrimary: true },
    data: { isPrimary: false },
  });

  return prisma.vehicle.update({
    where: { id },
    data: { isPrimary: true },
  });
};
