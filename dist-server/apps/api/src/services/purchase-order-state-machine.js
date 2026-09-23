"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderStateMachine = void 0;
const database_1 = require("@car-parts/database");
const app_error_1 = require("../errors/app-error");
class PurchaseOrderStateMachine {
    static LEGAL_TRANSITIONS = {
        [database_1.PurchaseOrderStatus.DRAFT]: [
            database_1.PurchaseOrderStatus.PENDING_APPROVAL,
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.PENDING_APPROVAL]: [
            database_1.PurchaseOrderStatus.APPROVED,
            database_1.PurchaseOrderStatus.REJECTED,
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.APPROVED]: [
            database_1.PurchaseOrderStatus.SENT,
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.REJECTED]: [
            database_1.PurchaseOrderStatus.DRAFT, // Can revise back to DRAFT for resubmission
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.SENT]: [
            database_1.PurchaseOrderStatus.PARTIALLY_RECEIVED,
            database_1.PurchaseOrderStatus.RECEIVED,
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.PARTIALLY_RECEIVED]: [
            database_1.PurchaseOrderStatus.PARTIALLY_RECEIVED,
            database_1.PurchaseOrderStatus.RECEIVED,
            database_1.PurchaseOrderStatus.CLOSED,
            database_1.PurchaseOrderStatus.CANCELLED,
        ],
        [database_1.PurchaseOrderStatus.RECEIVED]: [
            database_1.PurchaseOrderStatus.CLOSED,
        ],
        [database_1.PurchaseOrderStatus.CANCELLED]: [],
        [database_1.PurchaseOrderStatus.CLOSED]: [],
    };
    /**
     * Checks if a transition from currentStatus to nextStatus is legally permitted.
     */
    static canTransition(currentStatus, nextStatus) {
        const allowed = this.LEGAL_TRANSITIONS[currentStatus] || [];
        return allowed.includes(nextStatus);
    }
    /**
     * Asserts that a transition from currentStatus to nextStatus is legal, throwing BadRequestException if invalid.
     */
    static assertValidTransition(currentStatus, nextStatus, poNumber) {
        if (!this.canTransition(currentStatus, nextStatus)) {
            throw new app_error_1.BadRequestException(`Invalid Purchase Order status transition: Cannot transition PO '${poNumber || 'N/A'}' from '${currentStatus}' to '${nextStatus}'. Legal target statuses are: [${(this.LEGAL_TRANSITIONS[currentStatus] || []).join(', ')}]`);
        }
    }
    /**
     * Determines if PO details and items can be edited.
     */
    static isEditable(status) {
        return status === database_1.PurchaseOrderStatus.DRAFT;
    }
    /**
     * Determines if PO can accept receiving of goods.
     */
    static isReceivable(status) {
        return status === database_1.PurchaseOrderStatus.SENT || status === database_1.PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }
}
exports.PurchaseOrderStateMachine = PurchaseOrderStateMachine;
//# sourceMappingURL=purchase-order-state-machine.js.map