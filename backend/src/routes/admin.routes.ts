import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { jwtAuth, requireRole } from '../middlewares/jwtAuth.middleware.js';
import { aggregateUsageDaily } from '../jobs/usageAggregation.job.js';

const router = Router();

// All admin routes require JWT auth and ADMIN role
router.use(jwtAuth);
router.use(requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.post('/users/:id/approve', adminController.approveUser);
router.post('/users/:id/reject', adminController.rejectUser);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/plan', adminController.changeUserPlan);
router.post('/jobs/aggregate-usage', (req, res) => aggregateUsageDaily(req.body.date));
router.get('/logs', adminController.getApiLogs);

export default router;