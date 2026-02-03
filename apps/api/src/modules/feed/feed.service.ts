import { prisma } from '../../config/db';
import { createError } from '../../lib/utils';
import { calculatePagination, buildPaginationMeta } from '../../lib/pagination';
import { generateId } from '../../lib/ids';
import { updateReputation } from '../../lib/reputation';
import { parseContentForEmbeds, validateEmbed, detectSelfEmbedAbuse } from '../../lib/embedParser';
import { rankFeed, FeedItem } from '../../lib/feedRanking';
import type {
    CreatePostInput,
    CreateCommentInput,
    CreatePollInput,
    VoteInput,
    RepostInput,
    FeedQuery,
} from './feed.schema';

/**
 * Generate anonymous handle (e.g., "BlueBird123")
 */
function generateAnonymousHandle(): string {
    const adjectives = ['Blue', 'Red', 'Green', 'Golden', 'Silver', 'Dark', 'Bright', 'Swift', 'Silent', 'Wise'];
    const nouns = ['Bird', 'Fox', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Owl', 'Hawk', 'Deer'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    return `${adj}${noun}${num}`;
}

/**
 * Calculate engagement score for a post
 */
function calculateEngagementScore(
    likesCount: number,
    commentsCount: number,
    embedCount: number,
    createdAt: Date
): number {
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    // Base engagement
    const engagement = likesCount * 1 + commentsCount * 2 + embedCount * 5;

    // Time decay
    const decayFactor = 1 / (1 + hoursSinceCreation * 0.1);

    return engagement * decayFactor;
}

/**
 * Get feed posts with intelligent ranking
 */
export async function getFeed(query: FeedQuery, userCampusId?: string, userId?: string) {
    const { skip, take, page, pageSize } = calculatePagination({
        page: query.page,
        pageSize: query.pageSize || 20,
    });

    // Build where clause
    const where: any = {
        status: 'active',
    };

    // Campus scoping
    if (userCampusId) {
        where.campusId = userCampusId;
    } else if (query.campus_id) {
        where.campusId = query.campus_id;
    }

    // Filter by type
    if (query.type !== 'all') {
        where.postType = query.type;
    }

    // Get posts
    const [posts, total] = await Promise.all([
        prisma.feedPost.findMany({
            where,
            take: take * 2, // Get more for ranking
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        reputationScore: true,
                        createdAt: true,
                    },
                },
                poll: {
                    include: {
                        options: true,
                    },
                },
            },
            orderBy: query.sort === 'latest' ? { createdAt: 'desc' } : undefined,
        }),
        prisma.feedPost.count({ where }),
    ]);

    // Apply intelligent ranking if sort is 'hot' or 'top'
    let rankedPosts = posts;

    if (query.sort === 'hot') {
        // Convert to FeedItem format for ranking
        const feedItems: FeedItem[] = posts.map(post => ({
            id: post.id,
            type: post.postType === 'image' ? 'meme' : post.postType === 'poll' ? 'poll' : 'social_post',
            createdAt: post.createdAt,
            engagementScore: post.engagementScore,
            embedCount: post.embedCount,
            isNew: (Date.now() - post.author.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000, // < 7 days
        }));

        const ranked = rankFeed(feedItems);
        const rankedIds = ranked.map(item => item.id);
        rankedPosts = rankedIds.map(id => posts.find(p => p.id === id)!).filter(Boolean);
    } else if (query.sort === 'top') {
        rankedPosts = [...posts].sort((a, b) =>
            (b.likesCount + b.commentsCount * 2) - (a.likesCount + a.commentsCount * 2)
        );
    }

    // Paginate after ranking
    const paginatedPosts = rankedPosts.slice(0, take);

    // Format response
    const data = paginatedPosts.map(post => ({
        id: post.id,
        campus_id: post.campusId,
        post_type: post.postType,
        title: post.title,
        body: post.body,
        is_anonymous: post.isAnonymous,
        anonymous_handle: post.anonymousHandle,
        author: post.isAnonymous ? undefined : {
            id: post.author.id,
            full_name: post.author.fullName,
        },
        image_path: post.imageWatermarkedPath || post.imagePath,
        stats: {
            likes: post.likesCount,
            comments: post.commentsCount,
        },
        poll: post.poll ? {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map(opt => ({
                id: opt.id,
                text: opt.optionText,
                votes: opt.votesCount,
            })),
        } : undefined,
        created_at: post.createdAt,
    }));

    const meta = buildPaginationMeta(page, pageSize, total);

    return { data, meta };
}

/**
 * Get single post by ID
 */
