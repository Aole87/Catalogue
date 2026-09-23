"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const crm_repository_1 = require("../repositories/crm.repository");
const customer_activity_repository_1 = require("../repositories/customer-activity.repository");
const loyalty_repository_1 = require("../repositories/loyalty.repository");
const promotion_service_1 = require("../services/promotion.service");
const loyalty_service_1 = require("../services/loyalty.service");
const customer_activity_service_1 = require("../services/customer-activity.service");
const crm_schema_1 = require("../schemas/crm.schema");
const promotion_schema_1 = require("../schemas/promotion.schema");
const loyalty_schema_1 = require("../schemas/loyalty.schema");
const app_error_1 = require("../errors/app-error");
const client_1 = require("@prisma/client");
const database_1 = require("@car-parts/database");
class CustomerController {
    /**
     * GET /api/v1/customers/me
     */
    static async getMe(request, reply) {
        if (!request.user) {
            throw new app_error_1.UnauthorizedException('Authentication required');
        }
        const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        const metrics = await crm_repository_1.CrmRepository.calculateCustomerMetrics(customer.id);
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
    static async updateMe(request, reply) {
        if (!request.user) {
            throw new app_error_1.UnauthorizedException('Authentication required');
        }
        const body = crm_schema_1.updateCustomerMeSchema.parse(request.body);
        const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        // Update user names if provided
        if (body.firstName || body.lastName || body.displayName) {
            await database_1.prisma.user.update({
                where: { id: request.user.id },
                data: {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    displayName: body.displayName,
                },
            });
        }
        // Update customer profile
        const updated = await crm_repository_1.CrmRepository.updateCustomerProfile(customer.id, {
            companyName: body.companyName,
            taxId: body.taxId,
            phone: body.phone,
        });
        customer_activity_service_1.CustomerActivityService.record({
            customerId: customer.id,
            userId: request.user.id,
            eventType: client_1.CustomerActivityType.PROFILE_UPDATED,
            description: 'Customer updated their profile details',
        }).catch(() => { });
        return reply.status(200).send({
            data: updated,
            message: 'Profile updated successfully',
        });
    }
    /**
     * GET /api/v1/customers/me/activity
     */
    static async getMyActivity(request, reply) {
        if (!request.user) {
            throw new app_error_1.UnauthorizedException('Authentication required');
        }
        const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
        const activities = customer
            ? await customer_activity_repository_1.CustomerActivityRepository.listByCustomerId(customer.id, 50)
            : await customer_activity_repository_1.CustomerActivityRepository.listByUserId(request.user.id, 50);
        return reply.status(200).send({
            data: activities,
        });
    }
    /**
     * GET /api/v1/customers/me/loyalty
     */
    static async getMyLoyalty(request, reply) {
        if (!request.user) {
            throw new app_error_1.UnauthorizedException('Authentication required');
        }
        const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        const account = await loyalty_repository_1.LoyaltyRepository.findAccountByCustomerId(customer.id);
        if (!account) {
            const created = await loyalty_repository_1.LoyaltyRepository.getOrCreateAccount(customer.id);
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
    static async validateCoupon(request, reply) {
        const body = promotion_schema_1.validateCouponSchema.parse(request.body);
        let customerId = null;
        if (request.user) {
            const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
            if (customer)
                customerId = customer.id;
        }
        const result = await promotion_service_1.PromotionService.validateCoupon(body.code, body.items || [], body.subtotal, customerId);
        return reply.status(200).send({
            data: result,
            message: 'Coupon is valid and applied',
        });
    }
    /**
     * POST /api/v1/loyalty/redeem (preview & validation)
     */
    static async redeemPointsPreview(request, reply) {
        if (!request.user) {
            throw new app_error_1.UnauthorizedException('Authentication required to redeem loyalty points');
        }
        const body = loyalty_schema_1.redeemLoyaltySchema.parse(request.body);
        const customer = await crm_repository_1.CrmRepository.findCustomerByUserId(request.user.id);
        if (!customer) {
            throw new app_error_1.NotFoundException('Customer profile not found');
        }
        const result = await loyalty_service_1.LoyaltyService.validateRedemption(customer.id, body.points, body.subtotal);
        return reply.status(200).send({
            data: result,
            message: 'Loyalty points redemption preview calculated',
        });
    }
}
exports.CustomerController = CustomerController;
//# sourceMappingURL=customer.controller.js.map