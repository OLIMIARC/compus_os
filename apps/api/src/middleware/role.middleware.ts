import { Request, Response, NextFunction } from 'express';
import { createError } from '../lib/utils';

/**
 * Check if user has required role
 */
export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(createError('UNAUTHORIZED', 'Authentication required', 401));
        }

        const hasRole = roles.some((role) => req.user!.roles.includes(role));
        if (!hasRole) {
            return next(
                createError(
                    'FORBIDDEN',
                    `This action requires one of: ${roles.join(', ')}`,
                    403
                )
            );
        }

        next();
    };
}

/**
 * Predefined role checkers
 */
export const requireStudent = requireRole('student');
export const requireModerator = requireRole('moderator', 'admin');
export const requireAdmin = requireRole('admin');
export const requireVerified = requireRole('verified', 'moderator', 'admin');
