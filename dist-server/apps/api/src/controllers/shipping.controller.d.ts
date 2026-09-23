import { FastifyRequest, FastifyReply } from 'fastify';
export declare class ShippingController {
    /**
     * Public: List available shipping methods.
     */
    static getShippingMethods(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Customer / Staff: Create shipment for confirmed order.
     */
    static createShipment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Customer / Staff: Get shipment by ID.
     */
    static getShipmentById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Customer / Staff: Get shipments by Order ID.
     */
    static getShipmentsByOrderId(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Staff: Update shipment status.
     */
    static updateShipmentStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Staff: Assign tracking number.
     */
    static assignTracking(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Staff: Cancel shipment.
     */
    static cancelShipment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Public: Customer tracking lookup by tracking number.
     */
    static getShipmentTracking(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Courier Provider: Inbound tracking webhook.
     */
    static handleWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Staff: Query shipments for admin fulfillment dashboard.
     */
    static getAdminShipments(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
