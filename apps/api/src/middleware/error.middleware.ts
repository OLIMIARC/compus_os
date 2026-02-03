import { Request, Response, NextFunction } from 'express';
import { AppError, errorResponse } from '../lib/utils';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Global error handling middleware
 * Converts all errors to standard API error format
 */
export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error occurred:', err.message || err);

    // Handle AppError (our custom errors)
    if (err instanceof AppError) {
        return res
            .status(err.statusCode)
            .json(errorResponse(err.code, err.message, err.details));
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json(
            errorResponse('VALIDATION_ERROR', 'Invalid request data', {
                errors: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            })
        );
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === 'P2002') {
            return res.status(409).json(
                errorResponse(
                    'DUPLICATE_ENTRY',
                    'A record with this value already exists',
                    { field: err.meta?.target }
                )
            );
        }

        // Record not found
        if (err.code === 'P2025') {
            return res.status(404).json(
                errorResponse('NOT_FOUND', 'The requested resource was not found')
            );
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res
            .status(401)
            .json(errorResponse('INVALID_TOKEN', 'Invalid authentication token'));
    }

    if (err.name === 'TokenExpiredError') {
        return res
            .status(401)
            .json(errorResponse('TOKEN_EXPIRED', 'Authentication token has expired'));
    }

    // Default server error
    return res.status(500).json(
        errorResponse(
            'INTERNAL_ERROR',
            'An unexpected error occurred',
            process.env.NODE_ENV === 'development' ? { message: err.message } : undefined
        )
    );
}
