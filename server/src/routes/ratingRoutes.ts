import { Router } from 'express';
import { RatingController } from '../controllers/RatingController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJwt, RatingController.submitRating);

export default router;
