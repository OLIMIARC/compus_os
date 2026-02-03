import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../lib/utils';
import * as reportsService from './reports.service';

export const createReportHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.createReport(req.user!.id, req.user!.campusId, req.body);
    sendSuccess(res, result, undefined, 201);
});

export const getPendingReportsHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await reportsService.getPendingReports(req.user!.campusId);
    sendSuccess(res, result);
});
