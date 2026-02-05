import { Request, Response, NextFunction } from 'express';
import { shopService } from './shop.service';
import { CreateShopSchema, UpdateShopSchema } from './shop.schema';
import { AppError } from '../../lib/utils';

class ShopController {
    /**
     * GET /api/v1/shops/eligibility
     * Check if user is eligible to create a shop
     */
    async getEligibility(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const eligibility = await shopService.checkEligibility(userId);

            res.json({
                ok: true,
                data: eligibility,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/shops
     * Create a new shop (GATED)
     */
    async createShop(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const campusId = req.user!.campusId;

            const data = CreateShopSchema.parse(req.body);

            const shop = await shopService.createShop({
                ...data,
                campusId,
                ownerUserId: userId,
            });

            res.status(201).json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/shops/:id
     * Get shop details
     */
    async getShopById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const campusId = req.query.campus_id as string;

            if (!campusId) {
                throw new AppError('MISSING_PARAMETER', 'campus_id is required', 400);
            }

            const shop = await shopService.getShopById(id, campusId);

            res.json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/shops/:id
     * Update shop (owner only)
     */
    async updateShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            const updates = UpdateShopSchema.parse(req.body);

            const shop = await shopService.updateShop(id, userId, updates);

            res.json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/shops/:id/suspend
     * Suspend shop (moderator only)
     */
    async suspendShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const moderatorId = req.user!.id;
            const { reason } = req.body;

            if (!reason) {
                throw new AppError('MISSING_PARAMETER', 'reason is required', 400);
            }

            const shop = await shopService.suspendShop(id, moderatorId, reason);

            res.json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/shops/:id/restore
     * Restore shop (moderator only)
     */
    async restoreShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const moderatorId = req.user!.id;

            const shop = await shopService.restoreShop(id, moderatorId);

            res.json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/shops/:id/close
     * Close shop (owner only, permanent)
     */
    async closeShop(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            const shop = await shopService.closeShop(id, userId);

            res.json({
                ok: true,
                data: shop,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const shopController = new ShopController();
