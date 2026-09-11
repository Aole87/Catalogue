import { FastifyRequest, FastifyReply } from 'fastify';
import { PromotionRepository } from '../repositories/promotion.repository';
import { AuditRepository } from '../repositories/audit.repository';
import {
  promotionQuerySchema,
  createPromotionSchema,
  updatePromotionSchema,
  couponQuerySchema,
  createCouponSchema,
  updateCouponSchema,
} from '../schemas/promotion.schema';
import { NotFoundException } from '../errors/app-error';

export class AdminPromotionController {
  /**
   * Promotions CRUD
   */
  static async listPromotions(request: FastifyRequest, reply: FastifyReply) {
    const query = promotionQuerySchema.parse(request.query);
    const result = await PromotionRepository.listPromotions(query);
    return reply.status(200).send(result);
  }

  static async getPromotionById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const promo = await PromotionRepository.findPromotionById(id);
    if (!promo) {
      throw new NotFoundException('Promotion not found');
    }
    return reply.status(200).send({ data: promo });
  }

  static async createPromotion(request: FastifyRequest, reply: FastifyReply) {
    const body = createPromotionSchema.parse(request.body);
    const promo = await PromotionRepository.createPromotion(body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'PROMOTION_CREATED',
        resource: 'Promotion',
        resourceId: promo?.id || 'unknown',
        after: body,
      });
    }

    return reply.status(201).send({ data: promo, message: 'Promotion created successfully' });
  }

  static async updatePromotion(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updatePromotionSchema.parse(request.body);
    const promo = await PromotionRepository.findPromotionById(id);
    if (!promo) {
      throw new NotFoundException('Promotion not found');
    }

    const updated = await PromotionRepository.updatePromotion(id, body);

    if (request.user) {
      await AuditRepository.record({
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

  static async deletePromotion(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const promo = await PromotionRepository.findPromotionById(id);
    if (!promo) {
      throw new NotFoundException('Promotion not found');
    }

    await PromotionRepository.deletePromotion(id);

    if (request.user) {
      await AuditRepository.record({
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
  static async listCoupons(request: FastifyRequest, reply: FastifyReply) {
    const query = couponQuerySchema.parse(request.query);
    const result = await PromotionRepository.listCoupons(query);
    return reply.status(200).send(result);
  }

  static async getCouponById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const coupon = await PromotionRepository.findCouponById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return reply.status(200).send({ data: coupon });
  }

  static async createCoupon(request: FastifyRequest, reply: FastifyReply) {
    const body = createCouponSchema.parse(request.body);
    const coupon = await PromotionRepository.createCoupon(body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'COUPON_CREATED',
        resource: 'Coupon',
        resourceId: coupon.id,
        after: body,
      });
    }

    return reply.status(201).send({ data: coupon, message: 'Coupon created successfully' });
  }

  static async updateCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateCouponSchema.parse(request.body);
    const coupon = await PromotionRepository.findCouponById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const updated = await PromotionRepository.updateCoupon(id, body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'COUPON_UPDATED',
        resource: 'Coupon',
        resourceId: coupon.id,
        after: body,
      });
    }

    return reply.status(200).send({ data: updated, message: 'Coupon updated successfully' });
  }

  static async deleteCoupon(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await PromotionRepository.deleteCoupon(id);
    return reply.status(200).send({ message: 'Coupon deleted successfully' });
  }

  /**
   * Promotion redemptions report
   */
  static async listRedemptions(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const redemptions = await PromotionRepository.listPromotionRedemptions(id);
    return reply.status(200).send({ data: redemptions });
  }
}
