import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from '../lib/utils';

/**
 * Validate request body/query/params against Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const validated = schema.parse(data);

            // Replace request data with validated data
            req[source] = validated;

            next();
        } catch (error) {
            next(error); // Will be handled by error middleware
        }
    };
}

/**
 * Validate multiple sources at once
 */
export function validateMultiple(schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
