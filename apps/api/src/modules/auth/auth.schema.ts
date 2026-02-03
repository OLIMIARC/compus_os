import { z } from 'zod';
import { isValidEmail, isValidPhone, isValidPassword } from '../../lib/utils';

// Register Schema
export const RegisterSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z
        .string()
        .optional()
        .refine((val) => !val || isValidEmail(val), 'Invalid email format'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || isValidPhone(val), 'Invalid phone format (use 07XXXXXXXX or 2567XXXXXXXX)'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .refine(isValidPassword, 'Password must contain uppercase, lowercase, and numbers'),
    campus_id: z.string().min(1, 'Campus ID is required'),
})
    .refine((data) => data.email || data.phone, {
        message: 'Either email or phone is required',
        path: ['email'],
    });

// Login Schema  
export const LoginSchema = z.object({
    email_or_phone: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
});

// Update Profile Schema
export const UpdateProfileSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
        .optional(),
    campus_id: z.string().optional(),
});

// Types
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
