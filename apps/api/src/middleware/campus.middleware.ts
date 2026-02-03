import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { getRateLimitMultiplier } from '../lib/reputation';

/**
 * Campus-scoped content validation
 * Ensures content operations respect campus boundaries
 */
export function campusMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // For authenticated routes, auto-scope to user's campus
    if (req.user) {
        // If campus_id is explicitly provided, validate it matches user's campus
        // (unless user is admin with multi-campus access)
        const requestedCampusId = req.body.campus_id || req.query.campus_id;

        if (requestedCampusId) {
            const isAdmin = req.user.roles.includes('admin');
            if (!isAdmin && requestedCampusId !== req.user.campusId) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        code: 'CROSS_CAMPUS_DENIED',
                        message: 'You can only access content from your campus',
                    },
                });
            }
        }

        // Auto-inject campus_id for create operations
        if (req.method === 'POST' && !req.body.campus_id) {
            req.body.campus_id = req.user.campusId;
        }
    }

    next();
}

/**
 * Enforce ownership check
 * Ensures user can only modify their own content
 */
export function ownershipMiddleware(
    userIdField: string = 'author_user_id'
) {
    return (req: Request, res: Response, next: NextFunction) => {
        const resourceUserId = req.body[userIdField] || (req as any).resource?.[userIdField];

        if (!req.user) {
            return res.status(401).json({
                ok: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                },
            });
        }

        const isAdmin = req.user.roles.includes('admin');
        const isModerator = req.user.roles.includes('moderator');

        if (!isAdmin && !isModerator && resourceUserId !== req.user.id) {
            return res.status(403).json({
                ok: false,
                error: {
                    code: 'NOT_OWNER',
                    message: 'You can only modify your own content',
                },
            });
        }

        next();
    };
}

/**
 * Reputation-aware rate limiting
 * Higher reputation = higher rate limits
 */
export function createReputationRateLimit(
    baseWindowMs: number = 24 * 60 * 60 * 1000, // 24 hours
    baseMax: number = 5
) {
    return rateLimit({
        windowMs: baseWindowMs,
        max: (req: Request) => {
            if (!req.user) return baseMax;

            const multiplier = getRateLimitMultiplier(req.user.reputationScore);
            return Math.floor(baseMax * multiplier);
        },
        message: {
            ok: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'You have exceeded the rate limit. Please try again later.',
            },
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
}

// Predefined rate limiters
export const postRateLimit = createReputationRateLimit(24 * 60 * 60 * 1000, 5); // 5 posts/day
export const commentRateLimit = createReputationRateLimit(60 * 60 * 1000, 20); // 20 comments/hour
export const noteUploadRateLimit = createReputationRateLimit(24 * 60 * 60 * 1000, 3); // 3 uploads/day
