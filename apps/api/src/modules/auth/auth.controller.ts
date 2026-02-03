import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as authService from './auth.service';

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, undefined, 201);
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
});

/**
 * GET /api/v1/me
 * Get current user profile
 */
export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.getMe(req.user!.id);
    sendSuccess(res, result);
});

/**
 * PATCH /api/v1/me
 * Update current user profile
 */
export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, result);
});
