import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as moderationService from './moderation.service';

export const takeModerationActionHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await moderationService.takeModerationAction(req.user!.id, req.body);
    sendSuccess(res, result);
});
