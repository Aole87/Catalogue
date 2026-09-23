"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const shipping_repository_1 = require("../repositories/shipping.repository");
const order_repository_1 = require("../repositories/order.repository");
const user_repository_1 = require("../repositories/user.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const provider_factory_1 = require("./shipping/providers/provider.factory");
const shipment_state_machine_1 = require("./shipping/shipment-state-machine");
const app_error_1 = require("../errors/app-error");
const client_1 = require("@prisma/client");
class ShippingService {
    /**
     * Generates a unique, non-guessable internal shipment number.
     */
    static generateShipmentNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const randomHex = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
        return `SHP-${year}${month}${day}-${randomHex}`;
    }
    /**
     * Formats shipment data for internal & staff API responses.
     */
    static formatShipmentResponse(shipment) {
        if (!shipment)
            return null;
        return {
            id: shipment.id,
            shipmentNumber: shipment.shipmentNumber,
            orderId: shipment.orderId,
            shippingMethodId: shipment.shippingMethodId,
            carrier: shipment.carrier,
            serviceLevel: shipment.serviceLevel,
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            shippingCost: Number(shipment.shippingCost || 0).toFixed(2),
            currency: shipment.currency || 'THB',
            recipientName: shipment.recipientName,
            phone: shipment.phone,
            addressLine1: shipment.addressLine1,
            addressLine2: shipment.addressLine2,
            subdistrict: shipment.subdistrict,
            district: shipment.district,
            province: shipment.province,
            postalCode: shipment.postalCode,
            country: shipment.country,
            addressSnapshot: shipment.addressSnapshot,
            estimatedDelivery: shipment.estimatedDelivery,
            shippedAt: shipment.shippedAt,
            deliveredAt: shipment.deliveredAt,
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt,
            order: shipment.order
                ? {
                    id: shipment.order.id,
                    orderNumber: shipment.order.orderNumber,
                    status: shipment.order.status,
                    grandTotal: Number(shipment.order.grandTotal).toFixed(2),
                    currency: shipment.order.currency,
                }
                : undefined,
            shippingMethod: shipment.shippingMethod
                ? {
                    id: shipment.shippingMethod.id,
                    name: shipment.shippingMethod.name,
                    code: shipment.shippingMethod.code,
                    carrier: shipment.shippingMethod.carrier,
                    basePrice: Number(shipment.shippingMethod.basePrice).toFixed(2),
                    estimatedMinDays: shipment.shippingMethod.estimatedMinDays,
                    estimatedMaxDays: shipment.shippingMethod.estimatedMaxDays,
                }
                : undefined,
            events: (shipment.events || []).map((e) => ({
                id: e.id,
                status: e.status,
                description: e.description,
                location: e.location,
                providerEventId: e.providerEventId,
                occurredAt: e.occurredAt,
                actorId: e.actorId,
                createdAt: e.createdAt,
            })),
        };
    }
    /**
     * Formats customer-facing tracking response with masked sensitive recipient data.
     */
    static formatTrackingResponse(shipment) {
        if (!shipment)
            return null;
        // Mask recipient name: e.g. "Somchai Suksom" -> "Somchai S."
        let maskedName = shipment.recipientName || '';
        const parts = maskedName.trim().split(/\s+/);
        if (parts.length > 1) {
            maskedName = `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
        }
        // Mask phone: e.g. "0812345678" -> "081-XXX-5678"
        let maskedPhone = shipment.phone || '';
        if (maskedPhone.length >= 9) {
            maskedPhone = `${maskedPhone.slice(0, 3)}-XXX-${maskedPhone.slice(-4)}`;
        }
        return {
            shipmentNumber: shipment.shipmentNumber,
            trackingNumber: shipment.trackingNumber,
            carrier: shipment.carrier,
            serviceLevel: shipment.serviceLevel,
            status: shipment.status,
            recipientSummary: {
                name: maskedName,
                phone: maskedPhone,
                province: shipment.province,
                postalCode: shipment.postalCode,
            },
            estimatedDelivery: shipment.estimatedDelivery,
            shippedAt: shipment.shippedAt,
            deliveredAt: shipment.deliveredAt,
            events: (shipment.events || []).map((e) => ({
                status: e.status,
                description: e.description,
                location: e.location,
                occurredAt: e.occurredAt,
            })),
        };
    }
    /**
     * Authorizes that a user owns the order linked to a shipment, or has staff/admin privileges.
     */
    static async verifyOrderOwnership(order, userId, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'].includes(r));
        if (isStaff)
            return;
        if (!order.customerId && !userId) {
            return; // Guest checkout access allowed via session token
        }
        if (userId) {
            const user = await user_repository_1.UserRepository.findById(userId);
            if (user?.customerProfile && order.customerId === user.customerProfile.id) {
                return; // Valid owner
            }
        }
        throw new app_error_1.ForbiddenException('You do not have permission to view or manage this shipment');
    }
    /**
     * Lists available shipping methods.
     */
    static async getShippingMethods(isActive = true) {
        const methods = await shipping_repository_1.ShippingRepository.listShippingMethods(isActive);
        return methods.map((m) => ({
            id: m.id,
            name: m.name,
            code: m.code,
            carrier: m.carrier,
            description: m.description,
            basePrice: Number(m.basePrice).toFixed(2),
            estimatedMinDays: m.estimatedMinDays,
            estimatedMaxDays: m.estimatedMaxDays,
            isActive: m.isActive,
        }));
    }
    /**
     * Creates a shipment for an order.
     * STRICT PAYMENT BOUNDARY: Only PAYMENT_CONFIRMED or authorized COD orders can be fulfilled.
     */
    static async createShipment(input) {
        const { orderId, actorId, userRoles = [] } = input;
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        // Payment boundary check
        const allowedStatuses = [
            client_1.OrderStatus.PAYMENT_CONFIRMED,
            client_1.OrderStatus.PROCESSING,
            client_1.OrderStatus.READY_FOR_SHIPMENT,
            client_1.OrderStatus.SHIPPED,
            client_1.OrderStatus.DELIVERED,
        ];
        if (!allowedStatuses.includes(order.status)) {
            throw new app_error_1.BadRequestException(`Cannot fulfill unpaid order in status '${order.status}'. Payment must be confirmed first.`);
        }
        // IDOR / Staff check
        await this.verifyOrderOwnership(order, actorId, userRoles);
        // Resolve Shipping Method
        let shippingMethod = null;
        if (input.shippingMethodId) {
            shippingMethod = await shipping_repository_1.ShippingRepository.findShippingMethodById(input.shippingMethodId);
        }
        const carrier = input.carrier || shippingMethod?.carrier || shippingMethod?.name || 'Standard Delivery';
        const serviceLevel = input.serviceLevel || 'STANDARD';
        const shippingCost = input.shippingCost || (shippingMethod ? String(shippingMethod.basePrice) : '0.00');
        // Resolve Recipient Address with fallback to order customer addresses or customer profile
        let recipientName = input.recipientName;
        let phone = input.phone;
        let addressLine1 = input.addressLine1;
        let addressLine2 = input.addressLine2 || null;
        let subdistrict = input.subdistrict || null;
        let district = input.district || null;
        let province = input.province;
        let postalCode = input.postalCode;
        let country = input.country || 'TH';
        if (!recipientName || !phone || !addressLine1 || !province || !postalCode) {
            // Extract from customer addresses if available
            const customerAddresses = order.customer?.addresses || [];
            const defaultAddress = customerAddresses.find((a) => a.isDefault) || customerAddresses[0];
            if (defaultAddress) {
                recipientName = recipientName || defaultAddress.recipientName;
                phone = phone || defaultAddress.phone;
                addressLine1 = addressLine1 || defaultAddress.addressLine1;
                addressLine2 = addressLine2 || defaultAddress.addressLine2;
                subdistrict = subdistrict || defaultAddress.subdistrict;
                district = district || defaultAddress.district;
                province = province || defaultAddress.province;
                postalCode = postalCode || defaultAddress.postalCode;
                country = country || defaultAddress.country || 'TH';
            }
            else {
                // Fallback to customer notes / user profile
                const userDisplayName = order.customer?.user?.displayName ||
                    `${order.customer?.user?.firstName || ''} ${order.customer?.user?.lastName || ''}`.trim();
                recipientName = recipientName || userDisplayName || 'Customer';
                phone = phone || order.customer?.phone || order.customer?.user?.phone || '0000000000';
                addressLine1 = addressLine1 || 'Customer Delivery Address';
                province = province || 'Bangkok';
                postalCode = postalCode || '10110';
            }
        }
        const finalRecipientName = recipientName || 'Customer';
        const finalPhone = phone || '0000000000';
        const finalAddressLine1 = addressLine1 || 'Customer Delivery Address';
        const finalProvince = province || 'Bangkok';
        const finalPostalCode = postalCode || '10110';
        // Immutable address snapshot
        const addressSnapshot = {
            recipientName: finalRecipientName,
            phone: finalPhone,
            addressLine1: finalAddressLine1,
            addressLine2,
            subdistrict,
            district,
            province: finalProvince,
            postalCode: finalPostalCode,
            country,
            snapshotAt: new Date().toISOString(),
        };
        const shipmentNumber = this.generateShipmentNumber();
        const shipment = await shipping_repository_1.ShippingRepository.createShipment({
            shipmentNumber,
            orderId: order.id,
            shippingMethodId: shippingMethod?.id || null,
            carrier,
            serviceLevel,
            shippingCost,
            currency: 'THB',
            recipientName: finalRecipientName,
            phone: finalPhone,
            addressLine1: finalAddressLine1,
            addressLine2,
            subdistrict,
            district,
            province: finalProvince,
            postalCode: finalPostalCode,
            country,
            addressSnapshot,
            actorId,
        });
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SHIPMENT_CREATED',
                resource: 'Shipment',
                resourceId: shipment.id,
                after: {
                    shipmentNumber: shipment.shipmentNumber,
                    orderId: order.id,
                    carrier,
                    recipientName,
                },
            });
        }
        return this.formatShipmentResponse(shipment);
    }
    /**
     * Updates shipment status following strict state machine rules.
     */
    static async updateShipmentStatus(input) {
        const { shipmentId, toStatus, description, location, providerEventId, actorId, occurredAt, metadata } = input;
        const shipment = await shipping_repository_1.ShippingRepository.findById(shipmentId);
        if (!shipment) {
            throw new app_error_1.NotFoundException('Shipment not found');
        }
        // Validate transition
        shipment_state_machine_1.ShipmentStateMachine.validateTransition(shipment.status, toStatus);
        const updatedShipment = await shipping_repository_1.ShippingRepository.updateShipmentStatus({
            shipmentId,
            toStatus,
            description,
            location,
            providerEventId,
            actorId,
            occurredAt,
            metadata,
        });
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SHIPMENT_STATUS_UPDATED',
                resource: 'Shipment',
                resourceId: shipmentId,
                before: { status: shipment.status },
                after: { status: toStatus, description, location },
            });
        }
        return this.formatShipmentResponse(updatedShipment);
    }
    /**
     * Assigns tracking number to a shipment.
     */
    static async assignTracking(input) {
        const { shipmentId, trackingNumber, carrier, serviceLevel, actorId } = input;
        const shipment = await shipping_repository_1.ShippingRepository.findById(shipmentId);
        if (!shipment) {
            throw new app_error_1.NotFoundException('Shipment not found');
        }
        if (shipment.status === client_1.ShipmentStatus.DELIVERED || shipment.status === client_1.ShipmentStatus.CANCELLED) {
            throw new app_error_1.BadRequestException(`Cannot assign tracking to a shipment in status '${shipment.status}'`);
        }
        const updatedShipment = await shipping_repository_1.ShippingRepository.assignTracking({
            shipmentId,
            trackingNumber,
            carrier,
            serviceLevel,
            actorId,
        });
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SHIPMENT_TRACKING_ASSIGNED',
                resource: 'Shipment',
                resourceId: shipmentId,
                after: { trackingNumber, carrier: carrier || shipment.carrier },
            });
        }
        return this.formatShipmentResponse(updatedShipment);
    }
    /**
     * Inbound carrier tracking webhook ingestion with signature verification,
     * deduplication, out-of-order stale event protection, and shipment status update.
     */
    static async handleTrackingWebhook(providerName, rawBody, headers) {
        const provider = provider_factory_1.ShippingProviderFactory.getProvider(providerName);
        // Verify and parse webhook via provider adapter
        const webhookResult = await provider.handleWebhook({ rawBody, headers });
        if (!webhookResult.isValid) {
            throw new app_error_1.BadRequestException(webhookResult.failureReason || `Invalid webhook signature for shipping provider '${providerName}'`);
        }
        // Idempotent webhook event deduplication
        const { isDuplicate, webhookEvent } = await shipping_repository_1.ShippingRepository.recordWebhookEvent(providerName.toUpperCase(), webhookResult.eventId, webhookResult.eventType, rawBody);
        if (isDuplicate) {
            return {
                success: true,
                duplicate: true,
                message: 'Webhook event already processed',
                providerEventId: webhookResult.eventId,
            };
        }
        // Find shipment by tracking number
        let shipment = null;
        if (webhookResult.trackingNumber) {
            shipment = await shipping_repository_1.ShippingRepository.findByTrackingNumber(webhookResult.trackingNumber);
        }
        if (shipment) {
            try {
                await shipping_repository_1.ShippingRepository.updateShipmentStatus({
                    shipmentId: shipment.id,
                    toStatus: webhookResult.status,
                    description: webhookResult.description,
                    location: webhookResult.location,
                    providerEventId: webhookResult.eventId,
                    occurredAt: webhookResult.occurredAt,
                });
                await shipping_repository_1.ShippingRepository.markWebhookProcessed(webhookEvent.id, 'PROCESSED');
                return {
                    success: true,
                    processed: true,
                    shipmentId: shipment.id,
                    status: webhookResult.status,
                    providerEventId: webhookResult.eventId,
                };
            }
            catch (err) {
                await shipping_repository_1.ShippingRepository.markWebhookProcessed(webhookEvent.id, 'FAILED');
                throw err;
            }
        }
        else {
            await shipping_repository_1.ShippingRepository.markWebhookProcessed(webhookEvent.id, 'PROCESSED');
            return {
                success: true,
                processed: false,
                message: 'Shipment not found for tracking number',
                trackingNumber: webhookResult.trackingNumber,
            };
        }
    }
    /**
     * Cancels a shipment.
     */
    static async cancelShipment(shipmentId, reason, actorId) {
        const shipment = await shipping_repository_1.ShippingRepository.findById(shipmentId);
        if (!shipment) {
            throw new app_error_1.NotFoundException('Shipment not found');
        }
        if (shipment.status === client_1.ShipmentStatus.SHIPPED ||
            shipment.status === client_1.ShipmentStatus.IN_TRANSIT ||
            shipment.status === client_1.ShipmentStatus.OUT_FOR_DELIVERY ||
            shipment.status === client_1.ShipmentStatus.DELIVERED) {
            throw new app_error_1.BadRequestException(`Cannot cancel shipment that has already been shipped or delivered`);
        }
        const updatedShipment = await shipping_repository_1.ShippingRepository.updateShipmentStatus({
            shipmentId,
            toStatus: client_1.ShipmentStatus.CANCELLED,
            description: `Shipment cancelled: ${reason}`,
            actorId,
        });
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SHIPMENT_CANCELLED',
                resource: 'Shipment',
                resourceId: shipmentId,
                after: { reason },
            });
        }
        return this.formatShipmentResponse(updatedShipment);
    }
    /**
     * Retrieves shipment by ID with IDOR protection.
     */
    static async getShipmentById(shipmentId, userId, userRoles = []) {
        const shipment = await shipping_repository_1.ShippingRepository.findById(shipmentId);
        if (!shipment) {
            throw new app_error_1.NotFoundException('Shipment not found');
        }
        await this.verifyOrderOwnership(shipment.order, userId, userRoles);
        return this.formatShipmentResponse(shipment);
    }
    /**
     * Retrieves shipments for an order with IDOR protection.
     */
    static async getShipmentsByOrderId(orderId, userId, userRoles = []) {
        const order = await order_repository_1.OrderRepository.findById(orderId);
        if (!order) {
            throw new app_error_1.NotFoundException('Order not found');
        }
        await this.verifyOrderOwnership(order, userId, userRoles);
        const shipments = await shipping_repository_1.ShippingRepository.findByOrderId(orderId);
        return shipments.map((s) => this.formatShipmentResponse(s));
    }
    /**
     * Public tracking lookup by tracking number. Masks customer details.
     */
    static async getShipmentTracking(trackingNumber) {
        const shipment = await shipping_repository_1.ShippingRepository.findByTrackingNumber(trackingNumber);
        if (!shipment) {
            throw new app_error_1.NotFoundException('Shipment not found for tracking number');
        }
        return this.formatTrackingResponse(shipment);
    }
    /**
     * Staff query for admin fulfillment dashboard.
     */
    static async getAdminShipments(params, userRoles = []) {
        const isStaff = userRoles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'INVENTORY_CLERK', 'WAREHOUSE', 'ACCOUNTANT'].includes(r));
        if (!isStaff) {
            throw new app_error_1.ForbiddenException('Staff privileges required to access admin shipments');
        }
        const result = await shipping_repository_1.ShippingRepository.findAdminShipments(params);
        return {
            shipments: result.shipments.map((s) => this.formatShipmentResponse(s)),
            pagination: result.pagination,
        };
    }
}
exports.ShippingService = ShippingService;
//# sourceMappingURL=shipping.service.js.map