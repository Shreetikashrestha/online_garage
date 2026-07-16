import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import { exclude } from '../utils/helpers.js';

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      mechanicProfile: true,
      vehicles: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return exclude(user, ['passwordHash']);
};

export const updateUserProfile = async (userId, data) => {
  const { name, phone } = data;
  const normalizedPhone = phone?.trim() || null;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone: normalizedPhone,
    },
  });

  return exclude(updatedUser, ['passwordHash']);
};

export const updateAvatar = async (userId, avatarUrl) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  return exclude(updatedUser, ['passwordHash']);
};

export const updateIdentityDocument = async (userId, documentUrl) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      identityDocUrl: documentUrl,
      isIdentityVerified: false,
    },
  });

  return exclude(updatedUser, ['passwordHash']);
};
