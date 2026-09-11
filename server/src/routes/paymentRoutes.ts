import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { createPaymentOrderSchema, verifyPaymentSchema } from '../validators/paymentValidator';

const router = Router();

router.use(authenticateJwt);

router.post('/create-order', validateRequest(createPaymentOrderSchema), PaymentController.createOrder);
router.post('/verify', validateRequest(verifyPaymentSchema), PaymentController.verifyPayment);

export default router;
