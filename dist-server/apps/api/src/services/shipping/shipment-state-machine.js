"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentStateMachine = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../../errors/app-error");
class ShipmentStateMachine {
    static statusHierarchy = {
        [client_1.ShipmentStatus.PENDING]: 0,
        [client_1.ShipmentStatus.READY_TO_FULFILL]: 1,
        [client_1.ShipmentStatus.PICKED]: 2,
        [client_1.ShipmentStatus.PACKING]: 3,
        [client_1.ShipmentStatus.PACKED]: 4,
        [client_1.ShipmentStatus.READY_TO_SHIP]: 5,
        [client_1.ShipmentStatus.HANDED_OVER]: 6,
        [client_1.ShipmentStatus.SHIPPED]: 7,
        [client_1.ShipmentStatus.IN_TRANSIT]: 8,
        [client_1.ShipmentStatus.OUT_FOR_DELIVERY]: 9,
        [client_1.ShipmentStatus.DELIVERED]: 10,
        [client_1.ShipmentStatus.RETURNED]: 11,
        [client_1.ShipmentStatus.FAILED]: 99,
        [client_1.ShipmentStatus.CANCELLED]: 99,
    };
    static allowedTransitions = {
        [client_1.ShipmentStatus.PENDING]: [
            client_1.ShipmentStatus.READY_TO_FULFILL,
            client_1.ShipmentStatus.PICKED,
            client_1.ShipmentStatus.PACKING,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.READY_TO_FULFILL]: [
            client_1.ShipmentStatus.PICKED,
            client_1.ShipmentStatus.PACKING,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.PICKED]: [
            client_1.ShipmentStatus.PACKING,
            client_1.ShipmentStatus.PACKED,
            client_1.ShipmentStatus.READY_TO_SHIP,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.PACKING]: [
            client_1.ShipmentStatus.PACKED,
            client_1.ShipmentStatus.READY_TO_SHIP,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.PACKED]: [
            client_1.ShipmentStatus.READY_TO_SHIP,
            client_1.ShipmentStatus.HANDED_OVER,
            client_1.ShipmentStatus.SHIPPED,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.READY_TO_SHIP]: [
            client_1.ShipmentStatus.HANDED_OVER,
            client_1.ShipmentStatus.SHIPPED,
            client_1.ShipmentStatus.FAILED,
            client_1.ShipmentStatus.CANCELLED,
        ],
        [client_1.ShipmentStatus.HANDED_OVER]: [
            client_1.ShipmentStatus.SHIPPED,
            client_1.ShipmentStatus.IN_TRANSIT,
            client_1.ShipmentStatus.OUT_FOR_DELIVERY,
            client_1.ShipmentStatus.DELIVERED,
            client_1.ShipmentStatus.FAILED,
        ],
        [client_1.ShipmentStatus.SHIPPED]: [
            client_1.ShipmentStatus.IN_TRANSIT,
            client_1.ShipmentStatus.OUT_FOR_DELIVERY,
            client_1.ShipmentStatus.DELIVERED,
            client_1.ShipmentStatus.FAILED,
        ],
        [client_1.ShipmentStatus.IN_TRANSIT]: [
            client_1.ShipmentStatus.OUT_FOR_DELIVERY,
            client_1.ShipmentStatus.DELIVERED,
            client_1.ShipmentStatus.FAILED,
        ],
        [client_1.ShipmentStatus.OUT_FOR_DELIVERY]: [
            client_1.ShipmentStatus.DELIVERED,
            client_1.ShipmentStatus.FAILED,
            client_1.ShipmentStatus.RETURNED,
        ],
        [client_1.ShipmentStatus.DELIVERED]: [
            client_1.ShipmentStatus.RETURNED,
        ],
        [client_1.ShipmentStatus.RETURNED]: [],
        [client_1.ShipmentStatus.FAILED]: [
            client_1.ShipmentStatus.READY_TO_SHIP, // Allow retry from failed shipping
        ],
        [client_1.ShipmentStatus.CANCELLED]: [],
    };
    /**
     * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
     */
    static validateTransition(fromStatus, toStatus) {
        if (fromStatus === toStatus) {
            return; // Idempotent no-op
        }
        const allowedNextStates = this.allowedTransitions[fromStatus] || [];
        if (!allowedNextStates.includes(toStatus)) {
            throw new app_error_1.BadRequestException(`Illegal shipment state transition: Cannot transition from ${fromStatus} to ${toStatus}. Allowed transitions: [${allowedNextStates.join(', ')}]`);
        }
    }
    /**
     * Checks if an incoming event status is stale compared to current shipment status.
     * e.g., if shipment is already DELIVERED, an incoming IN_TRANSIT event is considered stale.
     */
    static isStaleEvent(currentStatus, eventStatus) {
        if (currentStatus === client_1.ShipmentStatus.DELIVERED && eventStatus !== client_1.ShipmentStatus.RETURNED) {
            return true;
        }
        const currentRank = this.statusHierarchy[currentStatus] || 0;
        const eventRank = this.statusHierarchy[eventStatus] || 0;
        return eventRank < currentRank;
    }
    /**
     * Resolves the corresponding OrderStatus for a ShipmentStatus transition.
     */
    static resolveOrderStatus(shipmentStatus) {
        switch (shipmentStatus) {
            case client_1.ShipmentStatus.PACKING:
            case client_1.ShipmentStatus.PACKED:
                return client_1.OrderStatus.PROCESSING;
            case client_1.ShipmentStatus.READY_TO_SHIP:
            case client_1.ShipmentStatus.HANDED_OVER:
                return client_1.OrderStatus.READY_FOR_SHIPMENT;
            case client_1.ShipmentStatus.SHIPPED:
            case client_1.ShipmentStatus.IN_TRANSIT:
            case client_1.ShipmentStatus.OUT_FOR_DELIVERY:
                return client_1.OrderStatus.SHIPPED;
            case client_1.ShipmentStatus.DELIVERED:
                return client_1.OrderStatus.DELIVERED;
            default:
                return null; // Keep existing status
        }
    }
}
exports.ShipmentStateMachine = ShipmentStateMachine;
//# sourceMappingURL=shipment-state-machine.js.map