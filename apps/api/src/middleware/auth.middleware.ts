import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { prisma } from '../config/db';
import { createError } from '../lib/utils';

export interface AuthUser {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    campusId: string;
    roles: string[];
    status: string;
    reputationScore: number;
}

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError('NO_TOKEN', 'Authentication token required', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify token
        const decoded = jwt.verify(token, authConfig.jwt.secret, {
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience,
        }) as { userId: string };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                campusId: true,
                roles: true,
                status: true,
                reputationScore: true,
            },
        });

        if (!user) {
            throw createError('USER_NOT_FOUND', 'User not found', 401);
        }

        if (user.status !== 'active') {
            throw createError(
                'ACCOUNT_SUSPENDED',
                'Your account has been suspended',
                403
            );
        }

        // Attach user to request
        req.user = {
            ...user,
            email: user.email || undefined,
            phone: user.phone || undefined,
            roles: user.roles.split(','),
        };
        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Optional auth middleware - attaches user if token exists, but doesn't require it
 */
export async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No token, continue without user
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, authConfig.jwt.secret, {
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience,
        }) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                campusId: true,
                roles: true,
                status: true,
                reputationScore: true,
            },
        });

        if (user && user.status === 'active') {
            req.user = {
                ...user,
                email: user.email || undefined,
                phone: user.phone || undefined,
                roles: user.roles.split(','),
            };
        }
    } catch (error) {
        // Invalid token, just continue without user
    }

    next();
}
