import { Router } from 'express';
import { marketplaceController } from './marketplace.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Public routes (browsing)
router.get('/', marketplaceController.getListings.bind(marketplaceController));
router.get('/:id', marketplaceController.getListingById.bind(marketplaceController));

// Protected routes (require authentication)
router.post('/', authMiddleware, marketplaceController.createListing.bind(marketplaceController));
router.patch('/:id', authMiddleware, marketplaceController.updateListing.bind(marketplaceController));
router.delete('/:id', authMiddleware, marketplaceController.deleteListing.bind(marketplaceController));
router.post('/:id/mark-sold', authMiddleware, marketplaceController.markAsSold.bind(marketplaceController));

export default router;
