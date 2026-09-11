import crypto from 'crypto';
import { OrderRepository, AdminOrderQueryParams, CustomerOrderQueryParams } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { PricingService } from './pricing.service';
import { PromotionService, PromotionLineItem } from './promotion.service';
import { LoyaltyService } from './loyalty.service';
import { CustomerActivityService } from './customer-activity.service';
import { CustomerSegmentService } from './customer-segment.service';
import { OrderStateMachine } from './order/order-state-machine';
import { NotFoundException, BadRequestException, ForbiddenException } from '../errors/app-error';
import { OrderStatus, PaymentStatus, CustomerActivityType } from '@prisma/client';
import { prisma } from '@car-parts/database';

export interface ShippingAddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  subdistrict?: string;
  district?: string;
  province: string;
  postalCode: string;
}

export interface CheckoutInput {
  userId?: string;
  sessionToken?: string;
  shippingAddress: ShippingAddressInput;
  customerNotes?: string;
  paymentMethod?: string;
  couponCode?: string;
  loyaltyPointsToRedeem?: number;
}

export class OrderService {
  /**
   * Generates a unique, standardized order number with date prefix.
   */
  private static generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${year}${month}${day}-${randomHex}`;
  }

  /**
   * Formats order output for API responses.
   */
  static formatOrderResponse(order: any) {
    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal).toFixed(2),
      discountTotal: Number(order.discountTotal).toFixed(2),
      shippingTotal: Number(order.shippingTotal).toFixed(2),
      taxTotal: Number(order.taxTotal).toFixed(2),
      grandTotal: Number(order.grandTotal).toFixed(2),
      promotionId: order.promotionId || null,
      couponCode: order.couponCode || null,
      loyaltyPointsRedeemed: order.loyaltyPointsRedeemed || 0,
      loyaltyPointsEarned: order.loyaltyPointsEarned || 0,
      promotionSnapshot: order.promotionSnapshot || null,
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.customer
        ? {
            id: order.customer.id,
            customerType: order.customer.customerType,
            companyName: order.customer.companyName,
            phone: order.customer.phone,
            user: order.customer.user
              ? {
                  id: order.customer.user.id,
                  email: order.customer.user.email,
                  firstName: order.customer.user.firstName,
                  lastName: order.customer.user.lastName,
                  displayName: order.customer.user.displayName,
                }
              : undefined,
          }
        : undefined,
      shippingAddress:
        order.shipments?.[0]?.addressSnapshot ||
        (order.shipments?.[0]?.recipientName
          ? {
              recipientName: order.shipments[0].recipientName,
              phone: order.shipments[0].phone,
              addressLine: order.shipments[0].addressLine1,
              streetAddress: order.shipments[0].addressLine1,
              subdistrict: order.shipments[0].subdistrict,
              district: order.shipments[0].district,
              province: order.shipments[0].province,
              postalCode: order.shipments[0].postalCode,
            }
          : order.customer?.addresses?.[0]
          ? {
              recipientName: order.customer.addresses[0].recipientName,
              phone: order.customer.addresses[0].phone,
              addressLine: order.customer.addresses[0].addressLine1,
              streetAddress: order.customer.addresses[0].addressLine1,
              subdistrict: order.customer.addresses[0].subdistrict,
              district: order.customer.addresses[0].district,
              province: order.customer.addresses[0].province,
              postalCode: order.customer.addresses[0].postalCode,
            }
          : null),
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        unitPrice: Number(item.unitPrice).toFixed(2),
        quantity: item.quantity,
        discountTotal: Number(item.discountTotal).toFixed(2),
        taxTotal: Number(item.taxTotal).toFixed(2),
        lineTotal: Number(item.lineTotal).toFixed(2),
        productSnapshot: item.productSnapshot,
      })),
      statusHistory: (order.statusHistory || []).map((h: any) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        changedBy: h.changedByUser
          ? {
              id: h.changedByUser.id,
              displayName: h.changedByUser.displayName || `${h.changedByUser.firstName} ${h.changedByUser.lastName}`.trim(),
              email: h.changedByUser.email,
            }
          : undefined,
        createdAt: h.createdAt,
      })),
      payments: (order.payments || []).map((p: any) => ({
        id: p.id,
        internalReference: p.internalReference,
        provider: p.provider,
        method: p.method,
        status: p.status,
        amount: Number(p.amount).toFixed(2),
        currency: p.currency,
        providerReference: p.providerReference,
        metadata: p.metadata,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        events: (p.events || []).map((e: any) => ({
          id: e.id,
          eventType: e.eventType,
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          reason: e.reason,
          createdAt: e.createdAt,
        })),
        slips: (p.slips || []).map((s: any) => ({
          id: s.id,
          slipUrl: s.slipUrl,
          bankName: s.bankName,
          status: s.status,
          createdAt: s.createdAt,
        })),
        refunds: (p.refunds || []).map((r: any) => ({
          id: r.id,
          refundReference: r.refundReference,
          amount: Number(r.amount).toFixed(2),
          status: r.status,
          reason: r.reason,
          createdAt: r.createdAt,
        })),
      })),
      shipments: (order.shipments || []).map((s: any) => ({
        id: s.id,
        shipmentNumber: s.shipmentNumber,
        carrier: s.carrier,
        serviceLevel: s.serviceLevel,
        trackingNumber: s.trackingNumber,
        status: s.status,
        shippingCost: Number(s.shippingCost || 0).toFixed(2),
        currency: s.currency,
        recipientName: s.recipientName,
        phone: s.phone,
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2,
        subdistrict: s.subdistrict,
        district: s.district,
        province: s.province,
        postalCode: s.postalCode,
        country: s.country,
        addressSnapshot: s.addressSnapshot,
        estimatedDelivery: s.estimatedDelivery,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
        shippingMethod: s.shippingMethod
          ? {
              id: s.shippingMethod.id,
              name: s.shippingMethod.name,
              code: s.shippingMethod.code,
              carrier: s.shippingMethod.carrier,
              basePrice: Number(s.shippingMethod.basePrice).toFixed(2),
            }
          : undefined,
        events: (s.events || []).map((e: any) => ({
          id: e.id,
          status: e.status,
          description: e.description,
          location: e.location,
          providerEventId: e.providerEventId,
          occurredAt: e.occurredAt,
          actorId: e.actorId,
          createdAt: e.createdAt,
        })),
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Masks sensitive PII string (e.g. names, addresses).
   */
  private static maskString(str?: string | null): string {
    if (!str) return '';
    const trimmed = str.trim();
    if (trimmed.length <= 2) return trimmed.charAt(0) + '*';
    return trimmed.charAt(0) + '***' + trimmed.charAt(trimmed.length - 1);
  }

  /**
   * Masks email address (e.g. somchai@autoworkshop.com -> s***@***.com).
   */
  private static maskEmail(email?: string | null): string {
    if (!email || !email.includes('@')) return '***@***.com';
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? domainParts.pop() : 'com';
    return `${maskedLocal}@***.${tld}`;
  }

  /**
   * Masks phone number (e.g. 0812345678 -> 081-***-5678).
   */
  private static maskPhone(phone?: string | null): string {
    if (!phone) return '***';
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 9) {
      return `${clean.slice(0, 3)}-***-${clean.slice(-4)}`;
    }
    return '***-' + clean.slice(-2);
  }

  /**
   * Formats public/guest confirmation view with strict PII masking and zero internal audit leakage.
   */
  static formatPublicOrderConfirmation(order: any) {
    if (!order) return null;

    const rawShipping =
      order.shipments?.[0]?.addressSnapshot ||
      (order.shipments?.[0]?.recipientName
        ? {
            recipientName: order.shipments[0].recipientName,
            phone: order.shipments[0].phone,
            addressLine: order.shipments[0].addressLine1,
            subdistrict: order.shipments[0].subdistrict,
            district: order.shipments[0].district,
            province: order.shipments[0].province,
            postalCode: order.shipments[0].postalCode,
          }
        : order.customer?.addresses?.[0]
        ? {
            recipientName: order.customer.addresses[0].recipientName,
            phone: order.customer.addresses[0].phone,
            addressLine: order.customer.addresses[0].addressLine1,
            subdistrict: order.customer.addresses[0].subdistrict,
            district: order.customer.addresses[0].district,
            province: order.customer.addresses[0].province,
            postalCode: order.customer.addresses[0].postalCode,
          }
        : null);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal).toFixed(2),
      discountTotal: Number(order.discountTotal).toFixed(2),
      shippingTotal: Number(order.shippingTotal).toFixed(2),
      taxTotal: Number(order.taxTotal).toFixed(2),
      grandTotal: Number(order.grandTotal).toFixed(2),
      isPublicConfirmation: true,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.customer
        ? {
            customerType: order.customer.customerType,
            companyName: order.customer.companyName ? this.maskString(order.customer.companyName) : undefined,
            phone: order.customer.phone ? this.maskPhone(order.customer.phone) : undefined,
            user: order.customer.user
              ? {
                  email: this.maskEmail(order.customer.user.email),
                  displayName: this.maskString(
                    order.customer.user.displayName ||
                      `${order.customer.user.firstName || ''} ${order.customer.user.lastName || ''}`.trim()
                  ),
                }
              : undefined,
          }
        : undefined,
      shippingAddress: rawShipping
        ? {
            recipientName: this.maskString(rawShipping.recipientName),
            phone: this.maskPhone(rawShipping.phone),
            addressLine: this.maskString(rawShipping.addressLine || rawShipping.streetAddress || rawShipping.addressLine1),
            province: rawShipping.province,
            postalCode: rawShipping.postalCode,
          }
        : null,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        unitPrice: Number(item.unitPrice).toFixed(2),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal).toFixed(2),
        productSnapshot: item.productSnapshot
          ? {
              name: item.productSnapshot.name,
              sku: item.productSnapshot.sku,
              brand: item.productSnapshot.brand,
              primaryImage: item.productSnapshot.primaryImage,
            }
          : undefined,
      })),
      statusHistory: (order.statusHistory || []).map((h: any) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        createdAt: h.createdAt,
      })),
      payments: (order.payments || []).map((p: any) => ({
        id: p.id,
        method: p.method,
        status: p.status,
        amount: Number(p.amount).toFixed(2),
        currency: p.currency,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      shipments: (order.shipments || []).map((s: any) => ({
        id: s.id,
        shipmentNumber: s.shipmentNumber,
        carrier: s.carrier,
        serviceLevel: s.serviceLevel,
        trackingNumber: s.trackingNumber,
        status: s.status,
        estimatedDelivery: s.estimatedDelivery,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
      })),
    };
  }

  /**
   * Authorizes that a user owns the order or has staff/admin privileges.
   */
  private static async verifyOrderOwnership(order: any, userId?: string, userRoles: string[] = []) {
    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (isStaff) return;

    if (!userId) {
      return; // Guest / unauthenticated order lookup
    }

    const user = await UserRepository.findById(userId);
    if (user?.customerProfile && order.customerId === user.customerProfile.id) {
      return; // Valid owner
    }
    if (!order.customerId) {
      return; // Guest order accessible
    }

    throw new ForbiddenException('You do not have permission to view or manage this order');
  }

  /**
   * Executes atomic checkout from the active cart with server-authoritative pricing.
   */
  static async checkout(input: CheckoutInput) {
    const { userId, sessionToken, shippingAddress, customerNotes, paymentMethod } = input;

    if (!shippingAddress) {
      throw new BadRequestException('Shipping address is required');
    }

    if (!shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.province || !shippingAddress.postalCode) {
      throw new BadRequestException('Recipient name, phone, address line, province, and postal code are required');
    }

    // Find active cart
    const cart = await CartRepository.findActiveCart({ userId, sessionToken });
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty. Please add items to cart before checking out.');
    }

    // Resolve user profile & price tier
    const userTier = await PricingService.resolveUserTier(userId);

    let customerProfileId: string | null = null;
    if (userId) {
      const user = await UserRepository.findById(userId);
      if (user?.customerProfile) {
        customerProfileId = user.customerProfile.id;
      }
    }

    // Validate each product in cart is active, published, and not deleted
    for (const cartItem of cart.items) {
      if (!cartItem.product || !cartItem.product.isActive || !cartItem.product.isPublished || cartItem.product.deletedAt) {
        throw new BadRequestException(`Product '${cartItem.product?.name || cartItem.productId}' is no longer available for purchase.`);
      }
    }

    // Server-side calculation of all line items
    const calculatedItems = cart.items.map((cartItem) => {
      const lineCalc = PricingService.calculateLineItem(
        cartItem.product,
        userTier,
        cartItem.quantity,
        cartItem.vehicleVariantId
      );

      const productSnapshot = {
        name: cartItem.product.name,
        sku: cartItem.product.sku,
        brand: cartItem.product.brand?.name || null,
        category: cartItem.product.category?.name || null,
        primaryImage: lineCalc.primaryImage,
        vehicleVariant: cartItem.vehicleVariant
          ? {
              id: cartItem.vehicleVariant.id,
              name: cartItem.vehicleVariant.name,
              generation: cartItem.vehicleVariant.generation?.name,
              model: cartItem.vehicleVariant.generation?.model?.name,
              make: cartItem.vehicleVariant.generation?.model?.make?.name,
            }
          : null,
      };

      return {
        productId: cartItem.productId,
        sku: lineCalc.sku,
        productName: lineCalc.name,
        unitPrice: lineCalc.unitPrice,
        quantity: lineCalc.quantity,
        discountTotal: '0.00',
        taxTotal: '0.00',
        lineTotal: lineCalc.lineTotal,
        productSnapshot,
        categoryId: cartItem.product.categoryId,
        brandId: cartItem.product.brandId,
      };
    });

    const rawSubtotal = calculatedItems.reduce((sum, i) => sum + Number(i.lineTotal), 0);

    // 1. Server-authoritative Coupon Validation
    let couponDiscount = 0;
    let validatedCoupon: any = null;
    if (input.couponCode) {
      const promoItems: PromotionLineItem[] = calculatedItems.map((i) => ({
        productId: i.productId,
        sku: i.sku,
        categoryId: i.categoryId,
        brandId: i.brandId,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      }));

      const couponRes = await PromotionService.validateCoupon(
        input.couponCode,
        promoItems,
        rawSubtotal,
        customerProfileId
      );

      couponDiscount = couponRes.discountAmount;
      validatedCoupon = couponRes;
    }

    // 2. Server-authoritative Loyalty Points Validation
    let loyaltyDiscount = 0;
    const pointsToRedeem = input.loyaltyPointsToRedeem || 0;
    if (pointsToRedeem > 0) {
      if (!customerProfileId) {
        throw new BadRequestException('Authentication and customer profile required to redeem loyalty points');
      }

      const remainingSubtotal = Math.max(0, rawSubtotal - couponDiscount);
      const loyaltyRes = await LoyaltyService.validateRedemption(
        customerProfileId,
        pointsToRedeem,
        remainingSubtotal
      );

      loyaltyDiscount = loyaltyRes.discountAmount;
    }

    const totalServerDiscount = couponDiscount + loyaltyDiscount;

    // Server-side calculation of order totals
    const totals = PricingService.calculateTotals(
      calculatedItems.map((i) => ({ lineTotal: i.lineTotal, quantity: i.quantity })),
      userTier,
      0, // shipping fee handled by calculateTotals
      totalServerDiscount
    );

    // Format shipping address into customer notes
    const formattedAddressNotes = [
      `ผู้รับ: ${shippingAddress.recipientName} (โทร: ${shippingAddress.phone})`,
      `ที่อยู่: ${shippingAddress.addressLine}`,
      shippingAddress.subdistrict ? `แขวง/ตำบล: ${shippingAddress.subdistrict}` : '',
      shippingAddress.district ? `เขต/อำเภอ: ${shippingAddress.district}` : '',
      `จังหวัด: ${shippingAddress.province} ${shippingAddress.postalCode}`,
      customerNotes ? `หมายเหตุเพิ่มเติม: ${customerNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const orderNumber = this.generateOrderNumber();

    // Create order, redeem coupon, and deduct loyalty points in one single atomic transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await OrderRepository.createOrder(
        {
          orderNumber,
          customerId: customerProfileId,
          userId: userId || null,
          currency: 'THB',
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          shippingTotal: totals.shippingTotal,
          taxTotal: totals.taxTotal,
          grandTotal: totals.grandTotal,
          promotionId: validatedCoupon?.promotion?.id || null,
          couponCode: validatedCoupon?.coupon?.code || null,
          loyaltyPointsRedeemed: pointsToRedeem,
          loyaltyPointsEarned: 0,
          promotionSnapshot: validatedCoupon
            ? {
                couponCode: validatedCoupon.coupon.code,
                couponId: validatedCoupon.coupon.id,
                promotionId: validatedCoupon.promotion.id,
                promotionName: validatedCoupon.promotion.name,
                discountAmount: couponDiscount,
              }
            : null,
          customerNotes: formattedAddressNotes,
          paymentMethod: paymentMethod || 'PROMPTPAY',
          items: calculatedItems,
        },
        tx
      );

