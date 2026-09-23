import { ShipmentStatus, OrderStatus } from '@prisma/client';
export declare class ShipmentStateMachine {
    private static readonly statusHierarchy;
    private static readonly allowedTransitions;
    /**
     * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
     */
    static validateTransition(fromStatus: ShipmentStatus, toStatus: ShipmentStatus): void;
    /**
     * Checks if an incoming event status is stale compared to current shipment status.
     * e.g., if shipment is already DELIVERED, an incoming IN_TRANSIT event is considered stale.
     */
    static isStaleEvent(currentStatus: ShipmentStatus, eventStatus: ShipmentStatus): boolean;
    /**
     * Resolves the corresponding OrderStatus for a ShipmentStatus transition.
     */
    static resolveOrderStatus(shipmentStatus: ShipmentStatus): OrderStatus | null;
}
