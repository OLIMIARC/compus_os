import { prisma } from '../../config/db';
import { createError } from '../../lib/utils';
import { calculatePagination, buildPaginationMeta } from '../../lib/pagination';
import { generateId } from '../../lib/ids';
import { updateReputation, canSubmitFeaturedArticle } from '../../lib/reputation';
import type { CreateArticleInput, ArticleQuery } from './articles.schema';

export async function getArticles(query: ArticleQuery, userCampusId?: string) {
    const { skip, take, page, pageSize } = calculatePagination({
        page: query.page,
        pageSize: query.pageSize || 20,
    });

    const where: any = { status: 'published' };

    if (userCampusId) {
        where.campusId = userCampusId;
    } else if (query.campus_id) {
        where.campusId = query.campus_id;
    }

    if (query.tier !== 'all') {
        where.tier = query.tier;
    }

    if (query.q) {
        where.OR = [
            { title: { contains: query.q, mode: 'insensitive' } },
            { summary: { contains: query.q, mode: 'insensitive' } },
        ];
    }

    const orderBy = query.sort === 'popular' ? { viewsCount: 'desc' } : { createdAt: 'desc' };

    const [articles, total] = await Promise.all([
        prisma.article.findMany({
            where,
            skip,
            take,
            orderBy: query.sort === 'popular' ? { viewsCount: 'desc' } : { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        }),
        prisma.article.count({ where }),
    ]);

    const data = (articles as any[]).map(article => ({
        id: article.id,
        campus_id: article.campusId,
        title: article.title,
        summary: article.summary,
        tier: article.tier,
        author: {
            id: article.author.id,
            full_name: article.author.fullName,
        },
        reads_count: article.viewsCount,
        completion_rate: article.completionRate,
        created_at: article.createdAt,
    }));

    const meta = buildPaginationMeta(page, pageSize, total);
    return { data, meta };
}

export async function getArticleById(articleId: string, userId?: string) {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
            author: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
        },
    });

    if (!article) {
        throw createError('ARTICLE_NOT_FOUND', 'Article not found', 404);
    }

    // Track read if user is authenticated
    if (userId) {
        await prisma.articleRead.create({
            data: {
                id: generateId('ar'),
                articleId,
                userId,
            },
        }).catch(() => { }); // Ignore duplicates

        // Update reads count
        await prisma.article.update({
            where: { id: articleId },
            data: { viewsCount: { increment: 1 } },
        });

        // Update author reputation
        await updateReputation({
            type: 'article_read',
            userId: article.authorUserId,
        });
    }

    return {
        id: article.id,
        campus_id: article.campusId,
        author_user_id: article.authorUserId,
        title: article.title,
        summary: article.summary,
        body_markdown: article.bodyMarkdown,
        tier: article.tier,
        author: {
            id: article.author.id,
            full_name: article.author.fullName,
        },
        reads_count: article.viewsCount,
        created_at: article.createdAt,
    };
}

export async function createArticle(userId: string, data: CreateArticleInput) {
    // Check reputation for featured tier
    if (data.tier === 'featured') {
        const canSubmit = await canSubmitFeaturedArticle(userId);
        if (!canSubmit) {
            throw createError(
                'INSUFFICIENT_REPUTATION',
                'You need at least 100 reputation to submit featured articles',
                403
            );
        }
    }

    const article = await prisma.article.create({
        data: {
            id: generateId('art'),
            campusId: data.campus_id,
            authorUserId: userId,
            title: data.title,
            summary: data.summary,
            bodyMarkdown: data.body,
            tier: data.tier,
            status: data.tier === 'featured' ? 'pending_review' : 'published',
        },
    });

    return {
        id: article.id,
        tier: article.tier,
        status: article.status,
    };
}

export async function trackCompletion(userId: string, articleId: string) {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
    });

    if (!article) {
        throw createError('ARTICLE_NOT_FOUND', 'Article not found', 404);
    }

    // Mark as completed
    await prisma.articleRead.updateMany({
        where: { articleId, userId },
        data: { completed: true, completedAt: new Date() },
    });

    // Update author reputation
    await updateReputation({
        type: 'article_completion',
        userId: article.authorUserId,
    });

    return { completed: true };
}
