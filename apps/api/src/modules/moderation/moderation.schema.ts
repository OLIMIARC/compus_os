import { z } from 'zod';

export const ModerationActionSchema = z.object({
    report_id: z.string(),
    action: z.enum(['dismiss', 'hide_content', 'warn_user', 'suspend_user']),
    notes: z.string().max(500).optional(),
});

export type ModerationActionInput = z.infer<typeof ModerationActionSchema>;
