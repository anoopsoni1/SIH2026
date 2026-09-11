import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { WorkerProfile } from '../models/WorkerProfile';
import { WageCalculatorService } from '../services/WageCalculatorService';
import { BookingStateMachine } from '../services/BookingStateMachine';
import { GeoMatchingService } from '../services/GeoMatchingService';
import { AuditService } from '../services/AuditService';
import { BookingStatus, BookingType, UserRole } from '../../../shared/src/index';

export class BookingController {
  static async createBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const customerId = req.user?.userId;
      const { serviceId, bookingType, scheduledDate, scheduledTimeSlot, problemDescription, serviceLocation } = req.body;

      const service = await Service.findById(serviceId);
      if (!service || !service.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Requested service is not available',
          code: 'SERVICE_UNAVAILABLE',
        });
      }

      // Calculate gross and wage breakdown
      const basePrice = service.basePrice;
      const emergencyMultiplier = bookingType === BookingType.EMERGENCY ? 1.25 : 1.0;
      const grossAmount = Math.round(basePrice * emergencyMultiplier);
      const pricing = WageCalculatorService.calculateBreakdown(grossAmount);

      const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // Generate start & completion OTPs
      const startOtp = BookingStateMachine.generateOtp();
      const completionOtp = BookingStateMachine.generateOtp();

      const booking = await Booking.create({
        bookingNumber,
        customerId,
        serviceId,
        bookingType: bookingType || BookingType.STANDARD,
        status: BookingStatus.PENDING_PAYMENT,
        serviceLocation,
        scheduledDate: new Date(scheduledDate),
        scheduledTimeSlot,
        problemDescription,
        pricing,
        startOtp,
        completionOtp,
      });

      // Auto match nearby available workers if emergency or requested
      const [lng, lat] = serviceLocation.location.coordinates;
      const matches = await GeoMatchingService.findMatchingWorkers({
        serviceId: service._id.toString(),
        longitude: lng,
        latitude: lat,
        maxDistanceKm: 25,
        isEmergency: bookingType === BookingType.EMERGENCY,
      });

      if (matches.length > 0) {
        // Pre-assign highest matching worker to request
        booking.workerId = matches[0].worker._id as any;
        await booking.save();
      }

      await AuditService.logAction({
        actorId: customerId!,
        actorRole: req.user!.role,
        action: 'BOOKING_CREATED',
        entity: 'Booking',
        entityId: booking._id.toString(),
      });

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully. Please proceed with payment.',
        data: booking,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Booking creation failed',
        code: 'CREATE_BOOKING_FAILED',
      });
    }
  }

  static async getBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const { role, userId } = req.user!;
      const { status } = req.query;

      const query: any = {};

      if (role === UserRole.CUSTOMER) {
        query.customerId = userId;
      } else if (role === UserRole.WORKER) {
        const workerProfile = await WorkerProfile.findOne({ userId });
        if (!workerProfile) {
          return res.status(200).json({ success: true, data: [] });
        }
        query.workerId = workerProfile._id;
      }

      if (status) {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .populate('customerId', 'name mobile email')
        .populate('serviceId', 'name basePrice unitType')
        .populate({
          path: 'workerId',
          populate: { path: 'userId', select: 'name mobile' },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
        code: 'SERVER_ERROR',
      });
    }
  }

  static async getBookingById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id)
        .populate('customerId', 'name mobile email')
        .populate('serviceId', 'name basePrice unitType categoryId')
        .populate({
          path: 'workerId',
          populate: [
            { path: 'userId', select: 'name mobile email' },
            { path: 'societyId', select: 'name code region' },
          ],
        });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          code: 'NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        code: 'SERVER_ERROR',
      });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status: targetStatus, otp, cancelledReason } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          code: 'NOT_FOUND',
        });
      }

      // Enforce State Machine rules
      BookingStateMachine.validateTransitionOrThrow(booking.status, targetStatus as BookingStatus);

      // Verify OTP if starting service or completing service
      if (targetStatus === BookingStatus.SERVICE_STARTED) {
        if (otp !== booking.startOtp) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Start OTP provided',
            code: 'INVALID_OTP',
          });
        }
      } else if (targetStatus === BookingStatus.SERVICE_COMPLETED) {
        if (otp !== booking.completionOtp) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Completion OTP provided',
            code: 'INVALID_OTP',
          });
        }
      }

      const previousState = booking.status;
      booking.status = targetStatus as BookingStatus;

      if (cancelledReason) {
        booking.cancelledReason = cancelledReason;
        booking.cancelledByRole = userRole;
      }

      await booking.save();

      // If completing service, increment worker active jobs count or stats
      if (targetStatus === BookingStatus.CUSTOMER_CONFIRMED && booking.workerId) {
        await WorkerProfile.findByIdAndUpdate(booking.workerId, {
          $inc: { activeJobsCount: -1 },
        });
      }

      await AuditService.logAction({
        actorId: userId!,
        actorRole: userRole!,
        action: `BOOKING_STATUS_CHANGED_${targetStatus}`,
        entity: 'Booking',
        entityId: booking._id.toString(),
        previousState: { status: previousState },
        newState: { status: targetStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Booking status updated to ${targetStatus}`,
        data: booking,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Status update failed',
        code: 'TRANSITION_ERROR',
      });
    }
  }
}
