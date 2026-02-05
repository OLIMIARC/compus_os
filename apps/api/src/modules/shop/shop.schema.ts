import { z } from 'zod';

export const CreateShopSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().min(10).max(500),
    category: z.enum([
        'services',
        'electronics',
        'academics',
        'food',
        'fashion',
        'other',
    ]),
});

export const UpdateShopSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
    category: z
        .enum(['services', 'electronics', 'academics', 'food', 'fashion', 'other'])
        .optional(),
});
