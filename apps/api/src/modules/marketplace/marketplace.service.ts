import { prisma } from '../../config/db';
import { AppError } from '../../lib/utils';
import type { CreateListingInput, UpdateListingInput, ListingFilters } from './marketplace.schema';

class MarketplaceService {
    /**
     * Get all listings with filters and campus scoping
     */
    async getListings(campusId: string, filters: ListingFilters, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            campusId,
            status: 'active', // only show active listings
        };

        if (filters.category) where.category = filters.category;
        if (filters.subcategory) where.subcategory = filters.subcategory;
        if (filters.listingType) where.listingType = filters.listingType;
        if (filters.condition) where.condition = filters.condition;

        // Price range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.priceUgx = {};
            if (filters.minPrice !== undefined) where.priceUgx.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) where.priceUgx.lte = filters.maxPrice;
        }

        // Search in title and description
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        // Sort
        let orderBy: any = {};
        switch (filters.sort) {
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'price_low':
                orderBy = { priceUgx: 'asc' };
                break;
            case 'price_high':
                orderBy = { priceUgx: 'desc' };
                break;
            case 'views':
                orderBy = { viewsCount: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        const [listings, total] = await Promise.all([
            prisma.marketplaceListing.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    seller: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            reputationScore: true,
                        },
                    },
                },
            }),
            prisma.marketplaceListing.count({ where }),
        ]);

        // Parse images JSON
        const listingsWithImages = listings.map((listing) => ({
            ...listing,
            images: JSON.parse(listing.images || '[]'),
        }));

        return {
            listings: listingsWithImages,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single listing by ID
     */
    async getListingById(id: string, campusId: string) {
        const listing = await prisma.marketplaceListing.findFirst({
            where: { id, campusId },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        reputationScore: true,
                        createdAt: true,
                    },
                },
                reviews: {
                    include: {
                        reviewer: {
                            select: {
                                fullName: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!listing) {
            throw new AppError('NOT_FOUND', 'Listing not found', 404);
        }

        // Parse images
        return {
            ...listing,
            images: JSON.parse(listing.images || '[]'),
        };
    }

    /**
     * Create new listing
     */
    async createListing(userId: string, campusId: string, data: CreateListingInput) {
        // Stringify images array
        const imagesJson = JSON.stringify(data.images || []);

        const listing = await prisma.marketplaceListing.create({
            data: {
                sellerId: userId,
                campusId,
                title: data.title,
                description: data.description,
                category: data.category,
                subcategory: data.subcategory,
                listingType: data.listingType,
                priceUgx: data.priceUgx,
                isNegotiable: data.isNegotiable || false,
                condition: data.condition,
                images: imagesJson,
                meetsLocation: data.meetsLocation,
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
            },
        });

        return {
            ...listing,
            images: JSON.parse(listing.images || '[]'),
        };
    }

    /**
     * Update listing (only by owner)
     */
    async updateListing(id: string, userId: string, campusId: string, data: UpdateListingInput) {
        // Check ownership
        const existing = await prisma.marketplaceListing.findFirst({
            where: { id, campusId },
        });

        if (!existing) {
            throw new AppError('NOT_FOUND', 'Listing not found', 404);
        }

        if (existing.sellerId !== userId) {
            throw new AppError('FORBIDDEN', 'You can only edit your own listings', 403);
        }

        // Prepare update data
        const updateData: any = { ...data };
        if (data.images) {
            updateData.images = JSON.stringify(data.images);
        }

        const updated = await prisma.marketplaceListing.update({
            where: { id },
            data: updateData,
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
            },
        });

        return {
            ...updated,
            images: JSON.parse(updated.images || '[]'),
        };
    }

    /**
     * Delete listing (only by owner)
     */
    async deleteListing(id: string, userId: string, campusId: string) {
        // Check ownership
        const existing = await prisma.marketplaceListing.findFirst({
            where: { id, campusId },
        });

        if (!existing) {
            throw new AppError('NOT_FOUND', 'Listing not found', 404);
        }

        if (existing.sellerId !== userId) {
            throw new AppError('FORBIDDEN', 'You can only delete your own listings', 403);
        }

        await prisma.marketplaceListing.delete({ where: { id } });

        return { message: 'Listing deleted successfully' };
    }

    /**
     * Increment view count
     */
    async incrementViews(id: string) {
        await prisma.marketplaceListing.update({
            where: { id },
            data: {
                viewsCount: { increment: 1 },
            },
        });
    }

    /**
     * Mark listing as sold
     */
    async markAsSold(id: string, userId: string, campusId: string) {
        const listing = await prisma.marketplaceListing.findFirst({
            where: { id, campusId },
        });

        if (!listing) {
            throw new AppError('NOT_FOUND', 'Listing not found', 404);
        }

        if (listing.sellerId !== userId) {
            throw new AppError('FORBIDDEN', 'You can only mark your own listings as sold', 403);
        }

        await prisma.marketplaceListing.update({
            where: { id },
            data: { status: 'sold' },
        });

        return { message: 'Listing marked as sold' };
    }
}

export const marketplaceService = new MarketplaceService();
