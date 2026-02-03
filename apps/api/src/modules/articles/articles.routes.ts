import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.middleware';
import { campusMiddleware } from '../../middleware/campus.middleware';
import { CreateArticleSchema, ArticleQuerySchema } from './articles.schema';
import * as articlesController from './articles.controller';

const router = Router();

router.get('/', optionalAuthMiddleware, validate(ArticleQuerySchema, 'query'), articlesController.getArticlesHandler);
router.get('/:id', optionalAuthMiddleware, articlesController.getArticleHandler);
router.post('/', authMiddleware, campusMiddleware, validate(CreateArticleSchema), articlesController.createArticleHandler);
router.post('/:id/complete', authMiddleware, articlesController.trackCompletionHandler);

export default router;
