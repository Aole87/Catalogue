import { Prisma, InventoryMovementType, ReservationStatus } from '@car-parts/database';
export interface InventoryQueryParams {
    q?: string;
    productId?: string;
    warehouseId?: string;
    locationId?: string;
    lowStock?: boolean;
    stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    page?: number;
    limit?: number;
    sortBy?: 'productName' | 'sku' | 'onHand' | 'reserved' | 'available' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}
export interface MovementQueryParams {
    productId?: string;
    warehouseId?: string;
    movementType?: InventoryMovementType;
    referenceType?: string;
    referenceId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
}
export declare class InventoryRepository {
    /**
     * Queries inventory items with multi-attribute search, warehouse filtering, low-stock thresholding, and pagination.
     */
    static findInventoryItems(params?: InventoryQueryParams): Promise<{
        items: {
            id: string;
            warehouseId: string;
            productId: string;
            locationId: string | null;
            onHand: number;
            reserved: number;
            available: number;
            safetyStock: number;
            reorderPoint: number;
            reorderQuantity: number | null;
            isLowStock: boolean;
            stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
            createdAt: Date;
            updatedAt: Date;
            product: {
                id: string;
                sku: string;
                name: string;
                brand: string;
                category: string;
                primaryImage: string;
                prices: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    currency: string;
                    tier: import(".prisma/client").$Enums.PriceTier;
                    price: Prisma.Decimal;
                    compareAtPrice: Prisma.Decimal | null;
                    costPrice: Prisma.Decimal | null;
                    validFrom: Date | null;
                    validTo: Date | null;
                }[];
            };
            warehouse: {
                id: string;
                code: string;
                name: string;
                isActive: boolean;
            };
            location: {
                id: string;
                code: string;
                name: string;
                zone: string | null;
                rack: string | null;
                shelf: string | null;
                bin: string | null;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Retrieves an inventory item for a specific product and warehouse.
     */
    static findByProductAndWarehouse(productId: string, warehouseId: string, tx?: Prisma.TransactionClient): Promise<({
        location: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        } | null;
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
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
    }) | null>;
    /**
     * Retrieves all warehouse inventory items for a product.
     */
    static findByProductId(productId: string, tx?: Prisma.TransactionClient): Promise<({
        location: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        } | null;
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
    })[]>;
    /**
     * Retrieves an inventory item by primary UUID.
     */
    static findById(id: string, tx?: Prisma.TransactionClient): Promise<({
        location: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        } | null;
        product: {
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
            prices: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                currency: string;
                tier: import(".prisma/client").$Enums.PriceTier;
                price: Prisma.Decimal;
                compareAtPrice: Prisma.Decimal | null;
                costPrice: Prisma.Decimal | null;
                validFrom: Date | null;
                validTo: Date | null;
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
        };
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
    }) | null>;
    /**
     * Performs a PostgreSQL row-level lock (SELECT ... FOR UPDATE) on the inventory item inside a transaction.
     */
    static findWithLock(productId: string, warehouseId: string, tx: Prisma.TransactionClient): Promise<{
        id: string;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    /**
     * Upserts an inventory item.
     */
    static upsertInventoryItem(data: {
        warehouseId: string;
        productId: string;
        locationId?: string | null;
        onHand?: number;
        reserved?: number;
        safetyStock?: number;
        reorderPoint?: number;
        reorderQuantity?: number;
    }, tx?: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
    }>;
    /**
     * Updates quantities of an inventory item within a transaction.
     */
    static updateQuantities(id: string, data: {
        onHand?: number;
        reserved?: number;
        locationId?: string | null;
    }, tx: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        safetyStock: number;
        reorderPoint: number | null;
        reorderQuantity: number | null;
    }>;
    static createReservation(data: {
        orderId?: string | null;
        productId: string;
        warehouseId: string;
        locationId?: string | null;
        quantity: number;
        status?: ReservationStatus;
        referenceType?: string | null;
        referenceId?: string | null;
        notes?: string | null;
        expiresAt?: Date | null;
    }, tx: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        orderId: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ReservationStatus;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        quantity: number;
        referenceType: string | null;
        referenceId: string | null;
        committedAt: Date | null;
        releasedAt: Date | null;
    }>;
    static findReservationById(id: string, tx?: Prisma.TransactionClient): Promise<({
        location: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        } | null;
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
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
        order: {
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        orderId: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ReservationStatus;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        quantity: number;
        referenceType: string | null;
        referenceId: string | null;
        committedAt: Date | null;
        releasedAt: Date | null;
    }) | null>;
    static findActiveReservationByReference(referenceType: string, referenceId: string, productId: string, tx?: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        orderId: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ReservationStatus;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        quantity: number;
        referenceType: string | null;
        referenceId: string | null;
        committedAt: Date | null;
        releasedAt: Date | null;
    } | null>;
    static findReservationsByOrderId(orderId: string, tx?: Prisma.TransactionClient): Promise<({
        location: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        } | null;
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
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        orderId: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ReservationStatus;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        quantity: number;
        referenceType: string | null;
        referenceId: string | null;
        committedAt: Date | null;
        releasedAt: Date | null;
    })[]>;
    static updateReservation(id: string, data: {
        status?: ReservationStatus;
        committedAt?: Date | null;
        releasedAt?: Date | null;
        notes?: string | null;
    }, tx: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        orderId: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ReservationStatus;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        quantity: number;
        referenceType: string | null;
        referenceId: string | null;
        committedAt: Date | null;
        releasedAt: Date | null;
    }>;
    static createMovement(data: {
        warehouseId: string;
        productId: string;
        locationId?: string | null;
        movementType: InventoryMovementType;
        quantity: number;
        beforeOnHand?: number | null;
        afterOnHand?: number | null;
        beforeReserved?: number | null;
        afterReserved?: number | null;
        referenceType?: string | null;
        referenceId?: string | null;
        performedByUserId?: string | null;
        notes?: string | null;
    }, tx: Prisma.TransactionClient): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        movementType: import(".prisma/client").$Enums.InventoryMovementType;
        quantity: number;
        beforeOnHand: number | null;
        afterOnHand: number | null;
        beforeReserved: number | null;
        afterReserved: number | null;
        referenceType: string | null;
        referenceId: string | null;
        performedByUserId: string | null;
    }>;
    static findMovements(params?: MovementQueryParams): Promise<{
        movements: ({
            location: {
                name: string;
                id: string;
                code: string;
                zone: string | null;
                rack: string | null;
                shelf: string | null;
                bin: string | null;
            } | null;
            product: {
                name: string;
                id: string;
                sku: string;
                barcode: string | null;
            };
            warehouse: {
                name: string;
                id: string;
                code: string;
            };
            performedByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            warehouseId: string;
            productId: string;
            locationId: string | null;
            movementType: import(".prisma/client").$Enums.InventoryMovementType;
            quantity: number;
            beforeOnHand: number | null;
            afterOnHand: number | null;
            beforeReserved: number | null;
            afterReserved: number | null;
            referenceType: string | null;
            referenceId: string | null;
            performedByUserId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getDashboardMetrics(): Promise<{
        totalSkus: number;
        totalInventoryRecords: number;
        activeWarehouses: number;
        totalOnHand: number;
        totalReserved: number;
        totalAvailable: number;
        lowStockItems: number;
        outOfStockItems: number;
    }>;
}
