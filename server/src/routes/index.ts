import { Router } from 'express';
import authRoutes from './authRoutes';
import workerRoutes from './workerRoutes';
import serviceRoutes from './serviceRoutes';
import bookingRoutes from './bookingRoutes';
import paymentRoutes from './paymentRoutes';
import ratingRoutes from './ratingRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/ratings', ratingRoutes);
router.use('/admin', adminRoutes);

export default router;