export async function getPostById(postId: string) {
    const post = await prisma.feedPost.findUnique({
        where: { id: postId },
        include: {
            author: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            poll: {
                include: {
                    options: true,
                },
            },
        },
    });

    if (!post) {
        throw createError('POST_NOT_FOUND', 'Post not found', 404);
    }

    return {
        id: post.id,
        campus_id: post.campusId,
        post_type: post.postType,
        title: post.title,
        body: post.body,
        is_anonymous: post.isAnonymous,
        anonymous_handle: post.anonymousHandle,
        author: post.isAnonymous ? undefined : {
            id: post.author.id,
            full_name: post.author.fullName,
        },
        image_path: post.imageWatermarkedPath || post.imagePath,
        stats: {
            likes: post.likesCount,
            comments: post.commentsCount,
        },
        poll: post.poll ? {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map(opt => ({
                id: opt.id,
                text: opt.optionText,
                votes: opt.votesCount,
            })),
        } : undefined,
        created_at: post.createdAt,
    };
}

/**
 * Create a new post
 */
export async function createPost(userId: string, campusId: string, data: CreatePostInput) {
    // Check for content embeds
    const embedLink = parseContentForEmbeds(data.body);

    if (embedLink) {
        // Validate embed
        const validation = await validateEmbed(
            'post',
            'temp', // Will be updated after creation
            embedLink.type,
            embedLink.id,
            campusId,
            data.body
        );

        if (!validation.valid) {
            throw createError('INVALID_EMBED', validation.error!, 400);
        }

        // Check for self-embed abuse
        const isAbuse = await detectSelfEmbedAbuse(userId, embedLink.type, embedLink.id);
        if (isAbuse) {
            throw createError(
                'EMBED_ABUSE',
                'This reference has been used too often.',
                429
            );
        }
    }

    // Generate anonymous handle if needed
    const anonymousHandle = data.is_anonymous ? generateAnonymousHandle() : null;

    // Create post
    const post = await prisma.feedPost.create({
        data: {
            id: generateId('fp'),
            campusId: data.campus_id,
            authorUserId: userId,
            postType: data.post_type,
            title: data.title,
            body: data.body,
            isAnonymous: data.is_anonymous,
            anonymousHandle,
            status: 'active',
        },
    });

    // Create embed record if present
    if (embedLink) {
        await prisma.contentEmbed.create({
            data: {
                id: generateId('ce'),
                sourceType: 'post',
                sourceId: post.id,
                embeddedType: embedLink.type,
                embeddedId: embedLink.id,
                embeddedCampusId: campusId,
                createdByUserId: userId,
            },
        });

        // Update embed count on post
        await prisma.feedPost.update({
            where: { id: post.id },
            data: { embedCount: 1 },
        });
    }

    return { id: post.id };
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string, page: number = 1, pageSize: number = 50) {
    const { skip, take } = calculatePagination({ page, pageSize });

    const [comments, total] = await Promise.all([
        prisma.feedComment.findMany({
            where: { postId },
            skip,
            take,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.feedComment.count({ where: { postId } }),
    ]);

    const data = comments.map(comment => ({
        id: comment.id,
        post_id: comment.postId,
        body: comment.body,
        is_anonymous: comment.isAnonymous,
        anonymous_handle: comment.anonymousHandle,
        author: comment.isAnonymous ? undefined : {
            id: comment.author.id,
            full_name: comment.author.fullName,
        },
        created_at: comment.createdAt,
    }));

    const meta = buildPaginationMeta(page, pageSize, total);

    return { data, meta };
}

/**
 * Create a comment on a post
 */
export async function createComment(userId: string, postId: string, data: CreateCommentInput) {
    const post = await prisma.feedPost.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw createError('POST_NOT_FOUND', 'Post not found', 404);
    }

    const anonymousHandle = data.is_anonymous ? generateAnonymousHandle() : null;

    const comment = await prisma.feedComment.create({
        data: {
            id: generateId('fc'),
            postId,
            authorUserId: userId,
            body: data.body,
            isAnonymous: data.is_anonymous,
            anonymousHandle,
        },
    });

    // Update comment count and engagement score
    await prisma.feedPost.update({
        where: { id: postId },
        data: {
            commentsCount: { increment: 1 },
            engagementScore: calculateEngagementScore(
                post.likesCount,
                post.commentsCount + 1,
                post.embedCount,
                post.createdAt
            ),
        },
    });

    return { id: comment.id };
}

/**
 * Toggle reaction (like) on a post
 */
export async function toggleReaction(userId: string, postId: string) {
    const post = await prisma.feedPost.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw createError('POST_NOT_FOUND', 'Post not found', 404);
    }

    // Check if already liked
    const existing = await prisma.feedReaction.findUnique({
        where: {
            postId_userId: { postId, userId },
        },
    });

    let liked = false;

    if (existing) {
        // Unlike
        await prisma.feedReaction.delete({
            where: { id: existing.id },
        });

        await prisma.feedPost.update({
            where: { id: postId },
            data: {
                likesCount: { decrement: 1 },
                engagementScore: calculateEngagementScore(
                    post.likesCount - 1,
                    post.commentsCount,
                    post.embedCount,
                    post.createdAt
                ),
            },
        });

        // Decrease reputation
        await updateReputation({
            type: 'like',
            userId: post.authorUserId,
        });

        liked = false;
    } else {
        // Like
        await prisma.feedReaction.create({
            data: {
                id: generateId('fr'),
                postId,
                userId,
                reactionType: 'like',
            },
        });

        await prisma.feedPost.update({
            where: { id: postId },
            data: {
                likesCount: { increment: 1 },
                engagementScore: calculateEngagementScore(
                    post.likesCount + 1,
                    post.commentsCount,
                    post.embedCount,
                    post.createdAt
                ),
            },
        });

        // Increase reputation
        await updateReputation({
            type: 'like',
            userId: post.authorUserId,
        });

        liked = true;
    }

    return { post_id: postId, liked };
}

