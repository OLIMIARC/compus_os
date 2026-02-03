import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { CourseQuerySchema } from './core.schema';
import * as coreController from './core.controller';

const router = Router();

/**
 * GET /api/v1/campuses
 * Public endpoint
 */
router.get('/campuses', coreController.getCampusesHandler);

/**
 * GET /api/v1/courses
 * Public endpoint with optional filters
 */
router.get(
    '/courses',
    validate(CourseQuerySchema, 'query'),
    coreController.getCoursesHandler
);

export default router;
