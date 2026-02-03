import { prisma } from '../../config/db';
import { createError } from '../../lib/utils';
import { generateId } from '../../lib/ids';
import type { CreateTimetableEntryInput } from './timetable.schema';

export async function getTimetable(userId: string) {
    const entries = await prisma.timetableEntry.findMany({
        where: { userId },
        include: {
            course: {
                select: {
                    code: true,
                    title: true,
                },
            },
        },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
        ],
    });

    return entries.map(entry => ({
        id: entry.id,
        course: {
            id: entry.courseId,
            code: entry.course.code,
            title: entry.course.title,
        },
        day_of_week: entry.dayOfWeek,
        start_time: entry.startTime,
        end_time: entry.endTime,
        location: entry.location,
    }));
}

export async function createEntry(userId: string, data: CreateTimetableEntryInput) {
    const entry = await prisma.timetableEntry.create({
        data: {
            id: generateId('tt'),
            userId,
            campusId: data.campus_id,
            courseId: data.course_id,
            dayOfWeek: Number(data.day_of_week),
            startTime: data.start_time,
            endTime: data.end_time,
            location: data.location,
            semester: 'current', // or get from data if possible
        },
    });

    return { id: entry.id };
}

export async function deleteEntry(userId: string, entryId: string) {
    const entry = await prisma.timetableEntry.findUnique({
        where: { id: entryId },
    });

    if (!entry) {
        throw createError('ENTRY_NOT_FOUND', 'Timetable entry not found', 404);
    }

    if (entry.userId !== userId) {
        throw createError('FORBIDDEN', 'You can only delete your own entries', 403);
    }

    await prisma.timetableEntry.delete({
        where: { id: entryId },
    });

    return { deleted: true };
}
