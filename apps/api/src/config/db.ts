import { PrismaClient } from '@prisma/client';
import { config } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    });

if (config.isDevelopment) globalForPrisma.prisma = prisma;

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

export async function disconnectDB() {
    await prisma.$disconnect();
    console.log('Database disconnected');
}
