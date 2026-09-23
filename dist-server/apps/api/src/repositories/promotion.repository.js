"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
class PromotionRepository {
    /**
     * Promotions CRUD
     */
    static async listPromotions(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.status) {
            where.status = params.status;
        }
        if (params.promotionType) {
            where.promotionType = params.promotionType;
        }
        if (params.activeOnly) {
            const now = new Date();
            where.status = client_1.PromotionStatus.ACTIVE;
            where.OR = [
                { startsAt: null, endsAt: null },
                { startsAt: { lte: now }, endsAt: null },
                { startsAt: null, endsAt: { gte: now } },
                { startsAt: { lte: now }, endsAt: { gte: now } },
            ];
        }
        if (params.search) {
            const search = params.search.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, promotions] = await Promise.all([
            database_1.prisma.promotion.count({ where }),
            database_1.prisma.promotion.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                include: {
                    products: { include: { product: true } },
                    categories: { include: { category: true } },
                    brands: { include: { brand: true } },
                    rules: true,
                    coupons: true,
                    _count: {
                        select: { redemptions: true },
                    },
                },
            }),
        ]);
        return {
            data: promotions,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async findPromotionById(id) {
        return database_1.prisma.promotion.findFirst({
            where: { id, deletedAt: null },
            include: {
                products: { include: { product: true } },
                categories: { include: { category: true } },
                brands: { include: { brand: true } },
                rules: true,
                coupons: true,
                _count: {
                    select: { redemptions: true },
                },
            },
        });
    }
    static async createPromotion(data) {
        return database_1.prisma.$transaction(async (tx) => {
            const promo = await tx.promotion.create({
                data: {
                    name: data.name.trim(),
                    code: data.code?.trim().toUpperCase() || null,
                    description: data.description || null,
                    promotionType: data.promotionType,
                    status: data.status || client_1.PromotionStatus.DRAFT,
                    startsAt: data.startsAt || null,
                    endsAt: data.endsAt || null,
                    priority: data.priority ?? 0,
                    stackable: data.stackable ?? false,
                    minimumOrderAmount: new client_1.Prisma.Decimal(data.minimumOrderAmount || 0),
                    discountValue: new client_1.Prisma.Decimal(data.discountValue),
                    maximumDiscountAmount: data.maximumDiscountAmount
                        ? new client_1.Prisma.Decimal(data.maximumDiscountAmount)
                        : null,
                    usageLimit: data.usageLimit || null,
                    perCustomerLimit: data.perCustomerLimit || null,
                },
            });
            if (data.productIds && data.productIds.length > 0) {
                await tx.promotionProduct.createMany({
                    data: data.productIds.map((pid) => ({ promotionId: promo.id, productId: pid })),
                });
            }
            if (data.categoryIds && data.categoryIds.length > 0) {
                await tx.promotionCategory.createMany({
                    data: data.categoryIds.map((cid) => ({ promotionId: promo.id, categoryId: cid })),
                });
            }
            if (data.brandIds && data.brandIds.length > 0) {
                await tx.promotionBrand.createMany({
                    data: data.brandIds.map((bid) => ({ promotionId: promo.id, brandId: bid })),
                });
            }
            if (data.rules && data.rules.length > 0) {
                await tx.promotionRule.createMany({
                    data: data.rules.map((r) => ({
                        promotionId: promo.id,
                        ruleType: r.ruleType,
                        ruleValue: r.ruleValue,
                    })),
                });
            }
            return tx.promotion.findUnique({
                where: { id: promo.id },
                include: {
                    products: { include: { product: true } },
                    categories: { include: { category: true } },
                    brands: { include: { brand: true } },
                    rules: true,
                    coupons: true,
                },
            });
        });
    }
    static async updatePromotion(id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name.trim();
            if (data.code !== undefined)
                updateData.code = data.code ? data.code.trim().toUpperCase() : null;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.promotionType !== undefined)
                updateData.promotionType = data.promotionType;
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.startsAt !== undefined)
                updateData.startsAt = data.startsAt;
            if (data.endsAt !== undefined)
                updateData.endsAt = data.endsAt;
            if (data.priority !== undefined)
                updateData.priority = data.priority;
            if (data.stackable !== undefined)
                updateData.stackable = data.stackable;
            if (data.minimumOrderAmount !== undefined)
                updateData.minimumOrderAmount = new client_1.Prisma.Decimal(data.minimumOrderAmount);
            if (data.discountValue !== undefined)
                updateData.discountValue = new client_1.Prisma.Decimal(data.discountValue);
            if (data.maximumDiscountAmount !== undefined)
                updateData.maximumDiscountAmount = data.maximumDiscountAmount
                    ? new client_1.Prisma.Decimal(data.maximumDiscountAmount)
                    : null;
            if (data.usageLimit !== undefined)
                updateData.usageLimit = data.usageLimit;
            if (data.perCustomerLimit !== undefined)
                updateData.perCustomerLimit = data.perCustomerLimit;
            await tx.promotion.update({
                where: { id },
                data: updateData,
            });
            if (data.productIds) {
                await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
                if (data.productIds.length > 0) {
                    await tx.promotionProduct.createMany({
                        data: data.productIds.map((pid) => ({ promotionId: id, productId: pid })),
                    });
                }
            }
            if (data.categoryIds) {
                await tx.promotionCategory.deleteMany({ where: { promotionId: id } });
                if (data.categoryIds.length > 0) {
                    await tx.promotionCategory.createMany({
                        data: data.categoryIds.map((cid) => ({ promotionId: id, categoryId: cid })),
                    });
                }
            }
            if (data.brandIds) {
                await tx.promotionBrand.deleteMany({ where: { promotionId: id } });
                if (data.brandIds.length > 0) {
                    await tx.promotionBrand.createMany({
                        data: data.brandIds.map((bid) => ({ promotionId: id, brandId: bid })),
                    });
                }
            }
            if (data.rules) {
                await tx.promotionRule.deleteMany({ where: { promotionId: id } });
                if (data.rules.length > 0) {
                    await tx.promotionRule.createMany({
                        data: data.rules.map((r) => ({
                            promotionId: id,
                            ruleType: r.ruleType,
                            ruleValue: r.ruleValue,
                        })),
                    });
                }
            }
            return tx.promotion.findUnique({
                where: { id },
                include: {
                    products: { include: { product: true } },
                    categories: { include: { category: true } },
                    brands: { include: { brand: true } },
                    rules: true,
                    coupons: true,
                },
            });
        });
    }
    static async deletePromotion(id) {
        return database_1.prisma.promotion.update({
            where: { id },
            data: { deletedAt: new Date(), status: client_1.PromotionStatus.CANCELLED },
        });
    }
    /**
     * Coupons CRUD & Validation
     */
    static async listCoupons(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.promotionId) {
            where.promotionId = params.promotionId;
        }
        if (params.isActive !== undefined) {
            where.isActive = params.isActive;
        }
        if (params.search) {
            const search = params.search.trim();
            where.code = { contains: search, mode: 'insensitive' };
        }
        const [total, coupons] = await Promise.all([
            database_1.prisma.coupon.count({ where }),
            database_1.prisma.coupon.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    promotion: true,
                    _count: {
                        select: { redemptions: true },
                    },
                },
            }),
        ]);
        return {
            data: coupons,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async findCouponByCode(code) {
        return database_1.prisma.coupon.findFirst({
            where: {
                code: code.trim().toUpperCase(),
                deletedAt: null,
            },
            include: {
                promotion: {
                    include: {
                        products: true,
                        categories: true,
                        brands: true,
                        rules: true,
                    },
                },
            },
        });
    }
    static async findCouponById(id) {
        return database_1.prisma.coupon.findFirst({
            where: { id, deletedAt: null },
            include: {
                promotion: {
                    include: {
                        products: true,
                        categories: true,
                        brands: true,
                        rules: true,
                    },
                },
            },
        });
    }
    static async createCoupon(data) {
        return database_1.prisma.coupon.create({
            data: {
                code: data.code.trim().toUpperCase(),
                promotionId: data.promotionId,
                usageLimit: data.usageLimit || null,
                perCustomerLimit: data.perCustomerLimit || null,
                startsAt: data.startsAt || null,
                endsAt: data.endsAt || null,
                isActive: data.isActive ?? true,
            },
            include: { promotion: true },
        });
    }
    static async updateCoupon(id, data) {
        return database_1.prisma.coupon.update({
            where: { id },
            data: {
                code: data.code ? data.code.trim().toUpperCase() : undefined,
                usageLimit: data.usageLimit,
                perCustomerLimit: data.perCustomerLimit,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                isActive: data.isActive,
            },
            include: { promotion: true },
        });
    }
    static async deleteCoupon(id) {
        return database_1.prisma.coupon.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    static async countCustomerCouponRedemptions(couponId, customerId) {
        return database_1.prisma.couponRedemption.count({
            where: { couponId, customerId },
        });
    }
    static async listPromotionRedemptions(promotionId, limit = 50, skip = 0) {
        return database_1.prisma.couponRedemption.findMany({
            where: { promotionId },
            skip,
            take: limit,
            orderBy: { redeemedAt: 'desc' },
            include: {
                coupon: true,
                customer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        grandTotal: true,
                        status: true,
                    },
                },
            },
        });
    }
}
exports.PromotionRepository = PromotionRepository;
//# sourceMappingURL=promotion.repository.js.map