import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { campusMiddleware } from '../../middleware/campus.middleware';
import { CreateTimetableEntrySchema } from './timetable.schema';
import * as timetableController from './timetable.controller';

const router = Router();

router.get('/', authMiddleware, timetableController.getTimetableHandler);
router.post('/', authMiddleware, campusMiddleware, validate(CreateTimetableEntrySchema), timetableController.createEntryHandler);
router.delete('/:id', authMiddleware, timetableController.deleteEntryHandler);

export default router;
