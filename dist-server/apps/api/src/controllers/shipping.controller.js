"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const shipping_service_1 = require("../services/shipping.service");
const shipping_schema_1 = require("../schemas/shipping.schema");
class ShippingController {
    /**
     * Public: List available shipping methods.
     */
    static async getShippingMethods(request, reply) {
        const methods = await shipping_service_1.ShippingService.getShippingMethods(true);
        return reply.send({ data: methods });
    }
    /**
     * Customer / Staff: Create shipment for confirmed order.
     */
    static async createShipment(request, reply) {
        const body = shipping_schema_1.createShipmentSchema.parse(request.body);
        const actorId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const shipment = await shipping_service_1.ShippingService.createShipment({
            ...body,
            actorId,
            userRoles,
        });
        return reply.status(201).send({ data: shipment });
    }
    /**
     * Customer / Staff: Get shipment by ID.
     */
    static async getShipmentById(request, reply) {
        const { id } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const shipment = await shipping_service_1.ShippingService.getShipmentById(id, userId, userRoles);
        return reply.send({ data: shipment });
    }
    /**
     * Customer / Staff: Get shipments by Order ID.
     */
    static async getShipmentsByOrderId(request, reply) {
        const { orderId } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const shipments = await shipping_service_1.ShippingService.getShipmentsByOrderId(orderId, userId, userRoles);
        return reply.send({ data: shipments });
    }
    /**
     * Staff: Update shipment status.
     */
    static async updateShipmentStatus(request, reply) {
        const { id } = request.params;
        const body = shipping_schema_1.updateShipmentStatusSchema.parse(request.body);
        const actorId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const shipment = await shipping_service_1.ShippingService.updateShipmentStatus({
            shipmentId: id,
            toStatus: body.toStatus,
            description: body.description,
            location: body.location,
            occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
            actorId,
            userRoles,
        });
        return reply.send({ data: shipment });
    }
    /**
     * Staff: Assign tracking number.
     */
    static async assignTracking(request, reply) {
        const { id } = request.params;
        const body = shipping_schema_1.assignTrackingSchema.parse(request.body);
        const actorId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const shipment = await shipping_service_1.ShippingService.assignTracking({
            shipmentId: id,
            trackingNumber: body.trackingNumber,
            carrier: body.carrier,
            serviceLevel: body.serviceLevel,
            actorId,
            userRoles,
        });
        return reply.send({ data: shipment });
    }
    /**
     * Staff: Cancel shipment.
     */
    static async cancelShipment(request, reply) {
        const { id } = request.params;
        const body = shipping_schema_1.cancelShipmentSchema.parse(request.body);
        const actorId = request.user?.id;
        const shipment = await shipping_service_1.ShippingService.cancelShipment(id, body.reason, actorId);
        return reply.send({ data: shipment });
    }
    /**
     * Public: Customer tracking lookup by tracking number.
     */
    static async getShipmentTracking(request, reply) {
        const { trackingNumber } = request.params;
        const trackingInfo = await shipping_service_1.ShippingService.getShipmentTracking(trackingNumber);
        return reply.send({ data: trackingInfo });
    }
    /**
     * Courier Provider: Inbound tracking webhook.
     */
    static async handleWebhook(request, reply) {
        const { provider } = request.params;
        const rawBody = request.body;
        const headers = request.headers;
        const result = await shipping_service_1.ShippingService.handleTrackingWebhook(provider, rawBody, headers);
        return reply.status(200).send(result);
    }
    /**
     * Staff: Query shipments for admin fulfillment dashboard.
     */
    static async getAdminShipments(request, reply) {
        const query = shipping_schema_1.adminShipmentQuerySchema.parse(request.query);
        const userRoles = request.user?.roles || [];
        const result = await shipping_service_1.ShippingService.getAdminShipments(query, userRoles);
        return reply.send({ data: result.shipments, pagination: result.pagination });
    }
}
exports.ShippingController = ShippingController;
//# sourceMappingURL=shipping.controller.js.map