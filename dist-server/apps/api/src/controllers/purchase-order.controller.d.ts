import { FastifyRequest, FastifyReply } from 'fastify';
export declare class PurchaseOrderController {
    static getPurchaseOrders(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getPurchaseOrderById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createDraftPO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateDraftPO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static submitForApproval(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static approvePO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static rejectPO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static sendPO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static cancelPO(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
