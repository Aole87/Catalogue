import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
export interface CreateOrderParams {
    orderNumber: string;
    customerId?: string | null;
    userId?: string | null;
    currency?: string;
    subtotal: string;
    discountTotal: string;
    shippingTotal: string;
    taxTotal: string;
    grandTotal: string;
    customerNotes?: string | null;
    adminNotes?: string | null;
    paymentMethod?: string;
    promotionId?: string | null;
    couponCode?: string | null;
    loyaltyPointsRedeemed?: number;
    loyaltyPointsEarned?: number;
    promotionSnapshot?: any;
    items: {
        productId: string;
        sku: string;
        productName: string;
        unitPrice: string;
        quantity: number;
        discountTotal: string;
        taxTotal: string;
        lineTotal: string;
        productSnapshot: any;
    }[];
}
export interface AdminOrderQueryParams {
    q?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    shipmentStatus?: string;
    dateFrom?: Date;
    dateTo?: Date;
    customerId?: string;
    sortBy?: 'createdAt' | 'orderNumber' | 'grandTotal' | 'totalAmount' | 'status';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export interface CustomerOrderQueryParams {
    status?: OrderStatus;
    q?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
}
export declare class OrderRepository {
    private static orderIncludes;
    /**
     * Atomically creates an Order, OrderItems, initial OrderStatusHistory, and Payment draft.
     */
    static createOrder(params: CreateOrderParams, clientTx?: Prisma.TransactionClient): Promise<{
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }>;
    /**
     * Finds an order by its UUID ID.
     */
    static findById(id: string): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Finds an order by human-readable orderNumber (e.g. ORD-20260908-XXXX).
     */
    static findByOrderNumber(orderNumber: string): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Retrieves orders for a specific customer with optional filters and pagination.
     */
    static findByCustomerId(customerId: string, params?: CustomerOrderQueryParams): Promise<{
        orders: ({
            couponRedemptions: ({
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
            } & {
                id: string;
                orderId: string;
                customerId: string | null;
                promotionId: string | null;
                couponId: string;
                discountAmount: Prisma.Decimal;
                redeemedAt: Date;
            })[];
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
                addresses: {
                    id: string;
                    phone: string;
                    createdAt: Date;
                    updatedAt: Date;
                    customerId: string;
                    label: string;
                    recipientName: string;
                    addressLine1: string;
                    addressLine2: string | null;
                    subdistrict: string;
                    district: string;
                    province: string;
                    postalCode: string;
                    country: string;
                    isDefault: boolean;
                }[];
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
            items: ({
                product: ({
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
                    images: {
                        url: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        productId: string;
                        sortOrder: number;
                        altText: string | null;
                        isPrimary: boolean;
                    }[];
                } & {
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
                }) | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                productId: string | null;
                quantity: number;
                discountTotal: Prisma.Decimal;
                taxTotal: Prisma.Decimal;
                sku: string;
                productName: string;
                unitPrice: Prisma.Decimal;
                lineTotal: Prisma.Decimal;
                productSnapshot: Prisma.JsonValue | null;
            })[];
            statusHistory: ({
                changedByUser: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                orderId: string;
                fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
                toStatus: import(".prisma/client").$Enums.OrderStatus;
                note: string | null;
                changedByUserId: string | null;
            })[];
            payments: ({
                events: {
                    id: string;
                    createdAt: Date;
                    fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                    toStatus: import(".prisma/client").$Enums.PaymentStatus;
                    paymentId: string;
                    eventType: string;
                    reason: string | null;
                    payload: Prisma.JsonValue | null;
                    actorId: string | null;
                }[];
                refunds: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    paymentId: string;
                    status: string;
                    reason: string;
                    currency: string;
                    amount: Prisma.Decimal;
                    refundReference: string;
                }[];
                slips: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    paymentId: string;
                    slipUrl: string;
                    bankName: string | null;
                    transferAmount: Prisma.Decimal | null;
                    transferredAt: Date | null;
                    notes: string | null;
                    status: string;
                    verifiedByUserId: string | null;
                    verifiedAt: Date | null;
                    rejectionReason: string | null;
                }[];
            } & {
                method: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                metadata: Prisma.JsonValue | null;
                currency: string;
                idempotencyKey: string | null;
                internalReference: string;
                provider: string;
                amount: Prisma.Decimal;
                providerReference: string | null;
                paidAt: Date | null;
            })[];
            shipments: ({
                shippingMethod: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    carrier: string | null;
                    basePrice: Prisma.Decimal;
                    estimatedMinDays: number;
                    estimatedMaxDays: number;
                } | null;
                events: {
                    location: string | null;
                    description: string;
                    id: string;
                    status: import(".prisma/client").$Enums.ShipmentStatus;
                    actorId: string | null;
                    shipmentId: string;
                    providerEventId: string | null;
                    occurredAt: Date;
                    receivedAt: Date;
                    metadata: Prisma.JsonValue | null;
                }[];
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                metadata: Prisma.JsonValue | null;
                currency: string;
                shippingCost: Prisma.Decimal;
                recipientName: string | null;
                addressLine1: string | null;
                addressLine2: string | null;
                subdistrict: string | null;
                district: string | null;
                province: string | null;
                postalCode: string | null;
                country: string;
                shipmentNumber: string;
                shippingMethodId: string | null;
                trackingNumber: string | null;
                carrier: string | null;
                serviceLevel: string | null;
                addressSnapshot: Prisma.JsonValue | null;
                estimatedDelivery: Date | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
            })[];
            loyaltyTransactions: {
                id: string;
                createdAt: Date;
                orderId: string | null;
                reason: string | null;
                referenceId: string | null;
                createdByUserId: string | null;
                accountId: string;
                transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
                points: number;
                balanceAfter: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Staff/Admin query with multi-field search, status filters, date ranges, whitelist sorting, and pagination.
     */
    static findAdminOrders(params?: AdminOrderQueryParams): Promise<{
        orders: ({
            couponRedemptions: ({
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
            } & {
                id: string;
                orderId: string;
                customerId: string | null;
                promotionId: string | null;
                couponId: string;
                discountAmount: Prisma.Decimal;
                redeemedAt: Date;
            })[];
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
                addresses: {
                    id: string;
                    phone: string;
                    createdAt: Date;
                    updatedAt: Date;
                    customerId: string;
                    label: string;
                    recipientName: string;
                    addressLine1: string;
                    addressLine2: string | null;
                    subdistrict: string;
                    district: string;
                    province: string;
                    postalCode: string;
                    country: string;
                    isDefault: boolean;
                }[];
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
            items: ({
                product: ({
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
                    images: {
                        url: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        productId: string;
                        sortOrder: number;
                        altText: string | null;
                        isPrimary: boolean;
                    }[];
                } & {
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
                }) | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                productId: string | null;
                quantity: number;
                discountTotal: Prisma.Decimal;
                taxTotal: Prisma.Decimal;
                sku: string;
                productName: string;
                unitPrice: Prisma.Decimal;
                lineTotal: Prisma.Decimal;
                productSnapshot: Prisma.JsonValue | null;
            })[];
            statusHistory: ({
                changedByUser: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                orderId: string;
                fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
                toStatus: import(".prisma/client").$Enums.OrderStatus;
                note: string | null;
                changedByUserId: string | null;
            })[];
            payments: ({
                events: {
                    id: string;
                    createdAt: Date;
                    fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                    toStatus: import(".prisma/client").$Enums.PaymentStatus;
                    paymentId: string;
                    eventType: string;
                    reason: string | null;
                    payload: Prisma.JsonValue | null;
                    actorId: string | null;
                }[];
                refunds: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    paymentId: string;
                    status: string;
                    reason: string;
                    currency: string;
                    amount: Prisma.Decimal;
                    refundReference: string;
                }[];
                slips: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    paymentId: string;
                    slipUrl: string;
                    bankName: string | null;
                    transferAmount: Prisma.Decimal | null;
                    transferredAt: Date | null;
                    notes: string | null;
                    status: string;
                    verifiedByUserId: string | null;
                    verifiedAt: Date | null;
                    rejectionReason: string | null;
                }[];
            } & {
                method: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                metadata: Prisma.JsonValue | null;
                currency: string;
                idempotencyKey: string | null;
                internalReference: string;
                provider: string;
                amount: Prisma.Decimal;
                providerReference: string | null;
                paidAt: Date | null;
            })[];
            shipments: ({
                shippingMethod: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    code: string;
                    carrier: string | null;
                    basePrice: Prisma.Decimal;
                    estimatedMinDays: number;
                    estimatedMaxDays: number;
                } | null;
                events: {
                    location: string | null;
                    description: string;
                    id: string;
                    status: import(".prisma/client").$Enums.ShipmentStatus;
                    actorId: string | null;
                    shipmentId: string;
                    providerEventId: string | null;
                    occurredAt: Date;
                    receivedAt: Date;
                    metadata: Prisma.JsonValue | null;
                }[];
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                metadata: Prisma.JsonValue | null;
                currency: string;
                shippingCost: Prisma.Decimal;
                recipientName: string | null;
                addressLine1: string | null;
                addressLine2: string | null;
                subdistrict: string | null;
                district: string | null;
                province: string | null;
                postalCode: string | null;
                country: string;
                shipmentNumber: string;
                shippingMethodId: string | null;
                trackingNumber: string | null;
                carrier: string | null;
                serviceLevel: string | null;
                addressSnapshot: Prisma.JsonValue | null;
                estimatedDelivery: Date | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
            })[];
            loyaltyTransactions: {
                id: string;
                createdAt: Date;
                orderId: string | null;
                reason: string | null;
                referenceId: string | null;
                createdByUserId: string | null;
                accountId: string;
                transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
                points: number;
                balanceAfter: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Atomically updates order status through state machine validation and writes status history.
     */
    static updateOrderStatus(params: {
        orderId: string;
        toStatus: OrderStatus;
        note?: string;
        actorId?: string | null;
    }): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Atomically cancels an order with reason and history.
     */
    static cancelOrder(params: {
        orderId: string;
        reason: string;
        actorId?: string | null;
        isCustomerAction?: boolean;
    }): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Atomically requests a return for a delivered order.
     */
    static requestReturn(params: {
        orderId: string;
        reason: string;
        actorId?: string | null;
    }): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Handles staff return approval or rejection.
     */
    static handleReturnAction(params: {
        orderId: string;
        action: 'APPROVE' | 'REJECT';
        note?: string;
        actorId?: string | null;
    }): Promise<({
        couponRedemptions: ({
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
        } & {
            id: string;
            orderId: string;
            customerId: string | null;
            promotionId: string | null;
            couponId: string;
            discountAmount: Prisma.Decimal;
            redeemedAt: Date;
        })[];
        customer: ({
            user: {
                passwordHash: string;
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
                emailVerifiedAt: Date | null;
                phoneVerifiedAt: Date | null;
                lastLoginAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            } | null;
            addresses: {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                label: string;
                recipientName: string;
                addressLine1: string;
                addressLine2: string | null;
                subdistrict: string;
                district: string;
                province: string;
                postalCode: string;
                country: string;
                isDefault: boolean;
            }[];
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
        items: ({
            product: ({
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
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    sortOrder: number;
                    altText: string | null;
                    isPrimary: boolean;
                }[];
            } & {
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
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            productId: string | null;
            quantity: number;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            sku: string;
            productName: string;
            unitPrice: Prisma.Decimal;
            lineTotal: Prisma.Decimal;
            productSnapshot: Prisma.JsonValue | null;
        })[];
        statusHistory: ({
            changedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string;
            fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
            toStatus: import(".prisma/client").$Enums.OrderStatus;
            note: string | null;
            changedByUserId: string | null;
        })[];
        payments: ({
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        })[];
        shipments: ({
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        loyaltyTransactions: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        subtotal: Prisma.Decimal;
        discountTotal: Prisma.Decimal;
        taxTotal: Prisma.Decimal;
        grandTotal: Prisma.Decimal;
        customerId: string | null;
        orderNumber: string;
        shippingTotal: Prisma.Decimal;
        promotionId: string | null;
        couponCode: string | null;
        loyaltyPointsRedeemed: number;
        loyaltyPointsEarned: number;
        promotionSnapshot: Prisma.JsonValue | null;
        customerNotes: string | null;
        adminNotes: string | null;
    }) | null>;
    /**
     * Counts total orders.
     */
    static countOrders(): Promise<number>;
}
