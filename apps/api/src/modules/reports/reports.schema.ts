import { z } from 'zod';

export const CreateReportSchema = z.object({
    target_type: z.enum(['post', 'comment', 'note', 'article', 'user']),
    target_id: z.string(),
    reason: z.enum(['spam', 'offensive', 'misinformation', 'harassment', 'inappropriate']),
    details: z.string().max(500).optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
