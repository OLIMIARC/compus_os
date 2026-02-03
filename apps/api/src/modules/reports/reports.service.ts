import { prisma } from '../../config/db';
import { generateId } from '../../lib/ids';
import type { CreateReportInput } from './reports.schema';

export async function createReport(userId: string, campusId: string, data: CreateReportInput) {
    const report = await prisma.report.create({
        data: {
            id: generateId('rpt'),
            campusId,
            reporterUserId: userId,
            targetType: data.target_type,
            targetId: data.target_id,
            reason: data.reason,
            details: data.details,
            status: 'pending',
        },
    });

    return {
        id: report.id,
        status: report.status,
        message: 'Report submitted. Our team will review it shortly.',
    };
}

export async function getPendingReports(campusId?: string) {
    const where: any = { status: 'pending' };

    if (campusId) {
        where.campusId = campusId;
    }

    const reports = await prisma.report.findMany({
        where,
        include: {
            reporter: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return reports.map(report => ({
        id: report.id,
        campus_id: report.campusId,
        target_type: report.targetType,
        target_id: report.targetId,
        reason: report.reason,
        details: report.details,
        reporter: {
            id: report.reporter.id,
            full_name: report.reporter.fullName,
        },
        status: report.status,
        created_at: report.createdAt,
    }));
}