/**
 * Create a poll on a post
 */
export async function createPoll(postId: string, data: CreatePollInput) {
    const post = await prisma.feedPost.findUnique({
        where: { id: postId },
    });

    if (!post || post.postType !== 'poll') {
        throw createError('INVALID_POST_TYPE', 'Post must be of type poll', 400);
    }

    // Check if poll already exists
    const existingPoll = await prisma.poll.findUnique({
        where: { postId },
    });

    if (existingPoll) {
        throw createError('POLL_EXISTS', 'Poll already exists for this post', 400);
    }

    // Create poll with options
    const poll = await prisma.poll.create({
        data: {
            id: generateId('pl'),
            postId,
            question: data.question,
            options: {
                create: data.options.map(text => ({
                    id: generateId('po'),
                    optionText: text,
                    votesCount: 0,
                })),
            },
        },
        include: {
            options: true,
        },
    });

    return {
        poll: {
            id: poll.id,
            post_id: postId,
            question: poll.question,
            options: poll.options.map(opt => ({
                id: opt.id,
                text: opt.optionText,
            })),
        },
    };
}

/**
 * Vote on a poll
 */
export async function votePoll(userId: string, postId: string, data: VoteInput) {
    const poll = await prisma.poll.findUnique({
        where: { postId },
        include: { options: true },
    });

    if (!poll) {
        throw createError('POLL_NOT_FOUND', 'Poll not found', 404);
    }

    const option = poll.options.find(opt => opt.id === data.option_id);
    if (!option) {
        throw createError('OPTION_NOT_FOUND', 'Poll option not found', 404);
    }

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
        where: {
            pollId_userId: { pollId: poll.id, userId },
        },
    });

    if (existingVote) {
        // Update vote
        await prisma.pollVote.update({
            where: { id: existingVote.id },
            data: { optionId: data.option_id },
        });

        // Update vote counts
        await prisma.pollOption.update({
            where: { id: existingVote.optionId },
            data: { votesCount: { decrement: 1 } },
        });

        await prisma.pollOption.update({
            where: { id: data.option_id },
            data: { votesCount: { increment: 1 } },
        });
    } else {
        // Create new vote
        await prisma.pollVote.create({
            data: {
                id: generateId('pv'),
                pollId: poll.id,
                optionId: data.option_id,
                userId,
            },
        });

        await prisma.pollOption.update({
            where: { id: data.option_id },
            data: { votesCount: { increment: 1 } },
        });
    }

    return { voted: true };
}

/**
 * Repost to your campus
 */
export async function repostToCampus(userId: string, campusId: string, data: RepostInput) {
    const originalPost = await prisma.feedPost.findUnique({
        where: { id: data.original_post_id },
    });

    if (!originalPost) {
        throw createError('POST_NOT_FOUND', 'Original post not found', 404);
    }

    // Check if already reposted
    const existing = await prisma.feedRepost.findFirst({
        where: {
            originalPostId: data.original_post_id,
            userId,
            campusId,
        },
    });

    if (existing) {
        throw createError('ALREADY_REPOSTED', 'You have already reposted this', 400);
    }

    // Create repost
    const repost = await prisma.feedRepost.create({
        data: {
            id: generateId('frp'),
            originalPostId: data.original_post_id,
            userId,
            campusId,
        },
    });

    return { id: repost.id };
}
