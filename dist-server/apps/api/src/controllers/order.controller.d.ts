import { FastifyRequest, FastifyReply } from 'fastify';
export declare class OrderController {
    static checkout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getByOrderNumber(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getMyOrders(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getOrderTimeline(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static cancelOrder(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static requestReturn(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getAdminOrders(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getAdminOrderById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateAdminOrderStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static cancelAdminOrder(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static handleAdminReturnAction(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
