import { Response } from 'express';
import bcrypt from 'bcrypt';
import { authConfig } from '../config/auth';

// ============================================
// RESPONSE FORMATTERS
// ============================================

export interface ApiResponse<T = any> {
    ok: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
    };
}

export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
    return {
        ok: true,
        data,
        ...(meta && { meta }),
    };
}

export function errorResponse(
    code: string,
    message: string,
    details?: any
): ApiResponse {
    return {
        ok: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
}

export function sendSuccess<T>(res: Response, data: T, meta?: any, statusCode: number = 200) {
    return res.status(statusCode).json(successResponse(data, meta));
}

export function sendError(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
) {
    return res.status(statusCode).json(errorResponse(code, message, details));
}

// ============================================
// ERROR CREATORS
// ============================================

export class AppError extends Error {
    constructor(
        public code: string,
        public message: string,
        public statusCode: number = 400,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function createError(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any
): AppError {
    return new AppError(code, message, statusCode, details);
}

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.bcrypt.saltRounds);
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    // Uganda phone format: 2567XXXXXXXX or 07XXXXXXXX
    const phoneRegex = /^(2567\d{8}|07\d{8})$/;
    return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
    if (password.length < authConfig.password.minLength) return false;
    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) return false;
    if (authConfig.password.requireNumbers && !/\d/.test(password)) return false;
    return true;
}

// ============================================
// STRING UTILITIES
// ============================================

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// ============================================
// ASYNC UTILITIES
// ============================================

export function asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
