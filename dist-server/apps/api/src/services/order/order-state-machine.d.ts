import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
export declare class OrderStateMachine {
    private static readonly allowedTransitions;
    /**
     * Checks whether a transition from `fromStatus` to `toStatus` is permitted.
     */
    static canTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean;
    /**
     * Checks whether the status is terminal (no further forward business operations).
     */
    static isTerminal(status: OrderStatus): boolean;
    /**
     * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
     */
    static validateTransition(fromStatus: OrderStatus, toStatus: OrderStatus): void;
    /**
     * Evaluates if a customer is allowed to cancel an order under business policy.
     * Customer can cancel if order is in PENDING_PAYMENT, PAYMENT_CONFIRMED, or PROCESSING,
     * provided parcel has not yet been dispatched by courier.
     */
    static canCustomerCancel(status: OrderStatus, shipments?: any[]): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Evaluates if staff can cancel an order.
     */
    static canStaffCancel(status: OrderStatus, shipments?: any[]): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Evaluates if an order is eligible for a customer return request.
     */
    static canRequestReturn(status: OrderStatus, shipments?: any[]): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Cross-domain synchronization: Resolves OrderStatus when payment state changes.
     * Supports both (paymentStatus, currentOrderStatus) and (currentOrderStatus, paymentStatus).
     */
    static resolveOrderStatusFromPayment(arg1: PaymentStatus | OrderStatus, arg2: OrderStatus | PaymentStatus): OrderStatus | null;
    /**
     * Cross-domain synchronization: Resolves OrderStatus when shipment state changes.
     * Supports both (shipmentStatus, currentOrderStatus) and (currentOrderStatus, shipmentStatus).
     */
    static resolveOrderStatusFromShipment(arg1: ShipmentStatus | OrderStatus, arg2: OrderStatus | ShipmentStatus): OrderStatus | null;
}