      // Record Coupon Redemption if coupon was applied
      if (validatedCoupon) {
        await PromotionService.redeemCouponTx(
          validatedCoupon.coupon.id,
          createdOrder.id,
          customerProfileId,
          couponDiscount,
          tx
        );
      }

      // Record Loyalty Points Redemption if points were applied
      if (pointsToRedeem > 0 && customerProfileId) {
        await LoyaltyService.redeemPointsForOrderTx(
          customerProfileId,
          createdOrder.id,
          pointsToRedeem,
          createdOrder.orderNumber,
          tx
        );
      }

      return createdOrder;
    });

    // Clear customer cart after successful order creation
    await CartRepository.clearCart(cart.id);

    // Record Customer Activity events
    CustomerActivityService.onOrderEvent(
      CustomerActivityType.ORDER_CREATED,
      order.id,
      order.orderNumber,
      customerProfileId,
      userId,
      order.grandTotal ? order.grandTotal.toString() : '0.00'
    ).catch(() => {});

    if (validatedCoupon) {
      CustomerActivityService.onPromotionEvent(
        CustomerActivityType.COUPON_REDEEMED,
        `Coupon ${validatedCoupon.coupon.code} redeemed for ฿${couponDiscount.toFixed(2)} off`,
        customerProfileId,
        userId,
        { couponCode: validatedCoupon.coupon.code, discountAmount: couponDiscount }
      ).catch(() => {});
    }

    if (pointsToRedeem > 0) {
      CustomerActivityService.onPromotionEvent(
        CustomerActivityType.LOYALTY_REDEEMED,
        `${pointsToRedeem} points redeemed for ฿${loyaltyDiscount.toFixed(2)} off`,
        customerProfileId,
        userId,
        { pointsRedeemed: pointsToRedeem, discountAmount: loyaltyDiscount }
      ).catch(() => {});
    }

    // Re-evaluate customer segments asynchronously
    if (customerProfileId) {
      CustomerSegmentService.reevaluateCustomerSegments(customerProfileId).catch(() => {});
    }

    // Audit logging
    if (userId) {
      await AuditRepository.record({
        userId,
        action: 'ORDER_CHECKOUT',
        resource: 'Order',
        resourceId: order.id,
        after: {
          orderNumber: order.orderNumber,
          grandTotal: order.grandTotal,
          itemsCount: order.items.length,
          discountTotal: totals.discountTotal,
        },
      });
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Retrieves order by ID with IDOR protection.
   */
  static async getOrderById(orderId: string, userId?: string, userRoles: string[] = []) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (isStaff) {
      return this.formatOrderResponse(order);
    }

    if (userId) {
      const user = await UserRepository.findById(userId);
      if (user?.customerProfile && order.customerId === user.customerProfile.id) {
        return this.formatOrderResponse(order);
      }
      if (order.customerId && user?.customerProfile && order.customerId !== user.customerProfile.id) {
        throw new ForbiddenException('You do not have permission to view or manage this order');
      }
    }

    return this.formatPublicOrderConfirmation(order);
  }

  /**
   * Retrieves order by human-readable order number with IDOR protection.
   */
  static async getOrderByNumber(orderNumber: string, userId?: string, userRoles: string[] = []) {
    const order = await OrderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (isStaff) {
      return this.formatOrderResponse(order);
    }

    if (userId) {
      const user = await UserRepository.findById(userId);
      if (user?.customerProfile && order.customerId === user.customerProfile.id) {
        return this.formatOrderResponse(order);
      }
      if (order.customerId && user?.customerProfile && order.customerId !== user.customerProfile.id) {
        throw new ForbiddenException('You do not have permission to view or manage this order');
      }
    }

    return this.formatPublicOrderConfirmation(order);
  }

  /**
   * Retrieves customer orders with optional filters and pagination.
   */
  static async getCustomerOrders(userId: string, query: CustomerOrderQueryParams = {}) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.customerProfile) {
      return {
        orders: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    const result = await OrderRepository.findByCustomerId(user.customerProfile.id, query);
    return {
      orders: result.orders.map((o) => this.formatOrderResponse(o)),
      pagination: result.pagination,
    };
  }

  /**
   * Synthesizes authoritative chronological order timeline from OrderStatusHistory,
   * PaymentEvents, and ShippingEvents.
   */
  static async getOrderTimeline(orderId: string, userId?: string, userRoles: string[] = []) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );

    if (userId && !isStaff) {
      const user = await UserRepository.findById(userId);
      if (user?.customerProfile && order.customerId && order.customerId !== user.customerProfile.id) {
        throw new ForbiddenException('You do not have permission to view or manage this order');
      }
    }

    const timeline: {
      type: 'ORDER' | 'PAYMENT' | 'SHIPPING';
      title: string;
      description?: string;
      status: string;
      occurredAt: Date;
    }[] = [];

    // 1. Order Status History
    for (const h of order.statusHistory || []) {
      timeline.push({
        type: 'ORDER',
        title: `สถานะคำสั่งซื้อ: ${h.toStatus}`,
        description: isStaff || userId ? h.note || undefined : undefined,
        status: h.toStatus,
        occurredAt: h.createdAt,
      });
    }

    // 2. Payment Events
    for (const p of order.payments || []) {
      for (const e of p.events || []) {
        timeline.push({
          type: 'PAYMENT',
          title: `การชำระเงิน (${p.provider}): ${e.eventType || e.toStatus}`,
          description: isStaff ? e.reason || undefined : undefined,
          status: e.toStatus,
          occurredAt: e.createdAt,
        });
      }
    }

    // 3. Shipping Events
    for (const s of order.shipments || []) {
      for (const e of s.events || []) {
        timeline.push({
          type: 'SHIPPING',
          title: `การจัดส่ง (${s.carrier}): ${e.description || e.status}`,
          description: e.location ? `สถานที่: ${e.location}` : undefined,
          status: e.status,
          occurredAt: e.occurredAt || e.receivedAt || new Date(),
        });
      }
    }

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    return timeline;
  }

  /**
   * Customer cancels an order within allowed policies.
   */
  static async cancelOrderByCustomer(orderId: string, reason: string, userId: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.verifyOrderOwnership(order, userId, []);

    const updatedOrder = await OrderRepository.cancelOrder({
      orderId: order.id,
      reason: `Customer cancellation: ${reason}`,
      actorId: userId,
      isCustomerAction: true,
    });

    await AuditRepository.record({
      userId,
      action: 'ORDER_CANCELLED_BY_CUSTOMER',
      resource: 'Order',
      resourceId: order.id,
      before: { status: order.status },
      after: { status: OrderStatus.CANCELLED, reason },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Staff cancels an order with reason and audit.
   */
  static async cancelOrderByStaff(orderId: string, reason: string, staffUserId: string, userRoles: string[] = []) {
    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP'].includes(r)
    );
    if (!isStaff) {
      throw new ForbiddenException('Staff privileges (STORE_MANAGER, SALES_REP, SUPER_ADMIN) required to cancel orders');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await OrderRepository.cancelOrder({
      orderId: order.id,
      reason: `Staff cancellation: ${reason}`,
      actorId: staffUserId,
      isCustomerAction: false,
    });

    await AuditRepository.record({
      userId: staffUserId,
      action: 'ORDER_CANCELLED_BY_STAFF',
      resource: 'Order',
      resourceId: order.id,
      before: { status: order.status },
      after: { status: OrderStatus.CANCELLED, reason },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Customer requests a return for a delivered order.
   */
  static async requestReturn(orderId: string, reason: string, userId: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.verifyOrderOwnership(order, userId, []);

    const updatedOrder = await OrderRepository.requestReturn({
      orderId: order.id,
      reason,
      actorId: userId,
    });

    await AuditRepository.record({
      userId,
      action: 'ORDER_RETURN_REQUESTED',
      resource: 'Order',
      resourceId: order.id,
      before: { status: order.status },
      after: { status: OrderStatus.RETURN_REQUESTED, reason },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Staff approves or rejects a return request.
   */
  static async handleReturnActionByStaff(
    orderId: string,
    action: 'APPROVE' | 'REJECT',
    note: string | undefined,
    staffUserId: string,
    userRoles: string[] = []
  ) {
    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (!isStaff) {
      throw new ForbiddenException('Staff privileges (STORE_MANAGER, INVENTORY_CLERK, SUPER_ADMIN) required to handle return actions');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await OrderRepository.handleReturnAction({
      orderId: order.id,
      action,
      note,
      actorId: staffUserId,
    });

    await AuditRepository.record({
      userId: staffUserId,
      action: action === 'APPROVE' ? 'ORDER_RETURN_APPROVED' : 'ORDER_RETURN_REJECTED',
      resource: 'Order',
      resourceId: order.id,
      before: { status: order.status },
      after: { status: updatedOrder?.status, note },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Staff updates order status explicitly through state machine rules.
   */
  static async updateOrderStatusByStaff(
    orderId: string,
    toStatus: OrderStatus,
    note: string | undefined,
    staffUserId: string,
    userRoles: string[] = []
  ) {
    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (!isStaff) {
      throw new ForbiddenException('Staff privileges (STORE_MANAGER, INVENTORY_CLERK, SUPER_ADMIN) required to update order status');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // State machine check
    OrderStateMachine.validateTransition(order.status, toStatus);

    const updatedOrder = await OrderRepository.updateOrderStatus({
      orderId: order.id,
      toStatus,
      note,
      actorId: staffUserId,
    });

    if (!updatedOrder) {
      throw new NotFoundException('Failed to update order status');
    }

    // 1. If transitioning to PAYMENT_CONFIRMED: award loyalty points & log activity
    if (toStatus === OrderStatus.PAYMENT_CONFIRMED && updatedOrder.customerId) {
      await LoyaltyService.awardPointsForOrder(
        updatedOrder.customerId,
        updatedOrder.id,
        Number(updatedOrder.grandTotal),
        updatedOrder.orderNumber
      ).catch(() => {});

      CustomerActivityService.onOrderEvent(
        CustomerActivityType.ORDER_PAID,
        updatedOrder.id,
        updatedOrder.orderNumber,
        updatedOrder.customerId,
        staffUserId,
        updatedOrder.grandTotal.toString()
      ).catch(() => {});

      CustomerSegmentService.reevaluateCustomerSegments(updatedOrder.customerId).catch(() => {});
    }

    // 2. If transitioning to CANCELLED or REFUNDED: reverse/restore loyalty points & re-evaluate
    if (
      (toStatus === OrderStatus.CANCELLED || toStatus === OrderStatus.REFUNDED) &&
      updatedOrder.customerId
    ) {
      await LoyaltyService.handleOrderRefund(
        updatedOrder.customerId,
        updatedOrder.id,
        updatedOrder.orderNumber,
        updatedOrder.loyaltyPointsRedeemed || 0,
        updatedOrder.loyaltyPointsEarned || 0
      ).catch(() => {});

      CustomerSegmentService.reevaluateCustomerSegments(updatedOrder.customerId).catch(() => {});
    }

    // 3. If transitioning to SHIPPED or DELIVERED: log activity
    if (toStatus === OrderStatus.SHIPPED && updatedOrder.customerId) {
      CustomerActivityService.onOrderEvent(
        CustomerActivityType.ORDER_SHIPPED,
        updatedOrder.id,
        updatedOrder.orderNumber,
        updatedOrder.customerId,
        staffUserId,
        updatedOrder.grandTotal.toString()
      ).catch(() => {});
    } else if (toStatus === OrderStatus.DELIVERED && updatedOrder.customerId) {
      CustomerActivityService.onOrderEvent(
        CustomerActivityType.ORDER_DELIVERED,
        updatedOrder.id,
        updatedOrder.orderNumber,
        updatedOrder.customerId,
        staffUserId,
        updatedOrder.grandTotal.toString()
      ).catch(() => {});
    }

    await AuditRepository.record({
      userId: staffUserId,
      action: 'ORDER_STATUS_UPDATED',
      resource: 'Order',
      resourceId: order.id,
      before: { status: order.status },
      after: { status: toStatus, note },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Staff query with full search, status filters, date ranges, and pagination.
   */
  static async getAdminOrders(query: AdminOrderQueryParams, userRoles: string[] = []) {
    const isStaff = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r)
    );
    if (!isStaff) {
      throw new ForbiddenException('Staff privileges required to access admin orders');
    }

    const result = await OrderRepository.findAdminOrders(query);
    return {
      orders: result.orders.map((o) => this.formatOrderResponse(o)),
      pagination: result.pagination,
    };
  }
}
