import prisma from '../config/database.js';
import ApiError from '../utils/apiError.js';
import { notifyMechanic, notifyUser } from '../sockets/notifications.socket.js';

export const triggerSOS = async (userId, data) => {
  const { bookingId, latitude, longitude, message } = data;

  const alert = await prisma.sOSAlert.create({
    data: {
      userId,
      bookingId,
      latitude,
      longitude,
      message,
      status: 'ACTIVE',
    },
  });

  const nearestMechanics = await prisma.mechanicProfile.findMany({
    where: { isAvailable: true },
    take: 3,
    select: { userId: true },
  });

  nearestMechanics.forEach((mechanic) => {
    notifyMechanic(mechanic.userId, 'sos:alert', {
      alertId: alert.id,
      latitude,
      longitude,
      message,
    });
  });


  return alert;
};

export const respondToSOS = async (alertId, mechanicId) => {
  const alert = await prisma.sOSAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) throw new ApiError(404, 'SOS Alert not found');
  if (alert.status !== 'ACTIVE') throw new ApiError(400, 'SOS Alert is no longer active');

  const updatedAlert = await prisma.sOSAlert.update({
    where: { id: alertId },
    data: { status: 'RESPONDING' },
  });

  notifyUser(alert.userId, 'sos:responding', {
    alertId,
    mechanicId,
  });

  return updatedAlert;
};

export const resolveSOS = async (alertId, userId, role) => {
  const alert = await prisma.sOSAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) throw new ApiError(404, 'SOS Alert not found');
  
  if (role !== 'ADMIN' && alert.userId !== userId) {
    throw new ApiError(403, 'Unauthorized to resolve this alert');
  }

  return prisma.sOSAlert.update({
    where: { id: alertId },
    data: { status: 'RESOLVED' },
  });
};
