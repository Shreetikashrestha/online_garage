import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/user.validator.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

router.post('/profile/avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/identity/upload', upload.single('document'), userController.uploadIdentityDoc);

export default router;
