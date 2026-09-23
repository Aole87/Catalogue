import { PromotionType, PromotionStatus, Prisma } from '@prisma/client';
export interface PromotionQueryParams {
    search?: string;
    status?: PromotionStatus;
    promotionType?: PromotionType;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
}
export interface CouponQueryParams {
    search?: string;
    promotionId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class PromotionRepository {
    /**
     * Promotions CRUD
     */
    static listPromotions(params: PromotionQueryParams): Promise<{
        data: ({
            _count: {
                redemptions: number;
            };
            products: ({
                product: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    sku: string;
                    shortDescription: string | null;
                    brandId: string;
                    categoryId: string;
                    barcode: string | null;
                    warrantyText: string | null;
                    weightGrams: number | null;
                    lengthMm: number | null;
                    widthMm: number | null;
                    heightMm: number | null;
                    isPublished: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                productId: string;
                promotionId: string;
            })[];
            rules: {
                id: string;
                createdAt: Date;
                promotionId: string;
                ruleType: string;
                ruleValue: Prisma.JsonValue | null;
            }[];
            categories: ({
                category: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    parentId: string | null;
                    imageUrl: string | null;
                    sortOrder: number;
                };
            } & {
                id: string;
                createdAt: Date;
                promotionId: string;
                categoryId: string;
            })[];
            brands: ({
                brand: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    slug: string;
                    logoUrl: string | null;
                    websiteUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                promotionId: string;
                brandId: string;
            })[];
            coupons: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                promotionId: string;
                code: string;
                startsAt: Date | null;
                endsAt: Date | null;
                usageLimit: number | null;
                usageCount: number;
                perCustomerLimit: number | null;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            code: string | null;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            startsAt: Date | null;
            endsAt: Date | null;
            priority: number;
            stackable: boolean;
            minimumOrderAmount: Prisma.Decimal;
            discountValue: Prisma.Decimal;
            maximumDiscountAmount: Prisma.Decimal | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static findPromotionById(id: string): Promise<({
        _count: {
            redemptions: number;
        };
        products: ({
            product: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            promotionId: string;
        })[];
        rules: {
            id: string;
            createdAt: Date;
            promotionId: string;
            ruleType: string;
            ruleValue: Prisma.JsonValue | null;
        }[];
        categories: ({
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            categoryId: string;
        })[];
        brands: ({
            brand: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                logoUrl: string | null;
                websiteUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            brandId: string;
        })[];
        coupons: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            promotionId: string;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        code: string | null;
        promotionType: import(".prisma/client").$Enums.PromotionType;
        startsAt: Date | null;
        endsAt: Date | null;
        priority: number;
        stackable: boolean;
        minimumOrderAmount: Prisma.Decimal;
        discountValue: Prisma.Decimal;
        maximumDiscountAmount: Prisma.Decimal | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }) | null>;
    static createPromotion(data: {
        name: string;
        code?: string | null;
        description?: string | null;
        promotionType: PromotionType;
        status?: PromotionStatus;
        startsAt?: Date | null;
        endsAt?: Date | null;
        priority?: number;
        stackable?: boolean;
        minimumOrderAmount?: number | string;
        discountValue: number | string;
        maximumDiscountAmount?: number | string | null;
        usageLimit?: number | null;
        perCustomerLimit?: number | null;
        productIds?: string[];
        categoryIds?: string[];
        brandIds?: string[];
        rules?: {
            ruleType: string;
            ruleValue?: any;
        }[];
    }): Promise<({
        products: ({
            product: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            promotionId: string;
        })[];
        rules: {
            id: string;
            createdAt: Date;
            promotionId: string;
            ruleType: string;
            ruleValue: Prisma.JsonValue | null;
        }[];
        categories: ({
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            categoryId: string;
        })[];
        brands: ({
            brand: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                logoUrl: string | null;
                websiteUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            brandId: string;
        })[];
        coupons: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            promotionId: string;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        code: string | null;
        promotionType: import(".prisma/client").$Enums.PromotionType;
        startsAt: Date | null;
        endsAt: Date | null;
        priority: number;
        stackable: boolean;
        minimumOrderAmount: Prisma.Decimal;
        discountValue: Prisma.Decimal;
        maximumDiscountAmount: Prisma.Decimal | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }) | null>;
    static updatePromotion(id: string, data: {
        name?: string;
        code?: string | null;
        description?: string | null;
        promotionType?: PromotionType;
        status?: PromotionStatus;
        startsAt?: Date | null;
        endsAt?: Date | null;
        priority?: number;
        stackable?: boolean;
        minimumOrderAmount?: number | string;
        discountValue?: number | string;
        maximumDiscountAmount?: number | string | null;
        usageLimit?: number | null;
        perCustomerLimit?: number | null;
        productIds?: string[];
        categoryIds?: string[];
        brandIds?: string[];
        rules?: {
            ruleType: string;
            ruleValue?: any;
        }[];
    }): Promise<({
        products: ({
            product: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                sku: string;
                shortDescription: string | null;
                brandId: string;
                categoryId: string;
                barcode: string | null;
                warrantyText: string | null;
                weightGrams: number | null;
                lengthMm: number | null;
                widthMm: number | null;
                heightMm: number | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            promotionId: string;
        })[];
        rules: {
            id: string;
            createdAt: Date;
            promotionId: string;
            ruleType: string;
            ruleValue: Prisma.JsonValue | null;
        }[];
        categories: ({
            category: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                parentId: string | null;
                imageUrl: string | null;
                sortOrder: number;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            categoryId: string;
        })[];
        brands: ({
            brand: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                slug: string;
                logoUrl: string | null;
                websiteUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            brandId: string;
        })[];
        coupons: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            promotionId: string;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        code: string | null;
        promotionType: import(".prisma/client").$Enums.PromotionType;
        startsAt: Date | null;
        endsAt: Date | null;
        priority: number;
        stackable: boolean;
        minimumOrderAmount: Prisma.Decimal;
        discountValue: Prisma.Decimal;
        maximumDiscountAmount: Prisma.Decimal | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }) | null>;
    static deletePromotion(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        code: string | null;
        promotionType: import(".prisma/client").$Enums.PromotionType;
        startsAt: Date | null;
        endsAt: Date | null;
        priority: number;
        stackable: boolean;
        minimumOrderAmount: Prisma.Decimal;
        discountValue: Prisma.Decimal;
        maximumDiscountAmount: Prisma.Decimal | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    /**
     * Coupons CRUD & Validation
     */
    static listCoupons(params: CouponQueryParams): Promise<{
        data: ({
            promotion: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                status: import(".prisma/client").$Enums.PromotionStatus;
                code: string | null;
                promotionType: import(".prisma/client").$Enums.PromotionType;
                startsAt: Date | null;
                endsAt: Date | null;
                priority: number;
                stackable: boolean;
                minimumOrderAmount: Prisma.Decimal;
                discountValue: Prisma.Decimal;
                maximumDiscountAmount: Prisma.Decimal | null;
                usageLimit: number | null;
                usageCount: number;
                perCustomerLimit: number | null;
            };
            _count: {
                redemptions: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            promotionId: string;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static findCouponByCode(code: string): Promise<({
        promotion: {
            products: {
                id: string;
                createdAt: Date;
                productId: string;
                promotionId: string;
            }[];
            rules: {
                id: string;
                createdAt: Date;
                promotionId: string;
                ruleType: string;
                ruleValue: Prisma.JsonValue | null;
            }[];
            categories: {
                id: string;
                createdAt: Date;
                promotionId: string;
                categoryId: string;
            }[];
            brands: {
                id: string;
                createdAt: Date;
                promotionId: string;
                brandId: string;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            code: string | null;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            startsAt: Date | null;
            endsAt: Date | null;
            priority: number;
            stackable: boolean;
            minimumOrderAmount: Prisma.Decimal;
            discountValue: Prisma.Decimal;
            maximumDiscountAmount: Prisma.Decimal | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        promotionId: string;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }) | null>;
    static findCouponById(id: string): Promise<({
        promotion: {
            products: {
                id: string;
                createdAt: Date;
                productId: string;
                promotionId: string;
            }[];
            rules: {
                id: string;
                createdAt: Date;
                promotionId: string;
                ruleType: string;
                ruleValue: Prisma.JsonValue | null;
            }[];
            categories: {
                id: string;
                createdAt: Date;
                promotionId: string;
                categoryId: string;
            }[];
            brands: {
                id: string;
                createdAt: Date;
                promotionId: string;
                brandId: string;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            code: string | null;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            startsAt: Date | null;
            endsAt: Date | null;
            priority: number;
            stackable: boolean;
            minimumOrderAmount: Prisma.Decimal;
            discountValue: Prisma.Decimal;
            maximumDiscountAmount: Prisma.Decimal | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        promotionId: string;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }) | null>;
    static createCoupon(data: {
        code: string;
        promotionId: string;
        usageLimit?: number | null;
        perCustomerLimit?: number | null;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isActive?: boolean;
    }): Promise<{
        promotion: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            code: string | null;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            startsAt: Date | null;
            endsAt: Date | null;
            priority: number;
            stackable: boolean;
            minimumOrderAmount: Prisma.Decimal;
            discountValue: Prisma.Decimal;
            maximumDiscountAmount: Prisma.Decimal | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        promotionId: string;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    static updateCoupon(id: string, data: {
        code?: string;
        usageLimit?: number | null;
        perCustomerLimit?: number | null;
        startsAt?: Date | null;
        endsAt?: Date | null;
        isActive?: boolean;
    }): Promise<{
        promotion: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            code: string | null;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            startsAt: Date | null;
            endsAt: Date | null;
            priority: number;
            stackable: boolean;
            minimumOrderAmount: Prisma.Decimal;
            discountValue: Prisma.Decimal;
            maximumDiscountAmount: Prisma.Decimal | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        promotionId: string;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    static deleteCoupon(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        promotionId: string;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    static countCustomerCouponRedemptions(couponId: string, customerId: string): Promise<number>;
    static listPromotionRedemptions(promotionId: string, limit?: number, skip?: number): Promise<({
        order: {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            grandTotal: Prisma.Decimal;
            orderNumber: string;
        };
        coupon: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            promotionId: string;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            usageLimit: number | null;
            usageCount: number;
            perCustomerLimit: number | null;
        };
        customer: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string | null;
            notes: string | null;
            customerType: import(".prisma/client").$Enums.CustomerType;
            companyName: string | null;
            taxId: string | null;
            isVerified: boolean;
        }) | null;
    } & {
        id: string;
        orderId: string;
        customerId: string | null;
        promotionId: string | null;
        couponId: string;
        discountAmount: Prisma.Decimal;
        redeemedAt: Date;
    })[]>;
}
