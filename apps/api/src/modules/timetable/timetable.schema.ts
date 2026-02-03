import { z } from 'zod';

export const CreateTimetableEntrySchema = z.object({
    campus_id: z.string(),
    course_id: z.string(),
    day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
    location: z.string().optional(),
});

export type CreateTimetableEntryInput = z.infer<typeof CreateTimetableEntrySchema>;
