import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireModerator } from '../../middleware/role.middleware';
import { ModerationActionSchema } from './moderation.schema';
import * as moderationController from './moderation.controller';

const router = Router();

router.post('/action', authMiddleware, requireModerator, validate(ModerationActionSchema), moderationController.takeModerationActionHandler);

export default router;
