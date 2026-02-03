import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireModerator } from '../../middleware/role.middleware';
import { CreateReportSchema } from './reports.schema';
import * as reportsController from './reports.controller';

const router = Router();

router.post('/', authMiddleware, validate(CreateReportSchema), reportsController.createReportHandler);
router.get('/pending', authMiddleware, requireModerator, reportsController.getPendingReportsHandler);

export default router;
