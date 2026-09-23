"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStateMachine = void 0;
const client_1 = require("@prisma/client");
const app_error_1 = require("../../errors/app-error");
class PaymentStateMachine {
    static allowedTransitions = {
        [client_1.PaymentStatus.PENDING]: [
            client_1.PaymentStatus.AUTHORIZED,
            client_1.PaymentStatus.PAID,
            client_1.PaymentStatus.FAILED,
            client_1.PaymentStatus.CANCELLED,
        ],
        [client_1.PaymentStatus.AUTHORIZED]: [
            client_1.PaymentStatus.PAID,
            client_1.PaymentStatus.FAILED,
            client_1.PaymentStatus.CANCELLED,
        ],
        [client_1.PaymentStatus.PAID]: [
            client_1.PaymentStatus.REFUNDED,
            client_1.PaymentStatus.PARTIALLY_REFUNDED,
        ],
        [client_1.PaymentStatus.PARTIALLY_REFUNDED]: [
            client_1.PaymentStatus.REFUNDED,
            client_1.PaymentStatus.PARTIALLY_REFUNDED,
        ],
        [client_1.PaymentStatus.FAILED]: [],
        [client_1.PaymentStatus.CANCELLED]: [],
        [client_1.PaymentStatus.REFUNDED]: [],
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
            throw new app_error_1.BadRequestException(`Illegal payment state transition: Cannot transition from ${fromStatus} to ${toStatus}. Allowed transitions from ${fromStatus}: [${allowedNextStates.join(', ')}]`);
        }
    }
    /**
     * Resolves the corresponding OrderStatus for a PaymentStatus transition.
     */
    static resolveOrderStatus(paymentStatus) {
        switch (paymentStatus) {
            case client_1.PaymentStatus.PAID:
                return client_1.OrderStatus.PAYMENT_CONFIRMED;
            case client_1.PaymentStatus.REFUNDED:
                return client_1.OrderStatus.REFUNDED;
            case client_1.PaymentStatus.CANCELLED:
                return client_1.OrderStatus.CANCELLED;
            default:
                return null; // Keeps current order status
        }
    }
}
exports.PaymentStateMachine = PaymentStateMachine;
//# sourceMappingURL=payment-state-machine.js.map