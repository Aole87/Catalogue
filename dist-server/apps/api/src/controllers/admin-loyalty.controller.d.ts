import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminLoyaltyController {
    /**
     * GET /api/v1/admin/loyalty/accounts
     */
    static listAccounts(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/admin/loyalty/accounts/:customerId
     */
    static getAccountByCustomerId(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * POST /api/v1/admin/loyalty/accounts/:customerId/adjust
     */
    static adjustPoints(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
