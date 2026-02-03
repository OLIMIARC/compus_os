import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.string().default('3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),
    UPLOAD_DIR: z.string().default('./uploads'),
    MAX_FILE_SIZE: z.string().default('10485760'),
    PLATFORM_NAME: z.string().default('Campus OS'),
    WATERMARK_TEXT: z.string().default('Campus OS'),
    CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Invalid environment variables:', error);
        process.exit(1);
    }
};

export const env = parseEnv();

export const config = {
    port: parseInt(env.PORT, 10),
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    database: {
        url: env.DATABASE_URL,
    },
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
    },
    upload: {
        dir: env.UPLOAD_DIR,
        maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
    },
    platform: {
        name: env.PLATFORM_NAME,
        watermarkText: env.WATERMARK_TEXT,
    },
    cors: {
        origin: env.CORS_ORIGIN.split(','),
    },
};
