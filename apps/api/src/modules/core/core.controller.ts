import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as coreService from './core.service';

/**
 * GET /api/v1/campuses
 * Get all campuses
 */
export const getCampusesHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await coreService.getCampuses();
    sendSuccess(res, result);
});

/**
 * GET /api/v1/courses
 * Search courses
 */
export const getCoursesHandler = asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await coreService.getCourses(req.query);
    sendSuccess(res, data, meta);
});
