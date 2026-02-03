import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as articlesService from './articles.service';
import { ArticleQuerySchema } from './articles.schema';

export const getArticlesHandler = asyncHandler(async (req: Request, res: Response) => {
    const query = ArticleQuerySchema.parse(req.query);
    const { data, meta } = await articlesService.getArticles(query, req.user?.campusId);
    sendSuccess(res, data, meta);
});

export const getArticleHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await articlesService.getArticleById(req.params.id, req.user?.id);
    sendSuccess(res, result);
});

export const createArticleHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await articlesService.createArticle(req.user!.id, req.body);
    sendSuccess(res, result, undefined, 201);
});

export const trackCompletionHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await articlesService.trackCompletion(req.user!.id, req.params.id);
    sendSuccess(res, result);
});
