import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import { exclude } from '../utils/helpers.js';

export const getMechanicProfile = async (mechanicId) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          isIdentityVerified: true,
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(404, 'Mechanic profile not found');
  }

  return profile;
};

export const updateMechanicProfile = async (mechanicId, data) => {
  const profile = await prisma.mechanicProfile.findUnique({
    where: { userId: mechanicId },
  });

  if (!profile) {
    throw new ApiError(404, 'Mechanic profile not found');
  }

  return prisma.mechanicProfile.update({
    where: { userId: mechanicId },
    data,
  });
};

export const updateAvailability = async (mechanicId, isAvailable) => {
  return prisma.mechanicProfile.update({
    where: { userId: mechanicId },
    data: { isAvailable },
  });
};

export const getMechanicReviews = async (mechanicId, skip, limit) => {
  return prisma.review.findMany({
    where: { revieweeId: mechanicId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
};
