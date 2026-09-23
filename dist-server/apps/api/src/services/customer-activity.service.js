"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerActivityService = void 0;
const customer_activity_repository_1 = require("../repositories/customer-activity.repository");
const client_1 = require("@prisma/client");
class CustomerActivityService {
    /**
     * Records a customer activity event asynchronously without blocking caller.
     */
    static async record(data) {
        try {
            return await customer_activity_repository_1.CustomerActivityRepository.recordActivity(data);
        }
        catch (err) {
            console.error('[CustomerActivityService] Failed to record activity:', err.message);
            return null;
        }
    }
    /**
     * Helper for recording account created.
     */
    static async onAccountCreated(userId, customerId) {
        return this.record({
            userId,
            customerId,
            eventType: client_1.CustomerActivityType.ACCOUNT_CREATED,
            description: 'Customer account created',
        });
    }
    /**
     * Helper for recording order lifecycle events.
     */
    static async onOrderEvent(eventType, orderId, orderNumber, customerId, userId, grandTotal) {
        const descriptions = {
            ORDER_CREATED: `Order ${orderNumber} created (฿${grandTotal})`,
            ORDER_PAID: `Payment confirmed for order ${orderNumber}`,
            ORDER_SHIPPED: `Order ${orderNumber} shipped`,
            ORDER_DELIVERED: `Order ${orderNumber} delivered`,
        };
        return this.record({
            userId,
            customerId,
            eventType,
            description: descriptions[eventType] || `Order ${orderNumber} event: ${eventType}`,
            metadata: { orderId, orderNumber, grandTotal },
        });
    }
    /**
     * Helper for recording promotion / loyalty events.
     */
    static async onPromotionEvent(eventType, description, customerId, userId, metadata) {
        return this.record({
            userId,
            customerId,
            eventType,
            description,
            metadata,
        });
    }
}
exports.CustomerActivityService = CustomerActivityService;
//# sourceMappingURL=customer-activity.service.js.map