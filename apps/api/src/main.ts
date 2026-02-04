import express from 'express';
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
