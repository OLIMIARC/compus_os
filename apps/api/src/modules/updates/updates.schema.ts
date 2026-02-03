import { z } from 'zod';

export const CreateUpdateSchema = z.object({
    campus_id: z.string(),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    body: z.string().min(10, 'Body must be at least 10 characters'),
    type: z.enum(['exam_schedule', 'registration', 'closure', 'emergency']),
    expires_at: z.string().datetime().optional(),
});

export type CreateUpdateInput = z.infer<typeof CreateUpdateSchema>;
