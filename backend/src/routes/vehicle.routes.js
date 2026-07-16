import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { authorize as rbacAuthorize } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
} from '../validators/vehicle.validator.js';

const router = Router({ mergeParams: true });

import { authenticate as auth } from '../middleware/auth.js';
router.use(auth);

router
  .route('/')
  .get(vehicleController.getAllVehicles)
  .post(validate(createVehicleSchema), vehicleController.addVehicle);

router
  .route('/:id')
  .get(validate(vehicleIdSchema), vehicleController.getVehicle)
  .patch(validate(updateVehicleSchema), vehicleController.updateVehicle)
  .delete(validate(vehicleIdSchema), vehicleController.deleteVehicle);

router.patch('/:id/primary', validate(vehicleIdSchema), vehicleController.setPrimary);

export default router;
