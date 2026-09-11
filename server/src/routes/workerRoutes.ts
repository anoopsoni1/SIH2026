import { Router } from 'express';
import { WorkerController } from '../controllers/WorkerController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import { registerWorkerProfileSchema } from '../validators/workerValidator';
import { UserRole } from '../../../shared/src/index';

const router = Router();

router.post(
  '/profile',
  authenticateJwt,
  requireRoles(UserRole.WORKER),
  validateRequest(registerWorkerProfileSchema),
  WorkerController.registerProfile
);
router.get('/me', authenticateJwt, requireRoles(UserRole.WORKER), WorkerController.getMyWorkerProfile);
router.patch('/availability', authenticateJwt, requireRoles(UserRole.WORKER), WorkerController.toggleAvailability);
router.get('/nearby', authenticateJwt, WorkerController.findNearbyWorkers);

export default router;
