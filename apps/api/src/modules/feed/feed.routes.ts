import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.middleware';
import { campusMiddleware, postRateLimit, commentRateLimit } from '../../middleware/campus.middleware';
import { antiSpamMiddleware } from '../../middleware/antiSpam.middleware';
import {
    CreatePostSchema,
    CreateCommentSchema,
    CreatePollSchema,
    VoteSchema,
    FeedQuerySchema,
} from './feed.schema';
import * as feedController from './feed.controller';

const router = Router();

/**
 * GET /api/v1/feed
 * Public with optional auth
 */
router.get(
    '/',
    optionalAuthMiddleware,
    validate(FeedQuerySchema, 'query'),
    feedController.getFeedHandler
);

/**
 * GET /api/v1/feed/:post_id
 * Public endpoint
 */
router.get('/:post_id', feedController.getPostHandler);

/**
 * POST /api/v1/feed
 * Protected - create post
 */
router.post(
    '/',
    authMiddleware,
    campusMiddleware,
    postRateLimit,
    antiSpamMiddleware, // Only block external URLs, no length restriction
    validate(CreatePostSchema),
    feedController.createPostHandler
);

/**
 * GET /api/v1/feed/:post_id/comments
 * Public endpoint
 */
router.get('/:post_id/comments', feedController.getCommentsHandler);

/**
 * POST /api/v1/feed/:post_id/comments
 * Protected - create comment
 */
router.post(
    '/:post_id/comments',
    authMiddleware,
    commentRateLimit,
    antiSpamMiddleware, // Only block external URLs
    validate(CreateCommentSchema),
    feedController.createCommentHandler
);

/**
 * POST /api/v1/feed/:post_id/reactions
 * Protected - toggle reaction (like)
 */
router.post(
    '/:post_id/reactions',
    authMiddleware,
    feedController.toggleReactionHandler
);

/**
 * POST /api/v1/feed/:post_id/poll
 * Protected - create poll for post
 */
router.post(
    '/:post_id/poll',
    authMiddleware,
    validate(CreatePollSchema),
    feedController.createPollHandler
);

/**
 * POST /api/v1/feed/:post_id/poll/vote
 * Protected - vote on poll
 */
router.post(
    '/:post_id/poll/vote',
    authMiddleware,
    validate(VoteSchema),
    feedController.votePollHandler
);

/**
 * POST /api/v1/feed/:post_id/repost
 * Protected - repost to your campus
 */
router.post('/:post_id/repost', authMiddleware, feedController.repostHandler);

export default router;
