import http from 'http';
import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import prisma from './config/database.js';
import { initSocket } from './config/socket.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const server = http.createServer(app);

initSocket(server);

const port = env.PORT || 3000;
server.listen(port, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    logger.info('💥 Process terminated!');
    await prisma.$disconnect();
  });
});
