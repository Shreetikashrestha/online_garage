import { Router } from 'express';
import * as serviceController from '../controllers/service.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', serviceController.getServices);
router.get('/spare-parts', serviceController.getSpareParts);
router.get('/spare-parts/item/:id', serviceController.getSparePartById);

router.use(authenticate);
router.get('/spare-parts/:vehicleId', serviceController.getCompatibleParts);
router.post('/search', serviceController.searchMechanics);
router.post('/spare-parts/order', serviceController.placePartsOrder);

export default router;
