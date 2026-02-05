import { prisma } from '../../../config/db';

// ============================================
// TYPES
// ============================================

export interface EligibilityRequirement {
    met: boolean;
    current: number;
    required?: number;
    max?: number;
}

export interface EligibilityResult {
    eligible: boolean;
    requirements: {
        accountAge: EligibilityRequirement;
        reputation: EligibilityRequirement;
        completedActions: EligibilityRequirement;
        reports: EligibilityRequirement;
        goodStanding: { met: boolean; hasActiveBan: boolean };
    };
    canCreate: boolean;
    existingShopCount: number;
    maxShops: number;
}

export interface CreateShopData {
    campusId: string;
    ownerUserId: string;
    name: string;
    description: string;
    category: string;
}

// ============================================
// ELIGIBILITY GATES (NON-NEGOTIABLE)
// ============================================

const ELIGIBILITY_GATES = {
    ACCOUNT_AGE_DAYS: 30,
    REPUTATION_SCORE: 300,
    COMPLETED_ACTIONS: 10,
    MAX_REPORTS: 3,
    MAX_SHOPS_PER_USER: 1, // Phase 1: limit to 1 shop
};

// ============================================
// SHOP SERVICE
// ============================================

export class ShopService {
    /**
     * Check if a user is eligible to create a shop
     * RULE: All gates must pass for eligibility
     */
    async checkEligibility(userId: string): Promise<EligibilityResult> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                shops: {
                    where: {
                        status: { not: 'closed' }, // Only count active/suspended shops
                    },
                },
                reports: {
                    where: {
                        reportedUserId: userId,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Calculate account age in days
        const accountAgeDays = Math.floor(
            (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Build requirements object
        const requirements = {
            accountAge: {
                met: accountAgeDays >= ELIGIBILITY_GATES.ACCOUNT_AGE_DAYS,
                current: accountAgeDays,
                required: ELIGIBILITY_GATES.ACCOUNT_AGE_DAYS,
            },
            reputation: {
                met: user.reputationScore >= ELIGIBILITY_GATES.REPUTATION_SCORE,
                current: user.reputationScore,
                required: ELIGIBILITY_GATES.REPUTATION_SCORE,
            },
            completedActions: {
                met: user.completedActions >= ELIGIBILITY_GATES.COMPLETED_ACTIONS,
                current: user.completedActions,
                required: ELIGIBILITY_GATES.COMPLETED_ACTIONS,
            },
            reports: {
                met: user.reports.length < ELIGIBILITY_GATES.MAX_REPORTS,
                current: user.reports.length,
                max: ELIGIBILITY_GATES.MAX_REPORTS,
            },
            goodStanding: {
                met: user.status !== 'banned',
                hasActiveBan: user.status === 'banned',
            },
        };

        // Check if ALL requirements are met
        const eligible =
            requirements.accountAge.met &&
            requirements.reputation.met &&
            requirements.completedActions.met &&
            requirements.reports.met &&
            requirements.goodStanding.met;

        const existingShopCount = user.shops.length;
        const canCreate = eligible && existingShopCount < ELIGIBILITY_GATES.MAX_SHOPS_PER_USER;

        return {
            eligible,
            requirements,
            canCreate,
            existingShopCount,
            maxShops: ELIGIBILITY_GATES.MAX_SHOPS_PER_USER,
        };
    }

    /**
     * Create a new shop (GATED)
     * RULE: Eligibility must be checked server-side
     */
    async createShop(data: CreateShopData) {
        // Server-side eligibility check (CRITICAL)
        const eligibility = await this.checkEligibility(data.ownerUserId);

        if (!eligibility.canCreate) {
            throw new Error('User is not eligible to create a shop');
        }

        // Get user's current reputation for snapshot
        const user = await prisma.user.findUnique({
            where: { id: data.ownerUserId },
            select: { reputationScore: true },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Create shop with reputation snapshot
        const shop = await prisma.shop.create({
            data: {
                campusId: data.campusId,
                ownerUserId: data.ownerUserId,
                name: data.name,
                description: data.description,
                category: data.category,
                reputationSnapshot: user.reputationScore,
                status: 'active',
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        reputationScore: true,
                    },
                },
            },
        });

        return shop;
    }

    /**
     * Get shop by ID
     */
    async getShopById(shopId: string, campusId: string) {
        const shop = await prisma.shop.findFirst({
            where: {
                id: shopId,
                campusId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        reputationScore: true,
                    },
                },
                listings: {
                    where: { status: 'active' },
                    take: 10,
                },
            },
        });

        if (!shop) {
            throw new Error('Shop not found');
        }

        return shop;
    }

    /**
     * Update shop (owner only)
     */
    async updateShop(
        shopId: string,
        userId: string,
        updates: { name?: string; description?: string; category?: string }
    ) {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.ownerUserId !== userId) {
            throw new Error('Only the shop owner can update the shop');
        }

        if (shop.status === 'closed') {
            throw new Error('Cannot update a closed shop');
        }

        return prisma.shop.update({
            where: { id: shopId },
            data: updates,
        });
    }

    /**
     * Suspend shop (moderator only)
     * RULE: Shop suspension reduces owner reputation
     */
    async suspendShop(shopId: string, moderatorId: string, reason: string) {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.status === 'suspended') {
            throw new Error('Shop is already suspended');
        }

        // Update shop status
        const updatedShop = await prisma.shop.update({
            where: { id: shopId },
            data: { status: 'suspended' },
        });

        // Reduce owner reputation (PENALTY)
        await prisma.user.update({
            where: { id: shop.ownerUserId },
            data: {
                reputationScore: {
                    decrement: 50,
                },
            },
        });

        // TODO: Log moderation action
        // await prisma.moderationLog.create({ ... });

        return updatedShop;
    }

    /**
     * Restore shop (moderator only)
     */
    async restoreShop(shopId: string, moderatorId: string) {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.status !== 'suspended') {
            throw new Error('Only suspended shops can be restored');
        }

        return prisma.shop.update({
            where: { id: shopId },
            data: { status: 'active' },
        });
    }

    /**
     * Close shop (permanent)
     * RULE: Shop closure is irreversible without admin action
     */
    async closeShop(shopId: string, userId: string) {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new Error('Shop not found');
        }

        if (shop.ownerUserId !== userId) {
            throw new Error('Only the shop owner can close the shop');
        }

        return prisma.shop.update({
            where: { id: shopId },
            data: { status: 'closed' },
        });
    }
}

export const shopService = new ShopService();
