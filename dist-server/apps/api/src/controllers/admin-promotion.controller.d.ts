import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminPromotionController {
    /**
     * Promotions CRUD
     */
    static listPromotions(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getPromotionById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createPromotion(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updatePromotion(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deletePromotion(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Coupons CRUD
     */
    static listCoupons(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getCouponById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createCoupon(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateCoupon(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteCoupon(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Promotion redemptions report
     */
    static listRedemptions(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
