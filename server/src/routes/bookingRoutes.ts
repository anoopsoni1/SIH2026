import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { createBookingSchema, updateBookingStatusSchema } from '../validators/bookingValidator';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateRequest(createBookingSchema), BookingController.createBooking);
router.get('/', BookingController.getBookings);
router.get('/:id', BookingController.getBookingById);
router.patch('/:id/status', validateRequest(updateBookingStatusSchema), BookingController.updateStatus);

export default router;
