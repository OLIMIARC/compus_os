import { Router } from 'express';
import { shopController } from './shop.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { campusMiddleware } from '../../middleware/campus.middleware';

const router = Router();

// Eligibility check (authenticated users only)
router.get('/eligibility', authMiddleware, shopController.getEligibility);

// Create shop (gated by eligibility)
router.post('/', authMiddleware, campusMiddleware, shopController.createShop);

// Get shop details (public within campus)
router.get('/:id', shopController.getShopById);

// Update shop (owner only)
router.patch('/:id', authMiddleware, shopController.updateShop);

// Moderation actions (moderator only)
// TODO: Add moderator middleware
router.post('/:id/suspend', authMiddleware, shopController.suspendShop);
router.post('/:id/restore', authMiddleware, shopController.restoreShop);

// Close shop (owner only, permanent)
router.post('/:id/close', authMiddleware, shopController.closeShop);

export default router;
