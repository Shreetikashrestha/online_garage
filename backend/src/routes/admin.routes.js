import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/verify', adminController.verifyIdentity);
router.get('/analytics/dashboard', adminController.getDashboardStats);

export default router;
