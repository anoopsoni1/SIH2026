import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { RazorpayService } from '../services/RazorpayService';
import { BookingStateMachine } from '../services/BookingStateMachine';
import { AuditService } from '../services/AuditService';
import { BookingStatus, PaymentStatus } from '../../../shared/src/index';

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { bookingId } = req.body;
      const customerId = req.user?.userId;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          code: 'NOT_FOUND',
        });
      }

      if (booking.status !== BookingStatus.PENDING_PAYMENT) {
        return res.status(400).json({
          success: false,
          message: `Cannot pay for booking in status ${booking.status}`,
          code: 'INVALID_STATUS',
        });
      }

      const orderData = await RazorpayService.createOrder(booking.pricing.grossAmount, booking.bookingNumber);

      const payment = await Payment.create({
        bookingId: booking._id,
        customerId,
        workerId: booking.workerId,
        razorpayOrderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        status: PaymentStatus.CREATED,
        breakdown: booking.pricing,
      });

      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment._id,
          razorpayOrderId: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency,
          keyId: 'rzp_test_coop_key',
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Payment order creation failed',
        code: 'PAYMENT_ORDER_FAILED',
      });
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const isValid = RazorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed',
          code: 'INVALID_SIGNATURE',
        });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          code: 'NOT_FOUND',
        });
      }

      // Update payment document
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature,
          status: PaymentStatus.SUCCESSFUL,
        }
      );

      // Transition booking state: PENDING_PAYMENT -> PAYMENT_VERIFIED -> AWAITING_WORKER
      BookingStateMachine.validateTransitionOrThrow(booking.status, BookingStatus.PAYMENT_VERIFIED);
      booking.status = BookingStatus.AWAITING_WORKER;
      await booking.save();

      await AuditService.logAction({
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        action: 'PAYMENT_VERIFIED_SUCCESSFUL',
        entity: 'Payment',
        entityId: booking._id.toString(),
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        data: {
          bookingId: booking._id,
          status: booking.status,
          startOtp: booking.startOtp,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Payment verification failed',
        code: 'PAYMENT_VERIFY_FAILED',
      });
    }
  }
}
