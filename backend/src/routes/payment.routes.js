import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  initializePaymentSchema,
  releasePaymentSchema,
} from '../validators/payment.validator.js';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

router.use(authenticate);

router.post(
  '/initialize',
  authorize('USER'),
  validate(initializePaymentSchema),
  paymentController.initializePayment
);

router.post(
  '/release',
  authorize('USER'),
  validate(releasePaymentSchema),
  paymentController.releasePayment
);

router.get('/:bookingId', paymentController.getPaymentStatus);

export default router;
