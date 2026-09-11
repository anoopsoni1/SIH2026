import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { UserRole } from '../../../shared/src/index';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles(UserRole.SUPER_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.SOCIETY_ADMIN));

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/workers', AdminController.getWorkers);
router.patch('/workers/:id/verify', AdminController.verifyWorker);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/forecast', AdminController.getDemandForecast);

export default router;
