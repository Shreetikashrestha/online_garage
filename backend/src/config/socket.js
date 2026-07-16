import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './env.js';
import logger from '../utils/logger.js';
import registerAllSocketHandlers from '../sockets/index.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.user.id} (${socket.user.role})`);

    socket.join(`user:${socket.user.id}`);

    if (socket.user.role === 'MECHANIC') {
      socket.join(`mechanic:${socket.user.id}`);
    }

    registerAllSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.user.id} (${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`🔌 Socket error for ${socket.user.id}: ${err.message}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    logger.warn('Socket.io not initialized');
  }
  return io;
};

export default { initSocket, getIO };
