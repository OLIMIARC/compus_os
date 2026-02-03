import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { authConfig } from '../../config/auth';
import { hashPassword, comparePassword, createError } from '../../lib/utils';
import { generateId } from '../../lib/ids';
import type { RegisterInput, LoginInput, UpdateProfileInput } from './auth.schema';

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        full_name: string;
        email?: string;
        phone?: string;
        campus_id: string;
        roles: string[];
        status: string;
        username?: string;
    };
}

/**
 * Generate JWT token for user
 */
function generateToken(userId: string): string {
    return jwt.sign(
        { userId },
        authConfig.jwt.secret,
        {
            expiresIn: authConfig.jwt.expiresIn as any,
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience,
        }
    );
}

/**
 * Register a new user
 */
export async function register(data: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                ...(data.email ? [{ email: data.email }] : []),
                ...(data.phone ? [{ phone: data.phone }] : []),
            ],
        },
    });

    if (existing) {
        throw createError(
            'USER_EXISTS',
            'A user with this email or phone already exists',
            409
        );
    }

    // Verify campus exists
    const campus = await prisma.campus.findUnique({
        where: { id: data.campus_id },
    });

    if (!campus) {
        throw createError('CAMPUS_NOT_FOUND', 'Campus not found', 404);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
        data: {
            id: generateId('usr'),
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            campusId: data.campus_id,
            roles: 'student',
            status: 'active',
        },
    });

    // Generate token
    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            full_name: user.fullName,
            email: user.email || undefined,
            phone: user.phone || undefined,
            campus_id: user.campusId,
            roles: user.roles.split(','),
            status: user.status,
        },
    };
}

/**
 * Login user
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
    // Find user by email or phone
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: data.email_or_phone },
                { phone: data.email_or_phone },
            ],
        },
    });

    if (!user) {
        throw createError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
    }

    // Check password
    const validPassword = await comparePassword(data.password, user.passwordHash);
    if (!validPassword) {
        throw createError('INVALID_CREDENTIALS', 'Invalid email/phone or password', 401);
    }

    // Check status
    if (user.status !== 'active') {
        throw createError('ACCOUNT_SUSPENDED', 'Your account has been suspended', 403);
    }

    // Generate token
    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            full_name: user.fullName,
            email: user.email || undefined,
            phone: user.phone || undefined,
            campus_id: user.campusId,
            roles: user.roles.split(','),
            status: user.status,
            username: user.username || undefined,
        },
    };
}

/**
 * Get current user profile
 */
export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            campusId: true,
            roles: true,
            status: true,
            username: true,
            reputationScore: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw createError('USER_NOT_FOUND', 'User not found', 404);
    }

    return {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        campus_id: user.campusId,
        roles: user.roles.split(','),
        status: user.status,
        username: user.username,
        reputation_score: user.reputationScore,
        created_at: user.createdAt,
    };
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
    // If username is being updated, check if it's available
    if (data.username) {
        const existingUsername = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existingUsername && existingUsername.id !== userId) {
            throw createError('USERNAME_TAKEN', 'This username is already taken', 409);
        }
    }

    // If campus is being changed, verify new campus exists
    if (data.campus_id) {
        const campus = await prisma.campus.findUnique({
            where: { id: data.campus_id },
        });

        if (!campus) {
            throw createError('CAMPUS_NOT_FOUND', 'Campus not found', 404);
        }
    }

    // Update user
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.username && { username: data.username }),
            ...(data.campus_id && { campusId: data.campus_id }),
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            campusId: true,
            roles: true,
            status: true,
            username: true,
            reputationScore: true,
            createdAt: true,
        },
    });

    return {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        phone: user.phone,
        campus_id: user.campusId,
        roles: user.roles.split(','),
        status: user.status,
        username: user.username,
        reputation_score: user.reputationScore,
        created_at: user.createdAt,
    };
}
