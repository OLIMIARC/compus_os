import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.middleware';
import { requireVerified } from '../../middleware/role.middleware';
import { campusMiddleware } from '../../middleware/campus.middleware';
import { CreateUpdateSchema } from './updates.schema';
import * as updatesController from './updates.controller';

const router = Router();

router.get('/active', optionalAuthMiddleware, updatesController.getActiveUpdateHandler);
router.post('/', authMiddleware, requireVerified, campusMiddleware, validate(CreateUpdateSchema), updatesController.createUpdateHandler);
router.delete('/:id', authMiddleware, requireVerified, updatesController.expireUpdateHandler);
router.post('/:id/react', updatesController.reactHandler);

export default router;
