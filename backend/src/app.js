import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import ApiError from './utils/apiError.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import mechanicRoutes from './routes/mechanic.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import sosRoutes from './routes/sos.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

const allowedOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'OnlineGarage API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/vehicles', vehicleRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

export default app;
