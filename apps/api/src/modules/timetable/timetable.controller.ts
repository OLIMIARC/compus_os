import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as timetableService from './timetable.service';

export const getTimetableHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await timetableService.getTimetable(req.user!.id);
    sendSuccess(res, result);
});

export const createEntryHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await timetableService.createEntry(req.user!.id, req.body);
    sendSuccess(res, result, undefined, 201);
});

export const deleteEntryHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await timetableService.deleteEntry(req.user!.id, req.params.id);
    sendSuccess(res, result);
});
