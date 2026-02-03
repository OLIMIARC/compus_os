import { z } from 'zod';

export const CreateArticleSchema = z.object({
    campus_id: z.string(),
    title: z.string().min(10),
    summary: z.string().min(20),
    body: z.string().min(100),
    tier: z.enum(['student', 'featured']).default('student'),
});

export const ArticleQuerySchema = z.object({
    campus_id: z.string().optional(),
    tier: z.enum(['student', 'featured', 'all']).default('all'),
    q: z.string().optional(),
    sort: z.enum(['latest', 'popular']).default('latest'),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(50).optional(),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
export type ArticleQuery = z.infer<typeof ArticleQuerySchema>;
