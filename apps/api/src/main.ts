import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { ensureUploadDirectories } from './config/storage';
import { errorMiddleware } from './middleware/error.middleware';
import { campusMiddleware } from './middleware/campus.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import coreRoutes from './modules/core/core.routes';
import marketplaceRoutes from './modules/marketplace/marketplace.routes';
import feedRoutes from './modules/feed/feed.routes';
import updatesRoutes from './modules/updates/updates.routes';
import articlesRoutes from './modules/articles/articles.routes';
import timetableRoutes from './modules/timetable/timetable.routes';
import reportsRoutes from './modules/reports/reports.routes';
import moderationRoutes from './modules/moderation/moderation.routes';

const app = express();

// ============================================
// CRITICAL: Handle OPTIONS (preflight) FIRST before any other middleware
// ============================================
app.use((req, res, next) => {
    const origin = req.get('Origin') || '*';

    // Set CORS headers on EVERY request
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-Campus-ID');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS immediately
    if (req.method === 'OPTIONS') {
        console.log(`✅ Preflight OPTIONS for ${req.url} from origin: ${origin}`);
        return res.sendStatus(200);
    }

    next();
});

// Custom request logger
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial startup log
console.log('🚀 CORS allowed origins from config:', config.cors.origin);

// Campus scoping (applies to all routes)
app.use(campusMiddleware);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Campus OS API is running' });
});

// Root path (Render health check default)
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Campus OS API is healthy' });
});

// TEMPORARY: One-time database seeding endpoint (remove after use)
app.post('/seed-db', async (req, res) => {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const bcrypt = await import('bcrypt');
        const { nanoid } = await import('nanoid');

        const prisma = new PrismaClient();

        console.log('🌱 Seeding database...');

        // Create Campuses
        const campuses = await Promise.all([
            prisma.campus.upsert({
                where: { id: 'cmp_makerere' },
                update: {},
                create: { id: 'cmp_makerere', name: 'Makerere University', city: 'Kampala' },
            }),
            prisma.campus.upsert({
                where: { id: 'cmp_mubs' },
                update: {},
                create: { id: 'cmp_mubs', name: 'Makerere University Business School', city: 'Kampala' },
            }),
            prisma.campus.upsert({
                where: { id: 'cmp_kyambogo' },
                update: {},
                create: { id: 'cmp_kyambogo', name: 'Kyambogo University', city: 'Kampala' },
            }),
        ]);

        // Create Courses
        await Promise.all([
            prisma.course.upsert({
                where: { campusId_code: { campusId: 'cmp_makerere', code: 'CSC2101' } },
                update: {},
                create: { id: 'crs_datastruct', campusId: 'cmp_makerere', code: 'CSC2101', title: 'Data Structures and Algorithms' },
            }),
            prisma.course.upsert({
                where: { campusId_code: { campusId: 'cmp_makerere', code: 'CSC2201' } },
                update: {},
                create: { id: 'crs_db', campusId: 'cmp_makerere', code: 'CSC2201', title: 'Database Systems' },
            }),
            prisma.course.upsert({
                where: { campusId_code: { campusId: 'cmp_mubs', code: 'ACF1101' } },
                update: {},
                create: { id: 'crs_accounting', campusId: 'cmp_mubs', code: 'ACF1101', title: 'Financial Accounting' },
            }),
        ]);

        // Create Test Users
        const passwordHash = await bcrypt.hash('Password123', 10);
        await Promise.all([
            prisma.user.upsert({
                where: { email: 'john@example.com' },
                update: {},
                create: { id: 'usr_john', fullName: 'John Doe', email: 'john@example.com', passwordHash, username: 'johndoe', campusId: 'cmp_makerere', roles: 'student', status: 'active', reputationScore: 50 },
            }),
            prisma.user.upsert({
                where: { email: 'jane@example.com' },
                update: {},
                create: { id: 'usr_jane', fullName: 'Jane Smith', email: 'jane@example.com', passwordHash, username: 'janesmith', campusId: 'cmp_makerere', roles: 'student,moderator', status: 'active', reputationScore: 150 },
            }),
        ]);

        await prisma.$disconnect();

        console.log('✅ Database seeded successfully!');
        res.json({
            ok: true,
            message: 'Database seeded successfully',
            data: {
                campuses: campuses.length,
                testAccount: { email: 'john@example.com', password: 'Password123' }
            }
        });
    } catch (error: any) {
        console.error('❌ Seeding error:', error);
        res.status(500).json({ ok: false, error: { message: error.message } });
    }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', coreRoutes); // Campuses & courses

// Profile routes (separate from auth)
import { authMiddleware } from './middleware/auth.middleware';
import { getMeHandler, updateProfileHandler } from './modules/auth/auth.controller';
import { validate } from './middleware/validate.middleware';
import { UpdateProfileSchema } from './modules/auth/auth.schema';

app.get('/api/v1/me', authMiddleware, getMeHandler);
app.patch('/api/v1/me', authMiddleware, validate(UpdateProfileSchema), updateProfileHandler);

app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/updates', updatesRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/moderation', moderationRoutes);

// 404 handler
app.use((req, res) => {
    console.log(`⚠️ 404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        ok: false,
        error: {
            code: 'NOT_FOUND',
            message: `Endpoint not found: ${req.method} ${req.url}`,
        },
    });
});

// Global error handler (must be last)
app.use(errorMiddleware);

// ============================================
// SERVER STARTUP
// ============================================

async function start() {
    try {
        // Ensure upload directories exist
        ensureUploadDirectories();

        // Connect to database
        await connectDB();

        // Start server
        app.listen(config.port, () => {
            console.log('');
            console.log('🎓 ========================================');
            console.log('   Campus OS API');
            console.log('   Campus-scoped social + knowledge system');
            console.log('========================================');
            console.log('');
            console.log(`✅ Server running on port ${config.port}`);
            console.log(`📝 Environment: ${config.nodeEnv}`);
            console.log(`🌐 Health check: http://localhost:${config.port}/health`);
            console.log('');
            console.log('📡 Available Modules (48+ endpoints):');
            console.log('   ✅ Auth - Registration, login, profile');
            console.log('   ✅ Core - Campuses, courses');
            console.log('   ✅ Marketplace - Campus Trade (Buy/Sell/Rent)');
            console.log('   ✅ Feed - Posts, memes, polls, comments, reactions');
            console.log('   ✅ Campus Updates - System notices');
            console.log('   ✅ Articles - Long-form content');
            console.log('   ✅ Timetable - Class schedules');
            console.log('   ✅ Reports - Content reporting');
            console.log('   ✅ Moderation - Moderator actions');
            console.log('');
            console.log('📚 See README.md and SETUP.md for full documentation');
            console.log('');
            console.log('Press Ctrl+C to stop');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
});

// Start the server
start();
