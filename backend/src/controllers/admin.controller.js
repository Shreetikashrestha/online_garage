import prisma from '../config/database.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import ApiError from '../utils/apiError.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const { skip, limit } = getPagination(req.query);
  
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isIdentityVerified: true,
      identityDocUrl: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

export const verifyIdentity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { isIdentityVerified: true },
    select: {
      id: true,
      name: true,
      isIdentityVerified: true,
      role: true,
    },
  });

  if (user.role === 'MECHANIC') {
    await prisma.mechanicProfile.update({
      where: { userId: id },
      data: { isIdVerified: true },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'User identity verified successfully',
    data: { user },
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
  const totalMechanics = await prisma.user.count({ where: { role: 'MECHANIC' } });
  const totalBookings = await prisma.booking.count();
  
  const bookingsByStatus = await prisma.booking.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalMechanics,
      totalBookings,
      bookingsByStatus,
    },
  });
});
