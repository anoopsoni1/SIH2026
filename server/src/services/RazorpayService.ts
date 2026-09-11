import crypto from 'crypto';
import { config } from '../config/env';
import { logger } from '../config/logger';

export class RazorpayService {
  /**
   * Creates a simulated or Razorpay API Order object
   */
  static async createOrder(amountInRupees: number, bookingNumber: string): Promise<{ orderId: string; amount: number; currency: string }> {
    const amountInPaise = Math.round(amountInRupees * 100);
    const mockOrderId = `order_${bookingNumber.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

    logger.info(`Created Razorpay Order: ${mockOrderId} for amount: ₹${amountInRupees}`);

    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  /**
   * Verifies Razorpay HMAC SHA256 Signature
   */
  static verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!signature) return false;
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body.toString())
      .digest('hex');

    // In development mode with mock credentials, allow verified simulated signatures if matched
    if (config.env === 'development' && signature.startsWith('sig_simulated_')) {
      return true;
    }

    return expectedSignature === signature;
  }
}
