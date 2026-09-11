import { FastifyRequest, FastifyReply } from 'fastify';
import { CrmRepository } from '../repositories/crm.repository';
import { CustomerActivityRepository } from '../repositories/customer-activity.repository';
import { LoyaltyRepository } from '../repositories/loyalty.repository';
import { PromotionService } from '../services/promotion.service';
import { LoyaltyService } from '../services/loyalty.service';
import { CustomerActivityService } from '../services/customer-activity.service';
import { updateCustomerMeSchema } from '../schemas/crm.schema';
import { validateCouponSchema } from '../schemas/promotion.schema';
import { redeemLoyaltySchema } from '../schemas/loyalty.schema';
import { NotFoundException, UnauthorizedException } from '../errors/app-error';
import { CustomerActivityType } from '@prisma/client';
import { prisma } from '@car-parts/database';

export class CustomerController {
  /**
   * GET /api/v1/customers/me
   */
  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const customer = await CrmRepository.findCustomerByUserId(request.user.id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const metrics = await CrmRepository.calculateCustomerMetrics(customer.id);

    return reply.status(200).send({
      data: {
        id: customer.id,
        userId: customer.userId,
        customerType: customer.customerType,
        companyName: customer.companyName,
        taxId: customer.taxId,
        phone: customer.phone,
        user: customer.user,
        addresses: customer.addresses,
        tags: customer.tagAssignments.map((t) => t.tag),
        segments: customer.segmentMemberships.map((s) => s.segment),
        loyaltyAccount: customer.loyaltyAccount
          ? {
              pointsBalance: customer.loyaltyAccount.pointsBalance,
              tier: customer.loyaltyAccount.tier,
              lifetimeEarned: customer.loyaltyAccount.lifetimeEarned,
              lifetimeRedeemed: customer.loyaltyAccount.lifetimeRedeemed,
            }
          : null,
        metrics,
      },
    });
  }

  /**
   * PATCH /api/v1/customers/me
   */
  static async updateMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const body = updateCustomerMeSchema.parse(request.body);
    const customer = await CrmRepository.findCustomerByUserId(request.user.id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // Update user names if provided
    if (body.firstName || body.lastName || body.displayName) {
      await prisma.user.update({
        where: { id: request.user.id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          displayName: body.displayName,
        },
      });
    }

    // Update customer profile
    const updated = await CrmRepository.updateCustomerProfile(customer.id, {
      companyName: body.companyName,
      taxId: body.taxId,
      phone: body.phone,
    });

    CustomerActivityService.record({
      customerId: customer.id,
      userId: request.user.id,
      eventType: CustomerActivityType.PROFILE_UPDATED,
      description: 'Customer updated their profile details',
    }).catch(() => {});

    return reply.status(200).send({
      data: updated,
      message: 'Profile updated successfully',
    });
  }

  /**
   * GET /api/v1/customers/me/activity
   */
  static async getMyActivity(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const customer = await CrmRepository.findCustomerByUserId(request.user.id);
    const activities = customer
      ? await CustomerActivityRepository.listByCustomerId(customer.id, 50)
      : await CustomerActivityRepository.listByUserId(request.user.id, 50);

    return reply.status(200).send({
      data: activities,
    });
  }

  /**
   * GET /api/v1/customers/me/loyalty
   */
  static async getMyLoyalty(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const customer = await CrmRepository.findCustomerByUserId(request.user.id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const account = await LoyaltyRepository.findAccountByCustomerId(customer.id);
    if (!account) {
      const created = await LoyaltyRepository.getOrCreateAccount(customer.id);
      return reply.status(200).send({
        data: {
          pointsBalance: created.pointsBalance,
          tier: created.tier,
          lifetimeEarned: created.lifetimeEarned,
          lifetimeRedeemed: created.lifetimeRedeemed,
          transactions: [],
        },
      });
    }

    return reply.status(200).send({
      data: {
        pointsBalance: account.pointsBalance,
        tier: account.tier,
        lifetimeEarned: account.lifetimeEarned,
        lifetimeRedeemed: account.lifetimeRedeemed,
        transactions: account.transactions.map((t) => ({
          id: t.id,
          transactionType: t.transactionType,
          points: t.points,
          balanceAfter: t.balanceAfter,
          reason: t.reason,
          createdAt: t.createdAt,
        })),
      },
    });
  }

  /**
   * POST /api/v1/coupons/validate
   */
  static async validateCoupon(request: FastifyRequest, reply: FastifyReply) {
    const body = validateCouponSchema.parse(request.body);

    let customerId: string | null = null;
    if (request.user) {
      const customer = await CrmRepository.findCustomerByUserId(request.user.id);
      if (customer) customerId = customer.id;
    }

    const result = await PromotionService.validateCoupon(
      body.code,
      body.items || [],
      body.subtotal,
      customerId
    );

    return reply.status(200).send({
      data: result,
      message: 'Coupon is valid and applied',
    });
  }

  /**
   * POST /api/v1/loyalty/redeem (preview & validation)
   */
  static async redeemPointsPreview(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedException('Authentication required to redeem loyalty points');
    }

    const body = redeemLoyaltySchema.parse(request.body);
    const customer = await CrmRepository.findCustomerByUserId(request.user.id);
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const result = await LoyaltyService.validateRedemption(customer.id, body.points, body.subtotal);

    return reply.status(200).send({
      data: result,
      message: 'Loyalty points redemption preview calculated',
    });
  }
}
