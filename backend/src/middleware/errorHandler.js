import { Prisma } from '@prisma/client';
import env from '../config/env.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, isOperational } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal Server Error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    isOperational = true;
    if (err.code === 'P2002') {
      message = `Duplicate field value entered. Please use another value.`;
    } else if (err.code === 'P2014') {
      message = `Invalid ID.`;
    } else if (err.code === 'P2003') {
      message = `Invalid input data.`;
    } else {
      message = `Database Error: ${err.message}`;
    }
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    isOperational = true;
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired! Please log in again.';
    isOperational = true;
  }

  if (env.NODE_ENV === 'development' || !isOperational) {
    logger.error(err);
  }

  const response = {
    code: statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
