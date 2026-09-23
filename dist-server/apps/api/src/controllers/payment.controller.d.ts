import { FastifyRequest, FastifyReply } from 'fastify';
export declare class PaymentController {
    static createPayment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getPaymentById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getPaymentByOrderId(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static submitSlip(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static verifySlip(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static rejectSlip(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static handleWebhook(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static refundPayment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
