"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const order_repository_1 = require("../repositories/order.repository");
const cart_repository_1 = require("../repositories/cart.repository");
const user_repository_1 = require("../repositories/user.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const pricing_service_1 = require("./pricing.service");
const promotion_service_1 = require("./promotion.service");
const loyalty_service_1 = require("./loyalty.service");
const customer_activity_service_1 = require("./customer-activity.service");
const customer_segment_service_1 = require("./customer-segment.service");
const order_state_machine_1 = require("./order/order-state-machine");
const app_error_1 = require("../errors/app-error");
const client_1 = require("@prisma/client");
const database_1 = require("@car-parts/database");
class OrderService {
    /**
     * Generates a unique, standardized order number with date prefix.
     */
    static generateOrderNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const randomHex = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
        return `ORD-${year}${month}${day}-${randomHex}`;
    }
    /**
     * Formats order output for API responses.
     */
    static formatOrderResponse(order) {
        if (!order)
            return null;
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
            shippingAddress: order.shipments?.[0]?.addressSnapshot ||
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
            items: (order.items || []).map((item) => ({
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
            statusHistory: (order.statusHistory || []).map((h) => ({
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
            payments: (order.payments || []).map((p) => ({
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
                events: (p.events || []).map((e) => ({
                    id: e.id,
                    eventType: e.eventType,
                    fromStatus: e.fromStatus,
                    toStatus: e.toStatus,
                    reason: e.reason,
                    createdAt: e.createdAt,
                })),
                slips: (p.slips || []).map((s) => ({
                    id: s.id,
                    slipUrl: s.slipUrl,
                    bankName: s.bankName,
                    status: s.status,
                    createdAt: s.createdAt,
                })),
                refunds: (p.refunds || []).map((r) => ({
                    id: r.id,
                    refundReference: r.refundReference,
                    amount: Number(r.amount).toFixed(2),
                    status: r.status,
                    reason: r.reason,
                    createdAt: r.createdAt,
                })),
            })),
            shipments: (order.shipments || []).map((s) => ({
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
                events: (s.events || []).map((e) => ({
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
    static maskString(str) {
        if (!str)
            return '';
        const trimmed = str.trim();
        if (trimmed.length <= 2)
            return trimmed.charAt(0) + '*';
        return trimmed.charAt(0) + '***' + trimmed.charAt(trimmed.length - 1);
    }
    /**
     * Masks email address (e.g. somchai@autoworkshop.com -> s***@***.com).
     */
    static maskEmail(email) {
        if (!email || !email.includes('@'))
            return '***@***.com';
        const [local, domain] = email.split('@');
        const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
        const domainParts = domain.split('.');
        const tld = domainParts.length > 1 ? domainParts.pop() : 'com';
        return `${maskedLocal}@***.${tld}`;
    }
    /**
     * Masks phone number (e.g. 0812345678 -> 081-***-5678).
     */
    static maskPhone(phone) {
        if (!phone)
            return '***';
        const clean = phone.replace(/\D/g, '');
        if (clean.length >= 9) {
            return `${clean.slice(0, 3)}-***-${clean.slice(-4)}`;
        }
        return '***-' + clean.slice(-2);
    }
    /**
     * Formats public/guest confirmation view with strict PII masking and zero internal audit leakage.
     */
    static formatPublicOrderConfirmation(order) {
        if (!order)
            return null;
        const rawShipping = order.shipments?.[0]?.addressSnapshot ||
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
                            displayName: this.maskString(order.customer.user.displayName ||
                                `${order.customer.user.firstName || ''} ${order.customer.user.lastName || ''}`.trim()),
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
            items: (order.items || []).map((item) => ({
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
            statusHistory: (order.statusHistory || []).map((h) => ({
                fromStatus: h.fromStatus,
                toStatus: h.toStatus,
                createdAt: h.createdAt,
            })),
            payments: (order.payments || []).map((p) => ({
                id: p.id,
                method: p.method,
                status: p.status,
                amount: Number(p.amount).toFixed(2),
                currency: p.currency,
                paidAt: p.paidAt,
                createdAt: p.createdAt,
            })),
            shipments: (order.shipments || []).map((s) => ({
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
    static async verifyOrderOwnership(order, userId, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (isStaff)
            return;
        if (!userId) {
            return; // Guest / unauthenticated order lookup
        }
        const user = await user_repository_1.UserRepository.findById(userId);
        if (user?.customerProfile && order.customerId === user.customerProfile.id) {
            return; // Valid owner
        }
        if (!order.customerId) {
            return; // Guest order accessible
        }
        throw new app_error_1.ForbiddenException('You do not have permission to view or manage this order');
    }
    /**
     * Executes atomic checkout from the active cart with server-authoritative pricing.
     */
    static async checkout(input) {
        const { userId, sessionToken, shippingAddress, customerNotes, paymentMethod } = input;
        if (!shippingAddress) {
            throw new app_error_1.BadRequestException('Shipping address is required');
        }
        if (!shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.province || !shippingAddress.postalCode) {
            throw new app_error_1.BadRequestException('Recipient name, phone, address line, province, and postal code are required');
        }
        // Find active cart
        const cart = await cart_repository_1.CartRepository.findActiveCart({ userId, sessionToken });
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new app_error_1.BadRequestException('Cart is empty. Please add items to cart before checking out.');
        }
        // Resolve user profile & price tier
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        let customerProfileId = null;
        if (userId) {
            const user = await user_repository_1.UserRepository.findById(userId);
            if (user?.customerProfile) {
                customerProfileId = user.customerProfile.id;
            }
        }
        // Validate each product in cart is active, published, and not deleted
        for (const cartItem of cart.items) {
            if (!cartItem.product || !cartItem.product.isActive || !cartItem.product.isPublished || cartItem.product.deletedAt) {
                throw new app_error_1.BadRequestException(`Product '${cartItem.product?.name || cartItem.productId}' is no longer available for purchase.`);
            }
        }
        // Server-side calculation of all line items
        const calculatedItems = cart.items.map((cartItem) => {
            const lineCalc = pricing_service_1.PricingService.calculateLineItem(cartItem.product, userTier, cartItem.quantity, cartItem.vehicleVariantId);
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
        let validatedCoupon = null;
        if (input.couponCode) {
            const promoItems = calculatedItems.map((i) => ({
                productId: i.productId,
                sku: i.sku,
                categoryId: i.categoryId,
                brandId: i.brandId,
                quantity: i.quantity,
                lineTotal: i.lineTotal,
            }));
            const couponRes = await promotion_service_1.PromotionService.validateCoupon(input.couponCode, promoItems, rawSubtotal, customerProfileId);
            couponDiscount = couponRes.discountAmount;
            validatedCoupon = couponRes;
        }
        // 2. Server-authoritative Loyalty Points Validation
        let loyaltyDiscount = 0;
        const pointsToRedeem = input.loyaltyPointsToRedeem || 0;
        if (pointsToRedeem > 0) {
            if (!customerProfileId) {
                throw new app_error_1.BadRequestException('Authentication and customer profile required to redeem loyalty points');
            }
            const remainingSubtotal = Math.max(0, rawSubtotal - couponDiscount);
            const loyaltyRes = await loyalty_service_1.LoyaltyService.validateRedemption(customerProfileId, pointsToRedeem, remainingSubtotal);
            loyaltyDiscount = loyaltyRes.discountAmount;
        }
        const totalServerDiscount = couponDiscount + loyaltyDiscount;
        // Server-side calculation of order totals
        const totals = pricing_service_1.PricingService.calculateTotals(calculatedItems.map((i) => ({ lineTotal: i.lineTotal, quantity: i.quantity })), userTier, 0, // shipping fee handled by calculateTotals
        totalServerDiscount);
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
        const order = await database_1.prisma.$transaction(async (tx) => {
            const createdOrder = await order_repository_1.OrderRepository.createOrder({
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
            }, tx);
            // Record Coupon Redemption if coupon was applied
            if (validatedCoupon) {
                await promotion_service_1.PromotionService.redeemCouponTx(validatedCoupon.coupon.id, createdOrder.id, customerProfileId, couponDiscount, tx);
            }
            // Record Loyalty Points Redemption if points were applied
            if (pointsToRedeem > 0 && customerProfileId) {
                await loyalty_service_1.LoyaltyService.redeemPointsForOrderTx(customerProfileId, createdOrder.id, pointsToRedeem, createdOrder.orderNumber, tx);
            }
            return createdOrder;
        });
        // Clear customer cart after successful order creation
        await cart_repository_1.CartRepository.clearCart(cart.id);
        // Record Customer Activity events
        customer_activity_service_1.CustomerActivityService.onOrderEvent(client_1.CustomerActivityType.ORDER_CREATED, order.id, order.orderNumber, customerProfileId, userId, order.grandTotal ? order.grandTotal.toString() : '0.00').catch(() => { });
        if (validatedCoupon) {
            customer_activity_service_1.CustomerActivityService.onPromotionEvent(client_1.CustomerActivityType.COUPON_REDEEMED, `Coupon ${validatedCoupon.coupon.code} redeemed for ฿${couponDiscount.toFixed(2)} off`, customerProfileId, userId, { couponCode: validatedCoupon.coupon.code, discountAmount: couponDiscount }).catch(() => { });
        }
        if (pointsToRedeem > 0) {
            customer_activity_service_1.CustomerActivityService.onPromotionEvent(client_1.CustomerActivityType.LOYALTY_REDEEMED, `${pointsToRedeem} points redeemed for ฿${loyaltyDiscount.toFixed(2)} off`, customerProfileId, userId, { pointsRedeemed: pointsToRedeem, discountAmount: loyaltyDiscount }).catch(() => { });
        }
        // Re-evaluate customer segments asynchronously
        if (customerProfileId) {
            customer_segment_service_1.CustomerSegmentService.reevaluateCustomerSegments(customerProfileId).catch(() => { });
        }
        // Audit logging
        if (userId) {
            await audit_repository_1.AuditRepository.record({
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
    static async getOrderById(orderId, userId, userRoles = []) {
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (isStaff) {
            return this.formatOrderResponse(order);
        }
        if (userId) {
            const user = await user_repository_1.UserRepository.findById(userId);
            if (user?.customerProfile && order.customerId === user.customerProfile.id) {
                return this.formatOrderResponse(order);
            }
            if (order.customerId && user?.customerProfile && order.customerId !== user.customerProfile.id) {
                throw new app_error_1.ForbiddenException('You do not have permission to view or manage this order');
            }
        }
        return this.formatPublicOrderConfirmation(order);
    }
    /**
     * Retrieves order by human-readable order number with IDOR protection.
     */
    static async getOrderByNumber(orderNumber, userId, userRoles = []) {
        const order = await order_repository_1.OrderRepository.findByOrderNumber(orderNumber);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (isStaff) {
            return this.formatOrderResponse(order);
        }
        if (userId) {
            const user = await user_repository_1.UserRepository.findById(userId);
            if (user?.customerProfile && order.customerId === user.customerProfile.id) {
                return this.formatOrderResponse(order);
            }
            if (order.customerId && user?.customerProfile && order.customerId !== user.customerProfile.id) {
                throw new app_error_1.ForbiddenException('You do not have permission to view or manage this order');
            }
        }
        return this.formatPublicOrderConfirmation(order);
    }
    /**
     * Retrieves customer orders with optional filters and pagination.
     */
    static async getCustomerOrders(userId, query = {}) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user || !user.customerProfile) {
            return {
                orders: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            };
        }
        const result = await order_repository_1.OrderRepository.findByCustomerId(user.customerProfile.id, query);
        return {
            orders: result.orders.map((o) => this.formatOrderResponse(o)),
            pagination: result.pagination,
        };
    }
    /**
     * Synthesizes authoritative chronological order timeline from OrderStatusHistory,
     * PaymentEvents, and ShippingEvents.
     */
    static async getOrderTimeline(orderId, userId, userRoles = []) {
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (userId && !isStaff) {
            const user = await user_repository_1.UserRepository.findById(userId);
            if (user?.customerProfile && order.customerId && order.customerId !== user.customerProfile.id) {
                throw new app_error_1.ForbiddenException('You do not have permission to view or manage this order');
            }
        }
        const timeline = [];
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
    static async cancelOrderByCustomer(orderId, reason, userId) {
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        await this.verifyOrderOwnership(order, userId, []);
        const updatedOrder = await order_repository_1.OrderRepository.cancelOrder({
            orderId: order.id,
            reason: `Customer cancellation: ${reason}`,
            actorId: userId,
            isCustomerAction: true,
        });
        await audit_repository_1.AuditRepository.record({
            userId,
            action: 'ORDER_CANCELLED_BY_CUSTOMER',
            resource: 'Order',
            resourceId: order.id,
            before: { status: order.status },
            after: { status: client_1.OrderStatus.CANCELLED, reason },
        });
        return this.formatOrderResponse(updatedOrder);
    }
    /**
     * Staff cancels an order with reason and audit.
     */
    static async cancelOrderByStaff(orderId, reason, staffUserId, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP'].includes(r));
        if (!isStaff) {
            throw new app_error_1.ForbiddenException('Staff privileges (STORE_MANAGER, SALES_REP, SUPER_ADMIN) required to cancel orders');
        }
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        const updatedOrder = await order_repository_1.OrderRepository.cancelOrder({
            orderId: order.id,
            reason: `Staff cancellation: ${reason}`,
            actorId: staffUserId,
            isCustomerAction: false,
        });
        await audit_repository_1.AuditRepository.record({
            userId: staffUserId,
            action: 'ORDER_CANCELLED_BY_STAFF',
            resource: 'Order',
            resourceId: order.id,
            before: { status: order.status },
            after: { status: client_1.OrderStatus.CANCELLED, reason },
        });
        return this.formatOrderResponse(updatedOrder);
    }
    /**
     * Customer requests a return for a delivered order.
     */
    static async requestReturn(orderId, reason, userId) {
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        await this.verifyOrderOwnership(order, userId, []);
        const updatedOrder = await order_repository_1.OrderRepository.requestReturn({
            orderId: order.id,
            reason,
            actorId: userId,
        });
        await audit_repository_1.AuditRepository.record({
            userId,
            action: 'ORDER_RETURN_REQUESTED',
            resource: 'Order',
            resourceId: order.id,
            before: { status: order.status },
            after: { status: client_1.OrderStatus.RETURN_REQUESTED, reason },
        });
        return this.formatOrderResponse(updatedOrder);
    }
    /**
     * Staff approves or rejects a return request.
     */
    static async handleReturnActionByStaff(orderId, action, note, staffUserId, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (!isStaff) {
            throw new app_error_1.ForbiddenException('Staff privileges (STORE_MANAGER, INVENTORY_CLERK, SUPER_ADMIN) required to handle return actions');
        }
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        const updatedOrder = await order_repository_1.OrderRepository.handleReturnAction({
            orderId: order.id,
            action,
            note,
            actorId: staffUserId,
        });
        await audit_repository_1.AuditRepository.record({
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
    static async updateOrderStatusByStaff(orderId, toStatus, note, staffUserId, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (!isStaff) {
            throw new app_error_1.ForbiddenException('Staff privileges (STORE_MANAGER, INVENTORY_CLERK, SUPER_ADMIN) required to update order status');
        }
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        // State machine check
        order_state_machine_1.OrderStateMachine.validateTransition(order.status, toStatus);
        const updatedOrder = await order_repository_1.OrderRepository.updateOrderStatus({
            orderId: order.id,
            toStatus,
            note,
            actorId: staffUserId,
        });
        if (!updatedOrder) {
            throw new app_error_1.NotFoundException('Failed to update order status');
        }
        // 1. If transitioning to PAYMENT_CONFIRMED: award loyalty points & log activity
        if (toStatus === client_1.OrderStatus.PAYMENT_CONFIRMED && updatedOrder.customerId) {
            await loyalty_service_1.LoyaltyService.awardPointsForOrder(updatedOrder.customerId, updatedOrder.id, Number(updatedOrder.grandTotal), updatedOrder.orderNumber).catch(() => { });
            customer_activity_service_1.CustomerActivityService.onOrderEvent(client_1.CustomerActivityType.ORDER_PAID, updatedOrder.id, updatedOrder.orderNumber, updatedOrder.customerId, staffUserId, updatedOrder.grandTotal.toString()).catch(() => { });
            customer_segment_service_1.CustomerSegmentService.reevaluateCustomerSegments(updatedOrder.customerId).catch(() => { });
        }
        // 2. If transitioning to CANCELLED or REFUNDED: reverse/restore loyalty points & re-evaluate
        if ((toStatus === client_1.OrderStatus.CANCELLED || toStatus === client_1.OrderStatus.REFUNDED) &&
            updatedOrder.customerId) {
            await loyalty_service_1.LoyaltyService.handleOrderRefund(updatedOrder.customerId, updatedOrder.id, updatedOrder.orderNumber, updatedOrder.loyaltyPointsRedeemed || 0, updatedOrder.loyaltyPointsEarned || 0).catch(() => { });
            customer_segment_service_1.CustomerSegmentService.reevaluateCustomerSegments(updatedOrder.customerId).catch(() => { });
        }
        // 3. If transitioning to SHIPPED or DELIVERED: log activity
        if (toStatus === client_1.OrderStatus.SHIPPED && updatedOrder.customerId) {
            customer_activity_service_1.CustomerActivityService.onOrderEvent(client_1.CustomerActivityType.ORDER_SHIPPED, updatedOrder.id, updatedOrder.orderNumber, updatedOrder.customerId, staffUserId, updatedOrder.grandTotal.toString()).catch(() => { });
        }
        else if (toStatus === client_1.OrderStatus.DELIVERED && updatedOrder.customerId) {
            customer_activity_service_1.CustomerActivityService.onOrderEvent(client_1.CustomerActivityType.ORDER_DELIVERED, updatedOrder.id, updatedOrder.orderNumber, updatedOrder.customerId, staffUserId, updatedOrder.grandTotal.toString()).catch(() => { });
        }
        await audit_repository_1.AuditRepository.record({
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
    static async getAdminOrders(query, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (!isStaff) {
            throw new app_error_1.ForbiddenException('Staff privileges required to access admin orders');
        }
        const result = await order_repository_1.OrderRepository.findAdminOrders(query);
        return {
            orders: result.orders.map((o) => this.formatOrderResponse(o)),
            pagination: result.pagination,
        };
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map