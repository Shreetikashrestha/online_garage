import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:bookingId', trackingController.getTracking);

export default router;
