import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { UserRole } from '../../../shared/src/index';

const router = Router();

router.get('/categories', ServiceController.getCategories);
router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);

// Admin Category/Service Management
router.post(
  '/categories',
  authenticateJwt,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.SOCIETY_ADMIN),
  ServiceController.createCategory
);
router.post(
  '/',
  authenticateJwt,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.SOCIETY_ADMIN),
  ServiceController.createService
);

export default router;
