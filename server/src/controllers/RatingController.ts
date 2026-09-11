import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Rating } from '../models/Rating';
import { WorkerProfile } from '../models/WorkerProfile';
import { BookingStatus } from '../shared/index';

export class RatingController {
  static async submitRating(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user?.userId;
      const { bookingId, overallRating, punctualityRating, qualityRating, professionalismRating, comment } = req.body;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          code: 'NOT_FOUND',
        });
      }

      if (booking.customerId.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only review your own bookings',
          code: 'FORBIDDEN',
        });
      }

      if (booking.status !== BookingStatus.SERVICE_COMPLETED && booking.status !== BookingStatus.CUSTOMER_CONFIRMED) {
        return res.status(400).json({
          success: false,
          message: 'Ratings can only be submitted for completed services',
          code: 'INVALID_STATUS',
        });
      }

      const existingRating = await Rating.findOne({ bookingId });
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Rating has already been submitted for this booking',
          code: 'DUPLICATE_RATING',
        });
      }

      const rating = await Rating.create({
        bookingId,
        customerId,
        workerId: booking.workerId,
        overallRating,
        punctualityRating,
        qualityRating,
        professionalismRating,
        comment,
      });

      // Recalculate Worker average rating server-side
      if (booking.workerId) {
        const workerProfile = await WorkerProfile.findById(booking.workerId);
        if (workerProfile) {
          const count = workerProfile.ratingCount + 1;
          const newAvg = (workerProfile.ratingAverage * workerProfile.ratingCount + overallRating) / count;
          workerProfile.ratingCount = count;
          workerProfile.ratingAverage = Math.round(newAvg * 10) / 10;
          await workerProfile.save();
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: rating,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Rating submission failed',
        code: 'RATING_FAILED',
      });
    }
  }
}
