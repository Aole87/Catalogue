"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPromotionController = void 0;
const promotion_repository_1 = require("../repositories/promotion.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const promotion_schema_1 = require("../schemas/promotion.schema");
const app_error_1 = require("../errors/app-error");
class AdminPromotionController {
    /**
     * Promotions CRUD
     */
    static async listPromotions(request, reply) {
        const query = promotion_schema_1.promotionQuerySchema.parse(request.query);
        const result = await promotion_repository_1.PromotionRepository.listPromotions(query);
        return reply.status(200).send(result);
    }
    static async getPromotionById(request, reply) {
        const { id } = request.params;
        const promo = await promotion_repository_1.PromotionRepository.findPromotionById(id);
        if (!promo) {
            throw new app_error_1.NotFoundException('Promotion not found');
        }
        return reply.status(200).send({ data: promo });
    }
    static async createPromotion(request, reply) {
        const body = promotion_schema_1.createPromotionSchema.parse(request.body);
        const promo = await promotion_repository_1.PromotionRepository.createPromotion(body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'PROMOTION_CREATED',
                resource: 'Promotion',
                resourceId: promo?.id || 'unknown',
                after: body,
            });
        }
        return reply.status(201).send({ data: promo, message: 'Promotion created successfully' });
    }
    static async updatePromotion(request, reply) {
        const { id } = request.params;
        const body = promotion_schema_1.updatePromotionSchema.parse(request.body);
        const promo = await promotion_repository_1.PromotionRepository.findPromotionById(id);
        if (!promo) {
            throw new app_error_1.NotFoundException('Promotion not found');
        }
        const updated = await promotion_repository_1.PromotionRepository.updatePromotion(id, body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'PROMOTION_UPDATED',
                resource: 'Promotion',
                resourceId: promo.id,
                before: { name: promo.name, status: promo.status, discountValue: promo.discountValue },
                after: body,
            });
        }
        return reply.status(200).send({ data: updated, message: 'Promotion updated successfully' });
    }
    static async deletePromotion(request, reply) {
        const { id } = request.params;
        const promo = await promotion_repository_1.PromotionRepository.findPromotionById(id);
        if (!promo) {
            throw new app_error_1.NotFoundException('Promotion not found');
        }
        await promotion_repository_1.PromotionRepository.deletePromotion(id);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'PROMOTION_DELETED',
                resource: 'Promotion',
                resourceId: promo.id,
            });
        }
        return reply.status(200).send({ message: 'Promotion deleted successfully' });
    }
    /**
     * Coupons CRUD
     */
    static async listCoupons(request, reply) {
        const query = promotion_schema_1.couponQuerySchema.parse(request.query);
        const result = await promotion_repository_1.PromotionRepository.listCoupons(query);
        return reply.status(200).send(result);
    }
    static async getCouponById(request, reply) {
        const { id } = request.params;
        const coupon = await promotion_repository_1.PromotionRepository.findCouponById(id);
        if (!coupon) {
            throw new app_error_1.NotFoundException('Coupon not found');
        }
        return reply.status(200).send({ data: coupon });
    }
    static async createCoupon(request, reply) {
        const body = promotion_schema_1.createCouponSchema.parse(request.body);
        const coupon = await promotion_repository_1.PromotionRepository.createCoupon(body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'COUPON_CREATED',
                resource: 'Coupon',
                resourceId: coupon.id,
                after: body,
            });
        }
        return reply.status(201).send({ data: coupon, message: 'Coupon created successfully' });
    }
    static async updateCoupon(request, reply) {
        const { id } = request.params;
        const body = promotion_schema_1.updateCouponSchema.parse(request.body);
        const coupon = await promotion_repository_1.PromotionRepository.findCouponById(id);
        if (!coupon) {
            throw new app_error_1.NotFoundException('Coupon not found');
        }
        const updated = await promotion_repository_1.PromotionRepository.updateCoupon(id, body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'COUPON_UPDATED',
                resource: 'Coupon',
                resourceId: coupon.id,
                after: body,
            });
        }
        return reply.status(200).send({ data: updated, message: 'Coupon updated successfully' });
    }
    static async deleteCoupon(request, reply) {
        const { id } = request.params;
        await promotion_repository_1.PromotionRepository.deleteCoupon(id);
        return reply.status(200).send({ message: 'Coupon deleted successfully' });
    }
    /**
     * Promotion redemptions report
     */
    static async listRedemptions(request, reply) {
        const { id } = request.params;
        const redemptions = await promotion_repository_1.PromotionRepository.listPromotionRedemptions(id);
        return reply.status(200).send({ data: redemptions });
    }
}
exports.AdminPromotionController = AdminPromotionController;
//# sourceMappingURL=admin-promotion.controller.js.map