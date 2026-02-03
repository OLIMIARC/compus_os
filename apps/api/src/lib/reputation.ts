import { prisma } from '../config/db';

/**
 * Campus-scoped reputation system
 * Reputation affects reach, rate limits, and featured content eligibility
 */

export interface ReputationSignal {
    type: 'like' | 'article_read' | 'article_completion' | 'note_download' | 'note_rating' | 'cross_embed' | 'self_embed_spam' | 'report_against';
    userId: string;
    value?: number; // Optional custom value
}

const REPUTATION_WEIGHTS = {
    like: 1,
    article_read: 2,
    article_completion: 5,
    note_download: 3,
    note_rating_positive: 4, // rating >= 4
    note_rating_negative: -2, // rating < 3
    cross_embed: 5, // Someone else embedded your content
    self_embed_spam: -10, // Repeated self-embedding abuse
    report_against: -15, // Report verified against user
};

export async function updateReputation(signal: ReputationSignal): Promise<void> {
    let change = 0;

    switch (signal.type) {
        case 'like':
            change = REPUTATION_WEIGHTS.like;
            break;
        case 'article_read':
            change = REPUTATION_WEIGHTS.article_read;
            break;
        case 'article_completion':
            change = REPUTATION_WEIGHTS.article_completion;
            break;
        case 'note_download':
            change = REPUTATION_WEIGHTS.note_download;
            break;
        case 'note_rating':
            const rating = signal.value || 0;
            change = rating >= 4
                ? REPUTATION_WEIGHTS.note_rating_positive
                : REPUTATION_WEIGHTS.note_rating_negative;
            break;
        case 'cross_embed':
            change = REPUTATION_WEIGHTS.cross_embed;
            break;
        case 'self_embed_spam':
            change = REPUTATION_WEIGHTS.self_embed_spam;
            break;
        case 'report_against':
            change = REPUTATION_WEIGHTS.report_against;
            break;
    }

    if (change !== 0) {
        await prisma.user.update({
            where: { id: signal.userId },
            data: {
                reputationScore: {
                    increment: change,
                },
            },
        });
    }
}

export async function getUserReputation(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputationScore: true },
    });
    return user?.reputationScore || 0;
}

/**
 * Check if user has enough reputation for featured article submission
 */
export async function canSubmitFeaturedArticle(userId: string): Promise<boolean> {
    const reputation = await getUserReputation(userId);
    return reputation >= 100; // Threshold for featured submissions
}

/**
 * Get rate limit multiplier based on reputation
 * Higher reputation = higher limits
 */
export function getRateLimitMultiplier(reputation: number): number {
    if (reputation < 0) return 0.5; // Reduced limits for negative reputation
    if (reputation < 50) return 1;
    if (reputation < 100) return 1.5;
    if (reputation < 250) return 2;
    return 3; // High reputation users get 3x limits
}
