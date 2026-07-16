import { updateMechanicLocation } from '../services/tracking.service.js';
import logger from '../utils/logger.js';

export default function registerTrackingHandlers(io, socket) {
  
  socket.on('tracking:join', (bookingId) => {
    socket.join(`booking:${bookingId}`);
    logger.debug(`User ${socket.user.id} joined tracking room booking:${bookingId}`);
  });

  socket.on('tracking:leave', (bookingId) => {
    socket.leave(`booking:${bookingId}`);
    logger.debug(`User ${socket.user.id} left tracking room booking:${bookingId}`);
  });

  socket.on('tracking:update', async (data) => {
    if (socket.user.role !== 'MECHANIC') return;

    const { bookingId, latitude, longitude } = data;

    try {
      const locationData = await updateMechanicLocation(socket.user.id, bookingId, latitude, longitude);

      if (locationData) {
        socket.to(`booking:${bookingId}`).emit('tracking:location_updated', locationData);
      }
    } catch (err) {
      logger.error(`Error updating location for mechanic ${socket.user.id}: ${err.message}`);
    }
  });
}
