import logger from '../utils/logger.js';
import { getIO } from '../config/socket.js';

export default function registerNotificationHandlers(io, socket) {}

export const notifyUser = (userId, event, data) => {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const notifyMechanic = (mechanicId, event, data) => {
  const io = getIO();
  if (io) {
    io.to(`mechanic:${mechanicId}`).emit(event, data);
  }
};

export const notifyBookingRoom = (bookingId, event, data) => {
  const io = getIO();
  if (io) {
    io.to(`booking:${bookingId}`).emit(event, data);
  }
};
