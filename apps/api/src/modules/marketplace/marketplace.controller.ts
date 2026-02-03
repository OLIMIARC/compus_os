import { Request, Response, NextFunction } from 'express';
import { marketplaceService } from './marketplace.service';
import { CreateListingSchema, UpdateListingSchema, ListingFiltersSchema } from './marketplace.schema';
import { AppError } from '../../lib/utils';

class MarketplaceController {
    /**
     * GET /api/v1/marketplace
     * Get all listings with filters
     */
    async getListings(req: Request, res: Response, next: NextFunction) {
        try {
            const campusId = req.query.campus_id as string;
            if (!campusId) {
                throw new AppError('MISSING_PARAMETER', 'campus_id is required', 400);
            }

            const filters = ListingFiltersSchema.parse({
                category: req.query.category,
                subcategory: req.query.subcategory,
                listingType: req.query.listing_type,
                minPrice: req.query.min_price ? parseInt(req.query.min_price as string) : undefined,
                maxPrice: req.query.max_price ? parseInt(req.query.max_price as string) : undefined,
                condition: req.query.condition,
                search: req.query.search,
                sort: req.query.sort || 'newest',
            });

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await marketplaceService.getListings(campusId, filters, page, limit);

            res.json({
                ok: true,
                data: result.listings,
                meta: result.meta,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/marketplace/:id
     * Get single listing
     */
    async getListingById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const campusId = req.query.campus_id as string;

            if (!campusId) {
                throw new AppError('MISSING_PARAMETER', 'campus_id is required', 400);
            }

            const listing = await marketplaceService.getListingById(id, campusId);

            // Increment view count (fire and forget)
            marketplaceService.incrementViews(id).catch(() => { });

            res.json({
                ok: true,
                data: listing,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/marketplace
     * Create new listing
     */
    async createListing(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const campusId = (req as any).user.campusId;

            const data = CreateListingSchema.parse(req.body);

            const listing = await marketplaceService.createListing(userId, campusId, data);

            res.status(201).json({
                ok: true,
                data: listing,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/marketplace/:id
     * Update listing
     */
    async updateListing(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            const campusId = (req as any).user.campusId;

            const data = UpdateListingSchema.parse(req.body);

            const listing = await marketplaceService.updateListing(id, userId, campusId, data);

            res.json({
                ok: true,
                data: listing,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/marketplace/:id
     * Delete listing
     */
    async deleteListing(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            const campusId = (req as any).user.campusId;

            await marketplaceService.deleteListing(id, userId, campusId);

            res.json({
                ok: true,
                message: 'Listing deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/marketplace/:id/mark-sold
     * Mark listing as sold
     */
    async markAsSold(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = (req as any).user.userId;
            const campusId = (req as any).user.campusId;

            await marketplaceService.markAsSold(id, userId, campusId);

            res.json({
                ok: true,
                message: 'Listing marked as sold',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const marketplaceController = new MarketplaceController();
