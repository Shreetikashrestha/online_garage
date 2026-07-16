import { Router } from 'express';
import * as sosController from '../controllers/sos.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);

router.post('/alert', authorize('USER'), sosController.triggerAlert);
router.patch('/:id/respond', authorize('MECHANIC'), sosController.respondToAlert);
router.patch('/:id/resolve', authorize('USER', 'ADMIN'), sosController.resolveAlert);

export default router;
