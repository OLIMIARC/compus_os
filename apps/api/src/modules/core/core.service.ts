import { prisma } from '../../config/db';
import { calculatePagination, buildPaginationMeta } from '../../lib/pagination';
import type { CourseQuery } from './core.schema';

/**
 * Get all campuses
 */
export async function getCampuses() {
    const campuses = await prisma.campus.findMany({
        select: {
            id: true,
            name: true,
            city: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return campuses;
}

/**
 * Get courses with optional search and campus filter
 */
export async function getCourses(query: CourseQuery) {
    const { skip, take, page, pageSize } = calculatePagination({
        page: query.page,
        pageSize: query.pageSize,
    });

    // Build where clause
    const where: any = {};

    if (query.campus_id) {
        where.campusId = query.campus_id;
    }

    if (query.q) {
        where.OR = [
            { code: { contains: query.q, mode: 'insensitive' } },
            { title: { contains: query.q, mode: 'insensitive' } },
        ];
    }

    // Get courses
    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                campusId: true,
                code: true,
                title: true,
            },
            orderBy: [
                { code: 'asc' },
            ],
        }),
        prisma.course.count({ where }),
    ]);

    // Format response
    const data = courses.map((course) => ({
        id: course.id,
        campus_id: course.campusId,
        code: course.code,
        title: course.title,
    }));

    const meta = buildPaginationMeta(page, pageSize, total);

    return { data, meta };
}
