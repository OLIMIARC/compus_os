import { z } from 'zod';

// Course Query Schema
export const CourseQuerySchema = z.object({
    campus_id: z.string().optional(),
    q: z.string().optional(), // Search query
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export type CourseQuery = z.infer<typeof CourseQuerySchema>;
