import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
import { BadRequestException } from '../../errors/app-error';

export class OrderStateMachine {
  private static readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.DRAFT]: [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PENDING_PAYMENT]: [
      OrderStatus.PAYMENT_CONFIRMED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PAYMENT_CONFIRMED]: [
      OrderStatus.PROCESSING,
      OrderStatus.READY_FOR_SHIPMENT,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PROCESSING]: [
      OrderStatus.READY_FOR_SHIPMENT,
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.READY_FOR_SHIPMENT]: [
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.SHIPPED]: [
      OrderStatus.DELIVERED,
      OrderStatus.RETURN_REQUESTED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.DELIVERED]: [
      OrderStatus.RETURN_REQUESTED,
      OrderStatus.REFUNDED,
    ],
    [OrderStatus.RETURN_REQUESTED]: [
      OrderStatus.RETURNED,
      OrderStatus.DELIVERED, // When return request is rejected
      OrderStatus.REFUNDED,
    ],
    [OrderStatus.RETURNED]: [
      OrderStatus.REFUNDED,
    ],
    [OrderStatus.CANCELLED]: [
      OrderStatus.REFUNDED, // If paid order cancelled and refund processed
    ],
    [OrderStatus.REFUNDED]: [],
  };

  /**
   * Checks whether a transition from `fromStatus` to `toStatus` is permitted.
   */
  static canTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
    if (fromStatus === toStatus) return true;
    const allowed = this.allowedTransitions[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Checks whether the status is terminal (no further forward business operations).
   */
  static isTerminal(status: OrderStatus): boolean {
    return status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;
  }

  /**
   * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
   */
  static validateTransition(fromStatus: OrderStatus, toStatus: OrderStatus): void {
    if (fromStatus === toStatus) {
      return; // Idempotent no-op
    }

    const allowedNextStates = this.allowedTransitions[fromStatus] || [];
    if (!allowedNextStates.includes(toStatus)) {
      throw new BadRequestException(
        `Invalid order status transition: Cannot transition from '${fromStatus}' to '${toStatus}'. Allowed next states: [${allowedNextStates.join(', ')}]`
      );
    }
  }

  /**
   * Evaluates if a customer is allowed to cancel an order under business policy.
   * Customer can cancel if order is in PENDING_PAYMENT, PAYMENT_CONFIRMED, or PROCESSING,
   * provided parcel has not yet been dispatched by courier.
   */
  static canCustomerCancel(status: OrderStatus, shipments: any[] = []): { allowed: boolean; reason?: string } {
    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAYMENT_CONFIRMED,
      OrderStatus.PROCESSING,
    ];

    if (!cancellableStatuses.includes(status)) {
      return {
        allowed: false,
        reason: `Cannot cancel order: Orders in status '${status}' cannot be cancelled by customer.`,
      };
    }

    const hasDispatchedShipment = shipments.some((s) =>
      ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status)
    );

    if (hasDispatchedShipment) {
      return {
        allowed: false,
        reason: 'Cannot cancel order: Shipment is already dispatched or in transit with courier. Please request a return instead.',
      };
    }

    return { allowed: true };
  }

  /**
   * Evaluates if staff can cancel an order.
   */
  static canStaffCancel(status: OrderStatus, shipments: any[] = []): { allowed: boolean; reason?: string } {
    if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED || status === OrderStatus.RETURNED) {
      return {
        allowed: false,
        reason: `Cannot cancel order: Order is already in terminal status '${status}'.`,
      };
    }

    const isDelivered = shipments.some((s) => s.status === 'DELIVERED') || status === OrderStatus.DELIVERED;
    if (isDelivered) {
      return {
        allowed: false,
        reason: 'Cannot cancel order: Cannot cancel a delivered order. Please use the Return workflow.',
      };
    }

    return { allowed: true };
  }

  /**
   * Evaluates if an order is eligible for a customer return request.
   */
  static canRequestReturn(status: OrderStatus, shipments: any[] = []): { allowed: boolean; reason?: string } {
    const isDelivered =
      status === OrderStatus.DELIVERED || shipments.some((s) => s.status === 'DELIVERED');

    if (!isDelivered) {
      return {
        allowed: false,
        reason: `Cannot request return: Only DELIVERED orders can request returns. Current order status: '${status}'.`,
      };
    }

    if (status === OrderStatus.RETURN_REQUESTED || status === OrderStatus.RETURNED) {
      return {
        allowed: false,
        reason: `Cannot request return: Return has already been requested or processed for this order.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Cross-domain synchronization: Resolves OrderStatus when payment state changes.
   * Supports both (paymentStatus, currentOrderStatus) and (currentOrderStatus, paymentStatus).
   */
  static resolveOrderStatusFromPayment(
    arg1: PaymentStatus | OrderStatus,
    arg2: OrderStatus | PaymentStatus
  ): OrderStatus | null {
    let paymentStatus: PaymentStatus;
    let currentOrderStatus: OrderStatus;

    if (Object.values(PaymentStatus).includes(arg1 as PaymentStatus)) {
      paymentStatus = arg1 as PaymentStatus;
      currentOrderStatus = arg2 as OrderStatus;
    } else {
      currentOrderStatus = arg1 as OrderStatus;
      paymentStatus = arg2 as PaymentStatus;
    }

    switch (paymentStatus) {
      case PaymentStatus.PAID:
        if (currentOrderStatus === OrderStatus.PENDING_PAYMENT || currentOrderStatus === OrderStatus.DRAFT) {
          return OrderStatus.PAYMENT_CONFIRMED;
        }
        return currentOrderStatus; // Never regress forward fulfillment states (e.g. PROCESSING, SHIPPED, DELIVERED)
      case PaymentStatus.REFUNDED:
        if (
          currentOrderStatus === OrderStatus.CANCELLED ||
          currentOrderStatus === OrderStatus.RETURNED ||
          currentOrderStatus === OrderStatus.DELIVERED ||
          currentOrderStatus === OrderStatus.RETURN_REQUESTED
        ) {
          return OrderStatus.REFUNDED;
        }
        return currentOrderStatus;
      default:
        return currentOrderStatus;
    }
  }

  /**
   * Cross-domain synchronization: Resolves OrderStatus when shipment state changes.
   * Supports both (shipmentStatus, currentOrderStatus) and (currentOrderStatus, shipmentStatus).
   */
  static resolveOrderStatusFromShipment(
    arg1: ShipmentStatus | OrderStatus,
    arg2: OrderStatus | ShipmentStatus
  ): OrderStatus | null {
    let shipmentStatus: ShipmentStatus;
    let currentOrderStatus: OrderStatus;

    if (Object.values(ShipmentStatus).includes(arg1 as ShipmentStatus)) {
      shipmentStatus = arg1 as ShipmentStatus;
      currentOrderStatus = arg2 as OrderStatus;
    } else {
      currentOrderStatus = arg1 as OrderStatus;
      shipmentStatus = arg2 as ShipmentStatus;
    }

    switch (shipmentStatus) {
      case ShipmentStatus.PACKING:
      case ShipmentStatus.PACKED:
        if (currentOrderStatus === OrderStatus.PAYMENT_CONFIRMED) {
          return OrderStatus.PROCESSING;
        }
        return currentOrderStatus;
      case ShipmentStatus.READY_TO_SHIP:
      case ShipmentStatus.HANDED_OVER:
        if (currentOrderStatus === OrderStatus.PROCESSING || currentOrderStatus === OrderStatus.PAYMENT_CONFIRMED) {
          return OrderStatus.READY_FOR_SHIPMENT;
        }
        return currentOrderStatus;
      case ShipmentStatus.SHIPPED:
      case ShipmentStatus.IN_TRANSIT:
      case ShipmentStatus.OUT_FOR_DELIVERY:
        if (
          currentOrderStatus === OrderStatus.PAYMENT_CONFIRMED ||
          currentOrderStatus === OrderStatus.PROCESSING ||
          currentOrderStatus === OrderStatus.READY_FOR_SHIPMENT
        ) {
          return OrderStatus.SHIPPED;
        }
        return currentOrderStatus; // Stale in-transit event must not regress DELIVERED or RETURNED
      case ShipmentStatus.DELIVERED:
        if (
          currentOrderStatus === OrderStatus.PAYMENT_CONFIRMED ||
          currentOrderStatus === OrderStatus.PROCESSING ||
          currentOrderStatus === OrderStatus.READY_FOR_SHIPMENT ||
          currentOrderStatus === OrderStatus.SHIPPED
        ) {
          return OrderStatus.DELIVERED;
        }
        return currentOrderStatus; // Does not overwrite RETURN_REQUESTED, RETURNED, CANCELLED, or REFUNDED
      default:
        return currentOrderStatus;
    }
  }
}
