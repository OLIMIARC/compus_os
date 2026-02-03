import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as updatesService from './updates.service';

export const getActiveUpdateHandler = asyncHandler(async (req: Request, res: Response) => {
    const campusId = req.query.campus_id as string || req.user?.campusId;
    const result = await updatesService.getActiveUpdate(campusId!);
    sendSuccess(res, result);
});

export const createUpdateHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await updatesService.createUpdate(req.user!.id, req.body);
    sendSuccess(res, result, undefined, 201);
});

export const expireUpdateHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await updatesService.expireUpdate(req.user!.id, req.params.id);
    sendSuccess(res, result);
});

export const reactHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await updatesService.reactToUpdate(req.params.id);
    sendSuccess(res, result);
});
