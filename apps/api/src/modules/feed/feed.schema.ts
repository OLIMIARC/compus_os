import { z } from 'zod';

// Create Post Schema
export const CreatePostSchema = z.object({
    campus_id: z.string(),
    post_type: z.enum(['text', 'image', 'poll', 'repost']),
    title: z.string().max(200).optional(),
    body: z.string().min(1, 'Body is required'),
    is_anonymous: z.boolean().default(false),
});

// Create Comment Schema
export const CreateCommentSchema = z.object({
    body: z.string().min(1, 'Comment body is required').max(500),
    is_anonymous: z.boolean().default(false),
});

// Create Poll Schema
export const CreatePollSchema = z.object({
    question: z.string().min(3, 'Question must be at least 3 characters'),
    options: z.array(z.string().min(1)).min(2, 'At least 2 options required').max(6, 'Maximum 6 options'),
});

// Vote Schema
export const VoteSchema = z.object({
    option_id: z.string(),
});

// Repost Schema
export const RepostSchema = z.object({
    original_post_id: z.string(),
});

// Feed Query Schema
export const FeedQuerySchema = z.object({
    campus_id: z.string().optional(),
    type: z.enum(['text', 'image', 'poll', 'repost', 'all']).default('all'),
    sort: z.enum(['hot', 'latest', 'top']).default('hot'),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(50).optional(),
});

// Types
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type VoteInput = z.infer<typeof VoteSchema>;
export type RepostInput = z.infer<typeof RepostSchema>;
export type FeedQuery = z.infer<typeof FeedQuerySchema>;
