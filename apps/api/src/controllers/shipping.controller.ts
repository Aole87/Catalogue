import { FastifyRequest, FastifyReply } from 'fastify';
import { ShippingService } from '../services/shipping.service';
import {
  createShipmentSchema,
  updateShipmentStatusSchema,
  assignTrackingSchema,
  cancelShipmentSchema,
  adminShipmentQuerySchema,
} from '../schemas/shipping.schema';

export class ShippingController {
  /**
   * Public: List available shipping methods.
   */
  static async getShippingMethods(request: FastifyRequest, reply: FastifyReply) {
    const methods = await ShippingService.getShippingMethods(true);
    return reply.send({ data: methods });
  }

  /**
   * Customer / Staff: Create shipment for confirmed order.
   */
  static async createShipment(request: FastifyRequest, reply: FastifyReply) {
    const body = createShipmentSchema.parse(request.body);
    const actorId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const shipment = await ShippingService.createShipment({
      ...body,
      actorId,
      userRoles,
    });

    return reply.status(201).send({ data: shipment });
  }

  /**
   * Customer / Staff: Get shipment by ID.
   */
  static async getShipmentById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const shipment = await ShippingService.getShipmentById(id, userId, userRoles);
    return reply.send({ data: shipment });
  }

  /**
   * Customer / Staff: Get shipments by Order ID.
   */
  static async getShipmentsByOrderId(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.params as { orderId: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const shipments = await ShippingService.getShipmentsByOrderId(orderId, userId, userRoles);
    return reply.send({ data: shipments });
  }

  /**
   * Staff: Update shipment status.
   */
  static async updateShipmentStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateShipmentStatusSchema.parse(request.body);
    const actorId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const shipment = await ShippingService.updateShipmentStatus({
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
  static async assignTracking(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = assignTrackingSchema.parse(request.body);
    const actorId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const shipment = await ShippingService.assignTracking({
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
  static async cancelShipment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = cancelShipmentSchema.parse(request.body);
    const actorId = request.user?.id;

    const shipment = await ShippingService.cancelShipment(id, body.reason, actorId);
    return reply.send({ data: shipment });
  }

  /**
   * Public: Customer tracking lookup by tracking number.
   */
  static async getShipmentTracking(request: FastifyRequest, reply: FastifyReply) {
    const { trackingNumber } = request.params as { trackingNumber: string };
    const trackingInfo = await ShippingService.getShipmentTracking(trackingNumber);
    return reply.send({ data: trackingInfo });
  }

  /**
   * Courier Provider: Inbound tracking webhook.
   */
  static async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = request.params as { provider: string };
    const rawBody = request.body;
    const headers = request.headers;

    const result = await ShippingService.handleTrackingWebhook(provider, rawBody, headers);
    return reply.status(200).send(result);
  }

  /**
   * Staff: Query shipments for admin fulfillment dashboard.
   */
  static async getAdminShipments(request: FastifyRequest, reply: FastifyReply) {
    const query = adminShipmentQuerySchema.parse(request.query);
    const userRoles = request.user?.roles || [];

    const result = await ShippingService.getAdminShipments(query, userRoles);
    return reply.send({ data: result.shipments, pagination: result.pagination });
  }
}
