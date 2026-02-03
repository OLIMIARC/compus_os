/**
 * Feed Ranking Algorithm for Campus OS
 * Implements first-screen ordering and utility injection
 */

export type ContentType =
    | 'campus_update'
    | 'meme'
    | 'poll'
    | 'article'
    | 'note'
    | 'social_post'
    | 'timetable';

export interface FeedItem {
    id: string;
    type: ContentType;
    createdAt: Date;
    engagementScore: number;
    embedCount?: number;
    isNew?: boolean; // Posted by new user (< 7 days)
}

const CONTENT_TIMING = {
    meme: {
        spikeMultiplier: 2, // Spike fast
        decayRate: 0.1, // Decay fast (10% per hour)
    },
    poll: {
        spikeMultiplier: 1.5,
        decayRate: 0.05,
    },
    social_post: {
        spikeMultiplier: 1,
        decayRate: 0.03,
    },
    article: {
        spikeMultiplier: 0.5, // Slow spike
        decayRate: 0.01, // Persist longest (1% per hour)
    },
    note: {
        spikeMultiplier: 0.8,
        decayRate: 0.02,
    },
};

/**
 * Calculate time-based decay for content
 */
function applyTimeDecay(
    engagementScore: number,
    createdAt: Date,
    type: ContentType
): number {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    const timing = CONTENT_TIMING[type as keyof typeof CONTENT_TIMING];
    if (!timing) return engagementScore;

    const decay = Math.exp(-timing.decayRate * hoursSinceCreation);
    return engagementScore * timing.spikeMultiplier * decay;
}

/**
 * Apply embed influence boost (+0.2x) to content that has been embedded
 */
function applyEmbedBoost(score: number, embedCount: number = 0): number {
    if (embedCount === 0) return score;
    return score * (1 + embedCount * 0.2);
}

/**
 * Apply new user visibility protection
 * New users get a small boost to ensure their content gets seen
 */
function applyNewUserBoost(score: number, isNew: boolean = false): number {
    return isNew ? score * 1.3 : score;
}

/**
 * Calculate final ranking score for a feed item
 */
export function calculateRankingScore(item: FeedItem): number {
    let score = item.engagementScore;

    // Apply time decay
    score = applyTimeDecay(score, item.createdAt, item.type);

    // Apply embed boost
    score = applyEmbedBoost(score, item.embedCount);

    // Apply new user boost
    score = applyNewUserBoost(score, item.isNew);

    return score;
}

/**
 * First-screen ordering:
 * 1. Campus Update (if active)
 * 2. Engagement anchor (meme/poll with highest score)
 * 3. Utility injection (note/article)
 * 4. Social posts
 * 5. Personal utility (timetable)
 * 6. Poll
 * 7. Infinite scroll
 */
export function applyFirstScreenOrdering(items: FeedItem[]): FeedItem[] {
    const ordered: FeedItem[] = [];
    const remaining = [...items];

    // 1. Campus Update (always first if present)
    const updateIndex = remaining.findIndex((item) => item.type === 'campus_update');
    if (updateIndex !== -1) {
        ordered.push(...remaining.splice(updateIndex, 1));
    }

    // 2. Engagement anchor (highest-scoring meme or poll)
    const anchors = remaining.filter((item) => item.type === 'meme' || item.type === 'poll');
    if (anchors.length > 0) {
        anchors.sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
        const topAnchor = anchors[0];
        const anchorIndex = remaining.indexOf(topAnchor);
        ordered.push(...remaining.splice(anchorIndex, 1));
    }

    // 3. Utility injection (top article or note)
    const utilities = remaining.filter((item) => item.type === 'article' || item.type === 'note');
    if (utilities.length > 0) {
        utilities.sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
        const topUtility = utilities[0];
        const utilityIndex = remaining.indexOf(topUtility);
        ordered.push(...remaining.splice(utilityIndex, 1));
    }

    // 4-7. Sort remaining by score
    remaining.sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
    ordered.push(...remaining);

    return ordered;
}

/**
 * Apply utility injection throughout feed
 * Inject utility content every 3-4 items max
 */
export function injectUtilityContent(items: FeedItem[]): FeedItem[] {
    const result: FeedItem[] = [];
    const utilities: FeedItem[] = [];
    const nonUtilities: FeedItem[] = [];

    // Separate utility and non-utility content
    items.forEach((item) => {
        if (item.type === 'article' || item.type === 'note') {
            utilities.push(item);
        } else {
            nonUtilities.push(item);
        }
    });

    // Inject utilities every 3-4 items
    let utilityIndex = 0;
    let itemsSinceLastUtility = 0;

    for (const item of nonUtilities) {
        result.push(item);
        itemsSinceLastUtility++;

        // Inject utility every 3-4 items (random for variation)
        const injectionThreshold = Math.random() > 0.5 ? 3 : 4;
        if (
            itemsSinceLastUtility >= injectionThreshold &&
            utilityIndex < utilities.length
        ) {
            result.push(utilities[utilityIndex]);
            utilityIndex++;
            itemsSinceLastUtility = 0;
        }
    }

    // Add any remaining utilities at the end
    if (utilityIndex < utilities.length) {
        result.push(...utilities.slice(utilityIndex));
    }

    return result;
}

/**
 * Main feed ranking function
 * Combines first-screen ordering, time decay, embed boost, and utility injection
 */
export function rankFeed(items: FeedItem[]): FeedItem[] {
    // Apply scores to all items
    const scoredItems = items.map((item) => ({
        ...item,
        _rankingScore: calculateRankingScore(item),
    }));

    // Apply first-screen ordering
    const ordered = applyFirstScreenOrdering(scoredItems);

    // Apply utility injection for items after first screen
    const firstScreen = ordered.slice(0, 7); // First ~7 items
    const restOfFeed = ordered.slice(7);
    const injected = injectUtilityContent(restOfFeed);

    return [...firstScreen, ...injected];
}
