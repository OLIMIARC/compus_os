import { prisma } from '../../config/db';
import { createError } from '../../lib/utils';
import { generateId } from '../../lib/ids';
import { updateReputation } from '../../lib/reputation';
import type { ModerationActionInput } from './moderation.schema';

export async function takeModerationAction(moderatorId: string, data: ModerationActionInput) {
    const report = await prisma.report.findUnique({
        where: { id: data.report_id },
    });

    if (!report) {
        throw createError('REPORT_NOT_FOUND', 'Report not found', 404);
    }

    if (report.status !== 'pending') {
        throw createError('REPORT_ALREADY_HANDLED', 'This report has already been handled', 400);
    }

    // Create moderation action
    const action = await prisma.moderationAction.create({
        data: {
            id: generateId('ma'),
            reportId: data.report_id,
            moderatorUserId: moderatorId,
            actionType: data.action,
            targetType: report.targetType,
            targetId: report.targetId,
            notes: data.notes,
        },
    });

    // Update report status
    await prisma.report.update({
        where: { id: data.report_id },
        data: { status: 'resolved' },
    });

    // Apply actions based on type
    if (data.action === 'hide_content') {
        // Hide the reported content
        if (report.targetType === 'post') {
            await prisma.feedPost.update({
                where: { id: report.targetId },
                data: { status: 'hidden' },
            });
        } else if (report.targetType === 'marketplace_listing') {
            await prisma.marketplaceListing.update({
                where: { id: report.targetId },
                data: { status: 'removed' },
            });
        } else if (report.targetType === 'article') {
            await prisma.article.update({
                where: { id: report.targetId },
                data: { status: 'hidden' },
            });
        }
    } else if (data.action === 'suspend_user') {
        // Suspend the user (get user from target)
        let targetUserId: string | null = null;

        if (report.targetType === 'user') {
            targetUserId = report.targetId;
        } else if (report.targetType === 'post') {
            const post = await prisma.feedPost.findUnique({
                where: { id: report.targetId },
                select: { authorUserId: true },
            });
            targetUserId = post?.authorUserId || null;
        }

        if (targetUserId) {
            await prisma.user.update({
                where: { id: targetUserId },
                data: { status: 'suspended' },
            });

            // Decrease reputation
            await updateReputation({
                type: 'report_against',
                userId: targetUserId,
            });
        }
    }

    return {
        action: {
            id: action.id,
            report_id: data.report_id,
            action_type: data.action,
        },
        message: 'Moderation action completed',
    };
}
