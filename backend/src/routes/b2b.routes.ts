import { Router } from 'express';
import * as b2bController from '../controllers/b2b.controller.js';
import { jwtAuth, requireRole } from '../middlewares/jwtAuth.middleware.js';

const router = Router();

// All B2B routes require JWT auth and CLIENT role
router.use(jwtAuth);
router.use(requireRole('CLIENT'));

router.get('/dashboard', b2bController.getDashboard);
router.get('/keys', b2bController.getApiKeys);
router.post('/keys', b2bController.createApiKey);
router.post('/keys/:id/revoke', b2bController.revokeApiKey);
router.get('/usage', b2bController.getUsageStats);
router.get('/profile', b2bController.getProfile);
router.put('/profile', b2bController.updateProfile);

export default router;