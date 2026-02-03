import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

/**
 * POST /api/v1/auth/register
 */
router.post(
    '/register',
    validate(RegisterSchema),
    authController.registerHandler
);

/**
 * POST /api/v1/auth/login
 */
router.post(
    '/login',
    validate(LoginSchema),
    authController.loginHandler
);

/**
 * GET /api/v1/me
 * Protected route
 */
router.get(
    '/me',
    authMiddleware,
    authController.getMeHandler
);

/**
 * PATCH /api/v1/me
 * Protected route
 */
router.patch(
    '/me',
    authMiddleware,
    validate(UpdateProfileSchema),
    authController.updateProfileHandler
);

export default router;
