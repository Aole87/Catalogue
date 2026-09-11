import { CustomerActivityRepository, CreateCustomerActivityData } from '../repositories/customer-activity.repository';
import { CustomerActivityType } from '@prisma/client';

export class CustomerActivityService {
  /**
   * Records a customer activity event asynchronously without blocking caller.
   */
  static async record(data: CreateCustomerActivityData) {
    try {
      return await CustomerActivityRepository.recordActivity(data);
    } catch (err: any) {
      console.error('[CustomerActivityService] Failed to record activity:', err.message);
      return null;
    }
  }

  /**
   * Helper for recording account created.
   */
  static async onAccountCreated(userId: string, customerId?: string | null) {
    return this.record({
      userId,
      customerId,
      eventType: CustomerActivityType.ACCOUNT_CREATED,
      description: 'Customer account created',
    });
  }

  /**
   * Helper for recording order lifecycle events.
   */
  static async onOrderEvent(
    eventType: CustomerActivityType,
    orderId: string,
    orderNumber: string,
    customerId?: string | null,
    userId?: string | null,
    grandTotal?: string | number
  ) {
    const descriptions: Record<string, string> = {
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
  static async onPromotionEvent(
    eventType: CustomerActivityType,
    description: string,
    customerId?: string | null,
    userId?: string | null,
    metadata?: any
  ) {
    return this.record({
      userId,
      customerId,
      eventType,
      description,
      metadata,
    });
  }
}
