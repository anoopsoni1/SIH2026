import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;
