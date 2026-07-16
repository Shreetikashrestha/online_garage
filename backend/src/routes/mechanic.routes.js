import { Router } from 'express';
import * as mechanicController from '../controllers/mechanic.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  mechanicProfileSchema,
  updateAvailabilitySchema,
} from '../validators/user.validator.js';

const router = Router();

router.get('/:id', mechanicController.getPublicProfile);
router.get('/:id/reviews', mechanicController.getReviews);

router.use(authenticate);
router.use(authorize('MECHANIC', 'ADMIN'));

router.get('/me/profile', mechanicController.getMyProfile);
router.patch('/me/profile', validate(mechanicProfileSchema), mechanicController.updateMyProfile);
router.patch('/me/availability', validate(updateAvailabilitySchema), mechanicController.toggleAvailability);

export default router;
