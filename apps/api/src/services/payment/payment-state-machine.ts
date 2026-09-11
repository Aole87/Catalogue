import { PaymentStatus, OrderStatus } from '@prisma/client';
import { BadRequestException } from '../../errors/app-error';

export interface StateTransitionResult {
  allowed: boolean;
  targetPaymentStatus: PaymentStatus;
  targetOrderStatus?: OrderStatus;
  reason?: string;
}

export class PaymentStateMachine {
  private static readonly allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.PENDING]: [
      PaymentStatus.AUTHORIZED,
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.AUTHORIZED]: [
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.PAID]: [
      PaymentStatus.REFUNDED,
      PaymentStatus.PARTIALLY_REFUNDED,
    ],
    [PaymentStatus.PARTIALLY_REFUNDED]: [
      PaymentStatus.REFUNDED,
      PaymentStatus.PARTIALLY_REFUNDED,
    ],
    [PaymentStatus.FAILED]: [],
    [PaymentStatus.CANCELLED]: [],
    [PaymentStatus.REFUNDED]: [],
  };

  /**
   * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
   */
  static validateTransition(fromStatus: PaymentStatus, toStatus: PaymentStatus): void {
    if (fromStatus === toStatus) {
      return; // Idempotent no-op
    }

    const allowedNextStates = this.allowedTransitions[fromStatus] || [];
    if (!allowedNextStates.includes(toStatus)) {
      throw new BadRequestException(
        `Illegal payment state transition: Cannot transition from ${fromStatus} to ${toStatus}. Allowed transitions from ${fromStatus}: [${allowedNextStates.join(', ')}]`
      );
    }
  }

  /**
   * Resolves the corresponding OrderStatus for a PaymentStatus transition.
   */
  static resolveOrderStatus(paymentStatus: PaymentStatus): OrderStatus | null {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return OrderStatus.PAYMENT_CONFIRMED;
      case PaymentStatus.REFUNDED:
        return OrderStatus.REFUNDED;
      case PaymentStatus.CANCELLED:
        return OrderStatus.CANCELLED;
      default:
        return null; // Keeps current order status
    }
  }
}
