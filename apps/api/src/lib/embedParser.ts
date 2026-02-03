import { prisma } from '../config/db';

/**
 * Content embed parser and validator
 * Detects internal URLs and validates embed rules
 */

export type EmbeddableType = 'post' | 'article' | 'marketplace_listing' | 'poll';

export interface InternalLink {
    type: EmbeddableType;
    id: string;
    url: string;
}

const URL_PATTERNS = {
    post: /\/post\/([a-z0-9_]+)/i,
    article: /\/article\/([a-z0-9_]+)/i,
    marketplace_listing: /\/marketplace\/([a-z0-9_]+)/i,
    poll: /\/poll\/([a-z0-9_]+)/i,
};

/**
 * Parse content for internal URL patterns
 * Returns first valid internal link found
 */
export function parseContentForEmbeds(content: string): InternalLink | null {
    for (const [type, pattern] of Object.entries(URL_PATTERNS)) {
        const match = content.match(pattern);
        if (match) {
            return {
                type: type as EmbeddableType,
                id: match[1],
                url: match[0],
            };
        }
    }
    return null;
}

/**
 * Validate embed rules:
 * - Same campus only
 * - Content is active
 * - Max 1 embed per source
 * - Minimum original text (>=40 chars)
 */
export async function validateEmbed(
    sourceType: string,
    sourceId: string,
    embeddedType: EmbeddableType,
    embeddedId: string,
    userCampusId: string,
    originalText: string
): Promise<{ valid: boolean; error?: string }> {
    // Check minimum original text
    const textWithoutUrls = originalText.replace(/\/\w+\/[a-z0-9_]+/gi, '').trim();
    if (textWithoutUrls.length < 40) {
        return {
            valid: false,
            error: 'You must include at least 40 characters of original text besides the reference.',
        };
    }

    // Check if embed already exists for this source
    const existingEmbed = await prisma.contentEmbed.findUnique({
        where: {
            sourceType_sourceId: {
                sourceType,
                sourceId,
            },
        },
    });

    if (existingEmbed) {
        return {
            valid: false,
            error: 'You can reference only one item per post.',
        };
    }

    // Validate embedded content exists and get its campus
    let embeddedCampusId: string | null = null;
    let embeddedStatus: string | null = null;

    switch (embeddedType) {
        case 'post':
            const post = await prisma.feedPost.findUnique({
                where: { id: embeddedId },
                select: { campusId: true, status: true },
            });
            embeddedCampusId = post?.campusId || null;
            embeddedStatus = post?.status || null;
            break;

        case 'article':
            const article = await prisma.article.findUnique({
                where: { id: embeddedId },
                select: { campusId: true, status: true },
            });
            embeddedCampusId = article?.campusId || null;
            embeddedStatus = article?.status || null;
            break;

        case 'marketplace_listing':
            const listing = await prisma.marketplaceListing.findUnique({
                where: { id: embeddedId },
                select: { campusId: true, status: true },
            });
            embeddedCampusId = listing?.campusId || null;
            embeddedStatus = listing?.status || null;
            break;

        case 'poll':
            const poll = await prisma.poll.findUnique({
                where: { id: embeddedId },
                include: { post: { select: { campusId: true, status: true } } },
            });
            embeddedCampusId = poll?.post.campusId || null;
            embeddedStatus = poll?.post.status || null;
            break;
    }

    if (!embeddedCampusId) {
        return {
            valid: false,
            error: 'The referenced content does not exist.',
        };
    }

    // Check same campus
    if (embeddedCampusId !== userCampusId) {
        return {
            valid: false,
            error: 'This content is not available in your campus.',
        };
    }

    // Check if content is active
    if (embeddedStatus !== 'active' && embeddedStatus !== 'published' && embeddedStatus !== 'approved') {
        return {
            valid: false,
            error: 'The referenced content is no longer available.',
        };
    }

    return { valid: true };
}

/**
 * Detect self-embed abuse
 * Returns true if user has embedded their own content >3 times in last 24h
 */
export async function detectSelfEmbedAbuse(
    userId: string,
    embeddedType: EmbeddableType,
    embeddedId: string
): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get author of embedded content
    let embedAuthorId: string | null = null;

    switch (embeddedType) {
        case 'post':
            const post = await prisma.feedPost.findUnique({
                where: { id: embeddedId },
                select: { authorUserId: true },
            });
            embedAuthorId = post?.authorUserId || null;
            break;

        case 'article':
            const article = await prisma.article.findUnique({
                where: { id: embeddedId },
                select: { authorUserId: true },
            });
            embedAuthorId = article?.authorUserId || null;
            break;

        case 'marketplace_listing':
            const listing = await prisma.marketplaceListing.findUnique({
                where: { id: embeddedId },
                select: { sellerId: true },
            });
            embedAuthorId = listing?.sellerId || null;
            break;
    }

    // Not self-embed if different author
    if (embedAuthorId !== userId) return false;

    // Count recent self-embeds
    const recentSelfEmbeds = await prisma.contentEmbed.count({
        where: {
            createdByUserId: userId,
            embeddedId: embeddedId,
            createdAt: {
                gte: oneDayAgo,
            },
        },
    });

    return recentSelfEmbeds >= 3;
}

/**
 * Strip embed URL from content after validation
 */
export function stripEmbedUrl(content: string, embedUrl: string): string {
    return content.replace(embedUrl, '').trim();
}
