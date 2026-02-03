import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as feedService from './feed.service';
import { FeedQuerySchema } from './feed.schema';

/**
 * GET /api/v1/feed
 */
export const getFeedHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = FeedQuerySchema.parse(req.query);
    const { data, meta } = await feedService.getFeed(
        query,
        req.user?.campusId,
        req.user?.id
    );
    sendSuccess(res, data, meta);
});

/**
 * GET /api/v1/feed/:post_id
 */
export const getPostHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.getPostById(req.params.post_id);
    sendSuccess(res, result);
});

/**
 * POST /api/v1/feed
 */
export const createPostHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.createPost(
        req.user!.id,
        req.user!.campusId,
        req.body
    );
    sendSuccess(res, result, undefined, 201);
});

/**
 * GET /api/v1/feed/:post_id/comments
 */
export const getCommentsHandler = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;

    const { data, meta } = await feedService.getComments(
        req.params.post_id,
        page,
        pageSize
    );
    sendSuccess(res, data, meta);
});

/**
 * POST /api/v1/feed/:post_id/comments
 */
export const createCommentHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.createComment(
        req.user!.id,
        req.params.post_id,
        req.body
    );
    sendSuccess(res, result, undefined, 201);
});

/**
 * POST /api/v1/feed/:post_id/reactions
 */
export const toggleReactionHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.toggleReaction(req.user!.id, req.params.post_id);
    sendSuccess(res, result);
});

/**
 * POST /api/v1/feed/:post_id/poll
 */
export const createPollHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.createPoll(req.params.post_id, req.body);
    sendSuccess(res, result, undefined, 201);
});

/**
 * POST /api/v1/feed/:post_id/poll/vote
 */
export const votePollHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.votePoll(
        req.user!.id,
        req.params.post_id,
        req.body
    );
    sendSuccess(res, result);
});

/**
 * POST /api/v1/feed/:post_id/repost
 */
export const repostHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await feedService.repostToCampus(
        req.user!.id,
        req.user!.campusId,
        { original_post_id: req.params.post_id }
    );
    sendSuccess(res, result, undefined, 201);
});
