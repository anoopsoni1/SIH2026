import { BookingStatus, UserRole } from '../../../shared/src/index';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING_PAYMENT]: [BookingStatus.PAYMENT_VERIFIED, BookingStatus.CANCELLED_BY_CUSTOMER, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.PAYMENT_VERIFIED]: [BookingStatus.AWAITING_WORKER, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.AWAITING_WORKER]: [BookingStatus.ACCEPTED, BookingStatus.REJECTED, BookingStatus.CANCELLED_BY_CUSTOMER, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.ACCEPTED]: [BookingStatus.WORKER_ON_THE_WAY, BookingStatus.CANCELLED_BY_WORKER, BookingStatus.CANCELLED_BY_CUSTOMER, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.REJECTED]: [BookingStatus.AWAITING_WORKER, BookingStatus.CANCELLED_BY_SYSTEM],
  [BookingStatus.WORKER_ON_THE_WAY]: [BookingStatus.SERVICE_STARTED, BookingStatus.CANCELLED_BY_WORKER, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.SERVICE_STARTED]: [BookingStatus.SERVICE_COMPLETED, BookingStatus.DISPUTED, BookingStatus.CANCELLED_BY_ADMIN],
  [BookingStatus.SERVICE_COMPLETED]: [BookingStatus.CUSTOMER_CONFIRMED, BookingStatus.DISPUTED],
  [BookingStatus.CUSTOMER_CONFIRMED]: [],
  [BookingStatus.CANCELLED_BY_CUSTOMER]: [BookingStatus.REFUNDED],
  [BookingStatus.CANCELLED_BY_WORKER]: [BookingStatus.AWAITING_WORKER, BookingStatus.REFUNDED],
  [BookingStatus.CANCELLED_BY_ADMIN]: [BookingStatus.REFUNDED],
  [BookingStatus.CANCELLED_BY_SYSTEM]: [BookingStatus.REFUNDED],
  [BookingStatus.DISPUTED]: [BookingStatus.REFUNDED, BookingStatus.CUSTOMER_CONFIRMED],
  [BookingStatus.REFUNDED]: [],
};

export class BookingStateMachine {
  static canTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(newStatus) : false;
  }

  static validateTransitionOrThrow(currentStatus: BookingStatus, newStatus: BookingStatus): void {
    if (!BookingStateMachine.canTransition(currentStatus, newStatus)) {
      throw new Error(`Invalid booking state transition from '${currentStatus}' to '${newStatus}'`);
    }
  }

  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
