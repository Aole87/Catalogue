import { ShipmentStatus, OrderStatus } from '@prisma/client';
import { BadRequestException } from '../../errors/app-error';

export class ShipmentStateMachine {
  private static readonly statusHierarchy: Record<ShipmentStatus, number> = {
    [ShipmentStatus.PENDING]: 0,
    [ShipmentStatus.READY_TO_FULFILL]: 1,
    [ShipmentStatus.PICKED]: 2,
    [ShipmentStatus.PACKING]: 3,
    [ShipmentStatus.PACKED]: 4,
    [ShipmentStatus.READY_TO_SHIP]: 5,
    [ShipmentStatus.HANDED_OVER]: 6,
    [ShipmentStatus.SHIPPED]: 7,
    [ShipmentStatus.IN_TRANSIT]: 8,
    [ShipmentStatus.OUT_FOR_DELIVERY]: 9,
    [ShipmentStatus.DELIVERED]: 10,
    [ShipmentStatus.RETURNED]: 11,
    [ShipmentStatus.FAILED]: 99,
    [ShipmentStatus.CANCELLED]: 99,
  };

  private static readonly allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
    [ShipmentStatus.PENDING]: [
      ShipmentStatus.READY_TO_FULFILL,
      ShipmentStatus.PICKED,
      ShipmentStatus.PACKING,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.READY_TO_FULFILL]: [
      ShipmentStatus.PICKED,
      ShipmentStatus.PACKING,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PICKED]: [
      ShipmentStatus.PACKING,
      ShipmentStatus.PACKED,
      ShipmentStatus.READY_TO_SHIP,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PACKING]: [
      ShipmentStatus.PACKED,
      ShipmentStatus.READY_TO_SHIP,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PACKED]: [
      ShipmentStatus.READY_TO_SHIP,
      ShipmentStatus.HANDED_OVER,
      ShipmentStatus.SHIPPED,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.READY_TO_SHIP]: [
      ShipmentStatus.HANDED_OVER,
      ShipmentStatus.SHIPPED,
      ShipmentStatus.FAILED,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.HANDED_OVER]: [
      ShipmentStatus.SHIPPED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.FAILED,
    ],
    [ShipmentStatus.SHIPPED]: [
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.FAILED,
    ],
    [ShipmentStatus.IN_TRANSIT]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.FAILED,
    ],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.FAILED,
      ShipmentStatus.RETURNED,
    ],
    [ShipmentStatus.DELIVERED]: [
      ShipmentStatus.RETURNED,
    ],
    [ShipmentStatus.RETURNED]: [],
    [ShipmentStatus.FAILED]: [
      ShipmentStatus.READY_TO_SHIP, // Allow retry from failed shipping
    ],
    [ShipmentStatus.CANCELLED]: [],
  };

  /**
   * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
   */
  static validateTransition(fromStatus: ShipmentStatus, toStatus: ShipmentStatus): void {
    if (fromStatus === toStatus) {
      return; // Idempotent no-op
    }

    const allowedNextStates = this.allowedTransitions[fromStatus] || [];
    if (!allowedNextStates.includes(toStatus)) {
      throw new BadRequestException(
        `Illegal shipment state transition: Cannot transition from ${fromStatus} to ${toStatus}. Allowed transitions: [${allowedNextStates.join(', ')}]`
      );
    }
  }

  /**
   * Checks if an incoming event status is stale compared to current shipment status.
   * e.g., if shipment is already DELIVERED, an incoming IN_TRANSIT event is considered stale.
   */
  static isStaleEvent(currentStatus: ShipmentStatus, eventStatus: ShipmentStatus): boolean {
    if (currentStatus === ShipmentStatus.DELIVERED && eventStatus !== ShipmentStatus.RETURNED) {
      return true;
    }
    const currentRank = this.statusHierarchy[currentStatus] || 0;
    const eventRank = this.statusHierarchy[eventStatus] || 0;
    return eventRank < currentRank;
  }

  /**
   * Resolves the corresponding OrderStatus for a ShipmentStatus transition.
   */
  static resolveOrderStatus(shipmentStatus: ShipmentStatus): OrderStatus | null {
    switch (shipmentStatus) {
      case ShipmentStatus.PACKING:
      case ShipmentStatus.PACKED:
        return OrderStatus.PROCESSING;
      case ShipmentStatus.READY_TO_SHIP:
      case ShipmentStatus.HANDED_OVER:
        return OrderStatus.READY_FOR_SHIPMENT;
      case ShipmentStatus.SHIPPED:
      case ShipmentStatus.IN_TRANSIT:
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return OrderStatus.SHIPPED;
      case ShipmentStatus.DELIVERED:
        return OrderStatus.DELIVERED;
      default:
        return null; // Keep existing status
    }
  }
}
