import { prisma } from '../../config/db';
import { createError } from '../../lib/utils';
import { generateId } from '../../lib/ids';
import type { CreateUpdateInput } from './updates.schema';

/**
 * Get active campus update for a campus
 */
export async function getActiveUpdate(campusId: string) {
    const update = await prisma.campusUpdate.findFirst({
        where: {
            campusId,
            status: 'active',
            OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
            ],
        },
        include: {
            creator: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!update) {
        return null;
    }

    return {
        id: update.id,
        campus_id: update.campusId,
        title: update.title,
        body: update.body,
        type: update.type,
        creator: {
            id: update.creator.id,
            full_name: update.creator.fullName,
        },
        reactions_count: update.reactionsCount,
        expires_at: update.expiresAt,
        created_at: update.createdAt,
    };
}

/**
 * Create a campus update (verified users only)
 */
export async function createUpdate(userId: string, data: CreateUpdateInput) {
    // Check if there's already an active update for this campus
    const existing = await getActiveUpdate(data.campus_id);
    if (existing) {
        throw createError(
            'ACTIVE_UPDATE_EXISTS',
            'There is already an active update for this campus. Please expire it first.',
            409
        );
    }

    const update = await prisma.campusUpdate.create({
        data: {
            id: generateId('cu'),
            campusId: data.campus_id,
            creatorUserId: userId,
            title: data.title,
            body: data.body,
            type: data.type,
            status: 'active',
            expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        },
    });

    return {
        id: update.id,
        campus_id: update.campusId,
        title: update.title,
        type: update.type,
        status: update.status,
    };
}

/**
 * Expire a campus update
 */
export async function expireUpdate(userId: string, updateId: string) {
    const update = await prisma.campusUpdate.findUnique({
        where: { id: updateId },
    });

    if (!update) {
        throw createError('UPDATE_NOT_FOUND', 'Campus update not found', 404);
    }

    if (update.creatorUserId !== userId) {
        throw createError('FORBIDDEN', 'You can only expire your own updates', 403);
    }

    await prisma.campusUpdate.update({
        where: { id: updateId },
        data: { status: 'expired' },
    });

    return { id: updateId, status: 'expired' };
}

/**
 * React (👍) to a campus update
 */
export async function reactToUpdate(updateId: string) {
    const update = await prisma.campusUpdate.findUnique({
        where: { id: updateId },
    });

    if (!update) {
        throw createError('UPDATE_NOT_FOUND', 'Campus update not found', 404);
    }

    await prisma.campusUpdate.update({
        where: { id: updateId },
        data: {
            reactionsCount: { increment: 1 },
        },
    });

    return { reacted: true };
}
