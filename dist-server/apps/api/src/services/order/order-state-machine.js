"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStateMachine = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../../errors/app-error");
class OrderStateMachine {
    static allowedTransitions = {
        [client_1.OrderStatus.DRAFT]: [
            client_1.OrderStatus.PENDING_PAYMENT,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.PENDING_PAYMENT]: [
            client_1.OrderStatus.PAYMENT_CONFIRMED,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.PAYMENT_CONFIRMED]: [
            client_1.OrderStatus.PROCESSING,
            client_1.OrderStatus.READY_FOR_SHIPMENT,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.PROCESSING]: [
            client_1.OrderStatus.READY_FOR_SHIPMENT,
            client_1.OrderStatus.SHIPPED,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.READY_FOR_SHIPMENT]: [
            client_1.OrderStatus.SHIPPED,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.SHIPPED]: [
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.RETURN_REQUESTED,
            client_1.OrderStatus.CANCELLED,
        ],
        [client_1.OrderStatus.DELIVERED]: [
            client_1.OrderStatus.RETURN_REQUESTED,
            client_1.OrderStatus.REFUNDED,
        ],
        [client_1.OrderStatus.RETURN_REQUESTED]: [
            client_1.OrderStatus.RETURNED,
            client_1.OrderStatus.DELIVERED, // When return request is rejected
            client_1.OrderStatus.REFUNDED,
        ],
        [client_1.OrderStatus.RETURNED]: [
            client_1.OrderStatus.REFUNDED,
        ],
        [client_1.OrderStatus.CANCELLED]: [
            client_1.OrderStatus.REFUNDED, // If paid order cancelled and refund processed
        ],
        [client_1.OrderStatus.REFUNDED]: [],
    };
    /**
     * Checks whether a transition from `fromStatus` to `toStatus` is permitted.
     */
    static canTransition(fromStatus, toStatus) {
        if (fromStatus === toStatus)
            return true;
        const allowed = this.allowedTransitions[fromStatus] || [];
        return allowed.includes(toStatus);
    }
    /**
     * Checks whether the status is terminal (no further forward business operations).
     */
    static isTerminal(status) {
        return status === client_1.OrderStatus.CANCELLED || status === client_1.OrderStatus.REFUNDED;
    }
    /**
     * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
     */
    static validateTransition(fromStatus, toStatus) {
        if (fromStatus === toStatus) {
            return; // Idempotent no-op
        }
        const allowedNextStates = this.allowedTransitions[fromStatus] || [];
        if (!allowedNextStates.includes(toStatus)) {
            throw new app_error_1.BadRequestException(`Invalid order status transition: Cannot transition from '${fromStatus}' to '${toStatus}'. Allowed next states: [${allowedNextStates.join(', ')}]`);
        }
    }
    /**
     * Evaluates if a customer is allowed to cancel an order under business policy.
     * Customer can cancel if order is in PENDING_PAYMENT, PAYMENT_CONFIRMED, or PROCESSING,
     * provided parcel has not yet been dispatched by courier.
     */
    static canCustomerCancel(status, shipments = []) {
        const cancellableStatuses = [
            client_1.OrderStatus.PENDING_PAYMENT,
            client_1.OrderStatus.PAYMENT_CONFIRMED,
            client_1.OrderStatus.PROCESSING,
        ];
        if (!cancellableStatuses.includes(status)) {
            return {
                allowed: false,
                reason: `Cannot cancel order: Orders in status '${status}' cannot be cancelled by customer.`,
            };
        }
        const hasDispatchedShipment = shipments.some((s) => ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status));
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
    static canStaffCancel(status, shipments = []) {
        if (status === client_1.OrderStatus.CANCELLED || status === client_1.OrderStatus.REFUNDED || status === client_1.OrderStatus.RETURNED) {
            return {
                allowed: false,
                reason: `Cannot cancel order: Order is already in terminal status '${status}'.`,
            };
        }
        const isDelivered = shipments.some((s) => s.status === 'DELIVERED') || status === client_1.OrderStatus.DELIVERED;
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
    static canRequestReturn(status, shipments = []) {
        const isDelivered = status === client_1.OrderStatus.DELIVERED || shipments.some((s) => s.status === 'DELIVERED');
        if (!isDelivered) {
            return {
                allowed: false,
                reason: `Cannot request return: Only DELIVERED orders can request returns. Current order status: '${status}'.`,
            };
        }
        if (status === client_1.OrderStatus.RETURN_REQUESTED || status === client_1.OrderStatus.RETURNED) {
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
    static resolveOrderStatusFromPayment(arg1, arg2) {
        let paymentStatus;
        let currentOrderStatus;
        if (Object.values(client_1.PaymentStatus).includes(arg1)) {
            paymentStatus = arg1;
            currentOrderStatus = arg2;
        }
        else {
            currentOrderStatus = arg1;
            paymentStatus = arg2;
        }
        switch (paymentStatus) {
            case client_1.PaymentStatus.PAID:
                if (currentOrderStatus === client_1.OrderStatus.PENDING_PAYMENT || currentOrderStatus === client_1.OrderStatus.DRAFT) {
                    return client_1.OrderStatus.PAYMENT_CONFIRMED;
                }
                return currentOrderStatus; // Never regress forward fulfillment states (e.g. PROCESSING, SHIPPED, DELIVERED)
            case client_1.PaymentStatus.REFUNDED:
                if (currentOrderStatus === client_1.OrderStatus.CANCELLED ||
                    currentOrderStatus === client_1.OrderStatus.RETURNED ||
                    currentOrderStatus === client_1.OrderStatus.DELIVERED ||
                    currentOrderStatus === client_1.OrderStatus.RETURN_REQUESTED) {
                    return client_1.OrderStatus.REFUNDED;
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
    static resolveOrderStatusFromShipment(arg1, arg2) {
        let shipmentStatus;
        let currentOrderStatus;
        if (Object.values(client_1.ShipmentStatus).includes(arg1)) {
            shipmentStatus = arg1;
            currentOrderStatus = arg2;
        }
        else {
            currentOrderStatus = arg1;
            shipmentStatus = arg2;
        }
        switch (shipmentStatus) {
            case client_1.ShipmentStatus.PACKING:
            case client_1.ShipmentStatus.PACKED:
                if (currentOrderStatus === client_1.OrderStatus.PAYMENT_CONFIRMED) {
                    return client_1.OrderStatus.PROCESSING;
                }
                return currentOrderStatus;
            case client_1.ShipmentStatus.READY_TO_SHIP:
            case client_1.ShipmentStatus.HANDED_OVER:
                if (currentOrderStatus === client_1.OrderStatus.PROCESSING || currentOrderStatus === client_1.OrderStatus.PAYMENT_CONFIRMED) {
                    return client_1.OrderStatus.READY_FOR_SHIPMENT;
                }
                return currentOrderStatus;
            case client_1.ShipmentStatus.SHIPPED:
            case client_1.ShipmentStatus.IN_TRANSIT:
            case client_1.ShipmentStatus.OUT_FOR_DELIVERY:
                if (currentOrderStatus === client_1.OrderStatus.PAYMENT_CONFIRMED ||
                    currentOrderStatus === client_1.OrderStatus.PROCESSING ||
                    currentOrderStatus === client_1.OrderStatus.READY_FOR_SHIPMENT) {
                    return client_1.OrderStatus.SHIPPED;
                }
                return currentOrderStatus; // Stale in-transit event must not regress DELIVERED or RETURNED
            case client_1.ShipmentStatus.DELIVERED:
                if (currentOrderStatus === client_1.OrderStatus.PAYMENT_CONFIRMED ||
                    currentOrderStatus === client_1.OrderStatus.PROCESSING ||
                    currentOrderStatus === client_1.OrderStatus.READY_FOR_SHIPMENT ||
                    currentOrderStatus === client_1.OrderStatus.SHIPPED) {
                    return client_1.OrderStatus.DELIVERED;
                }
                return currentOrderStatus; // Does not overwrite RETURN_REQUESTED, RETURNED, CANCELLED, or REFUNDED
            default:
                return currentOrderStatus;
        }
    }
}
exports.OrderStateMachine = OrderStateMachine;
//# sourceMappingURL=order-state-machine.js.map