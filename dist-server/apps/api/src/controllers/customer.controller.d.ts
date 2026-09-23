import { FastifyRequest, FastifyReply } from 'fastify';
export declare class CustomerController {
    /**
     * GET /api/v1/customers/me
     */
    static getMe(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * PATCH /api/v1/customers/me
     */
    static updateMe(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/customers/me/activity
     */
    static getMyActivity(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/customers/me/loyalty
     */
    static getMyLoyalty(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * POST /api/v1/coupons/validate
     */
    static validateCoupon(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * POST /api/v1/loyalty/redeem (preview & validation)
     */
    static redeemPointsPreview(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
