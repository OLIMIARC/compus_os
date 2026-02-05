import { Request, Response, NextFunction } from 'express';
import { createError } from '../lib/utils';

/**
 * Anti-spam and abuse prevention middleware
 * Enforces strict rules against external links and spam patterns
 */

// Regex patterns for detecting URLs
const URL_PATTERNS = [
    /https?:\/\/[^\s]+/gi, // Standard URLs
    /www\.[^\s]+/gi, // www. URLs
    /[a-z0-9-]+\.(com|net|org|io|app|co|xyz|link|site)[^\s]*/gi, // Domain patterns
];

// Internal URL patterns (allowed)
const INTERNAL_PATTERNS = [
    /\/post\/[a-z0-9_]+/i,
    /\/article\/[a-z0-9_]+/i,
    /\/notes\/[a-z0-9_]+/i,
    /\/poll\/[a-z0-9_]+/i,
];

/**
 * Check if text contains raw external URLs
 */
function containsExternalUrl(text: string): boolean {
    if (!text) return false;

    // Check for external URLs
    for (const pattern of URL_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            // Check if any match is NOT an internal pattern
            for (const match of matches) {
                const isInternal = INTERNAL_PATTERNS.some((internalPattern) =>
                    internalPattern.test(match)
                );
                if (!isInternal) {
                    return true; // Found external URL
                }
            }
        }
    }

    return false;
}

/**
 * Anti-spam middleware - blocks raw URLs in content
 */
export function antiSpamMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Check common text fields for URLs
    const fieldsToCheck = ['body', 'title', 'description', 'comment'];

    for (const field of fieldsToCheck) {
        const value = req.body[field];
        if (value && typeof value === 'string') {
            if (containsExternalUrl(value)) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        code: 'EXTERNAL_LINKS_NOT_ALLOWED',
                        message:
                            'External links are not supported. You can reference internal content using /post/{id}, /article/{id}, /notes/{id}, or /poll/{id}.',
                        details: {
                            field,
                            suggestion: 'Remove all external URLs and use internal references instead.',
                        },
                    },
                });
            }
        }
    }

    next();
}

/**
 * Detect link farming patterns
 * Returns true if content is primarily links with minimal original text
 */
export function isLinkFarming(text: string): boolean {
    if (!text) return false;

    // Remove all URLs
    const textWithoutLinks = text.replace(/\/\w+\/[a-z0-9_]+/gi, '').trim();

    // If remaining text is very short, it's likely link farming
    // Lowered to 10 chars for MVP (allows "Hello world" style posts)
    return textWithoutLinks.length < 10;
}

/**
 * Middleware to prevent link farming
 */
export function preventLinkFarming(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const body = req.body.body || req.body.comment;

    if (body && typeof body === 'string' && isLinkFarming(body)) {
        return res.status(400).json({
            ok: false,
            error: {
                code: 'INSUFFICIENT_ORIGINAL_TEXT',
                message:
                    'Your post must include at least 10 characters of original text besides any references.',
                details: {
                    minimum: 10,
                    current: body.replace(/\/\w+\/[a-z0-9_]+/gi, '').trim().length,
                },
            },
        });
    }

    next();
}

/**
 * Combined anti-spam and anti-abuse middleware stack
 */
export const antiAbuseStack = [antiSpamMiddleware, preventLinkFarming];
