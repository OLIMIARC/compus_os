import { z } from 'zod';

// Categories and subcategories
export const MARKETPLACE_CATEGORIES = {
    academics: ['textbooks', 'study_materials', 'past_papers', 'digital_resources'],
    electronics: ['laptops', 'phones', 'calculators', 'audio', 'gaming'],
    dorm: ['furniture', 'appliances', 'kitchen', 'decor'],
    services: ['tutoring', 'design', 'tech_support', 'photography', 'other'],
    personal: ['clothing', 'sports', 'tickets', 'art'],
    transport: ['bikes', 'scooters', 'rides', 'other'],
} as const;

export const LISTING_TYPES = ['for_sale', 'for_rent', 'service', 'wanted', 'free'] as const;
export const LISTING_CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const;
export const LISTING_STATUSES = ['active', 'sold', 'expired', 'removed'] as const;

// Base schema without refinements for partial updates
const BaseListingSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
    category: z.enum(Object.keys(MARKETPLACE_CATEGORIES) as [string, ...string[]]),
    subcategory: z.string().optional(),
    listingType: z.enum(LISTING_TYPES),
    priceUgx: z.number().int().min(0).optional().nullable(),
    isNegotiable: z.boolean().optional(),
    condition: z.enum(LISTING_CONDITIONS).optional().nullable(),
    images: z.array(z.string()).max(5).optional(),
    meetsLocation: z.string().max(200).optional(),
});

// Create Listing Schema with validations
export const CreateListingSchema = BaseListingSchema.refine(
    (data) => {
        // Price required for for_sale and for_rent
        if (['for_sale', 'for_rent'].includes(data.listingType)) {
            return data.priceUgx !== null && data.priceUgx !== undefined && data.priceUgx > 0;
        }
        return true;
    },
    {
        message: 'Price is required for sale and rent listings',
        path: ['priceUgx'],
    }
).refine(
    (data) => {
        // Condition required for physical goods (not services)
        if (data.listingType !== 'service' && data.category !== 'services') {
            return data.condition !== null && data.condition !== undefined;
        }
        return true;
    },
    {
        message: 'Condition is required for non-service items',
        path: ['condition'],
    }
);

// Update Listing Schema
export const UpdateListingSchema = BaseListingSchema.partial().extend({
    status: z.enum(LISTING_STATUSES).optional(),
});

// Search/Filter Schema
export const ListingFiltersSchema = z.object({
    category: z.string().optional(),
    subcategory: z.string().optional(),
    listingType: z.enum(LISTING_TYPES).optional(),
    minPrice: z.number().int().min(0).optional(),
    maxPrice: z.number().int().min(0).optional(),
    condition: z.enum(LISTING_CONDITIONS).optional(),
    search: z.string().optional(), // search in title/description
    sort: z.enum(['newest', 'price_low', 'price_high', 'views']).optional().default('newest'),
});

// Types
export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
export type ListingFilters = z.infer<typeof ListingFiltersSchema>;
