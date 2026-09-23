import { Prisma } from '@car-parts/database';
import { InventoryQueryParams, MovementQueryParams } from '../repositories/inventory.repository';
export interface ReserveStockInput {
    orderId?: string | null;
    productId: string;
    warehouseId?: string;
    quantity: number;
    referenceType?: string | null;
    referenceId?: string | null;
    notes?: string | null;
    expiresAt?: Date | null;
}
export interface AdjustStockInput {
    warehouseId: string;
    productId: string;
    locationId?: string | null;
    direction: 'INCREASE' | 'DECREASE' | 'SET';
    quantity: number;
    reason: string;
    notes?: string | null;
}
export interface TransferStockInput {
    sourceWarehouseId: string;
    targetWarehouseId: string;
    sourceLocationId?: string | null;
    targetLocationId?: string | null;
    productId: string;
    quantity: number;
    reason: string;
    notes?: string | null;
}
export interface ReturnDispositionInput {
    orderId?: string | null;
    productId: string;
    warehouseId: string;
    locationId?: string | null;
    quantity: number;
    disposition: 'RESTOCK' | 'DAMAGED' | 'QUARANTINE' | 'SCRAP';
    notes?: string | null;
}
export interface ReceiveStockInput {
    productId: string;
    warehouseId: string;
    locationId?: string | null;
    quantity: number;
    unitCost?: number | string | Prisma.Decimal;
    referenceType?: string;
    referenceId?: string;
    notes?: string | null;
    actorId?: string;
}
export declare class InventoryService {
    /**
     * Retrieves inventory items with search, warehouse filtering, and pagination.
     */
    static getInventory(params?: InventoryQueryParams): Promise<{
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
     * Retrieves single inventory item by ID.
     */
    static getInventoryById(id: string): Promise<{
        available: number;
        safetyStock: number;
        reorderPoint: number;
        isLowStock: boolean;
        stockStatus: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        warehouseId: string;
        productId: string;
        locationId: string | null;
        onHand: number;
        reserved: number;
        reorderQuantity: number | null;
    }>;
    /**
     * Calculates server-authoritative product availability across all or specific warehouse.
     */
    static getProductAvailability(productId: string, warehouseId?: string): Promise<{
        productId: string;
        totalOnHand: number;
        totalReserved: number;
        totalAvailable: number;
        isAvailable: boolean;
        warehouses: {
            warehouseId: string;
            warehouseCode: string;
            warehouseName: string;
            location: {
                id: string;
                code: string;
                name: string;
            } | null;
            onHand: number;
            reserved: number;
            available: number;
            isAvailable: boolean;
        }[];
    }>;
    /**
     * Reserves stock atomically with row-level locking (Anti-overselling concurrency protection).
     */
    static reserveStock(input: ReserveStockInput, actorId?: string): Promise<{
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
    /**
     * Releases an active stock reservation back to available stock.
     */
    static releaseReservation(reservationId: string, actorId?: string, reason?: string, callerUser?: {
        id: string;
        role?: string;
    }): Promise<{
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
    /**
     * Commits an active reservation by deducting on-hand and reserved quantities (Fulfillment consumption).
     */
    static commitReservation(reservationId: string, actorId?: string, notes?: string, targetOrderId?: string, callerUser?: {
        id: string;
        role?: string;
    }): Promise<{
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
    /**
     * Sweeps and expires all active reservations that have exceeded their expiresAt timestamp.
     * Restores the reserved quantity back to available pool.
     */
    static expireStaleReservations(actorId?: string): Promise<{
        expiredCount: number;
        reservationIds: string[];
    }>;
    /**
     * Executes a controlled stock adjustment with mandatory reason and append-only ledger entry.
     */
    static adjustStock(input: AdjustStockInput, actorId: string): Promise<{
        item: {
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
        };
        movement: {
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
        };
        beforeOnHand: number;
        afterOnHand: number;
        available: number;
    }>;
    /**
     * Transfers stock between warehouses or locations atomically.
     */
    static transferStock(input: TransferStockInput, actorId: string): Promise<{
        reference: string;
        transferReferenceId: string;
        source: {
            warehouseId: string;
            beforeOnHand: number;
            afterOnHand: number;
        };
        target: {
            warehouseId: string;
            beforeOnHand: number;
            afterOnHand: number;
        };
        quantity: number;
    }>;
    /**
     * Handles return inventory inspection and explicit disposition (Restock vs Damaged/Quarantine).
     */
    static handleReturnDisposition(input: ReturnDispositionInput, actorId: string): Promise<{
        status: string;
        onHand: number;
        quantity: number;
    }>;
    /**
     * Receives incoming stock from Purchase Order (Phase M11 integration).
     * M10 remains the sole authority for physical inventory quantities and movements.
     */
    static receiveStock(input: ReceiveStockInput, txClient?: Prisma.TransactionClient, actorId?: string): Promise<{
        item: {
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
        };
        movement: {
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
        };
        beforeOnHand: number;
        afterOnHand: number;
        available: number;
    }>;
    /**
     * Retrieves stock movements ledger with filtering and pagination.
     */
    static getMovements(params?: MovementQueryParams): Promise<{
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
    /**
     * Retrieves aggregate inventory KPIs for dashboard.
     */
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
