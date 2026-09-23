"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const database_1 = require("@car-parts/database");
class InventoryRepository {
    /**
     * Queries inventory items with multi-attribute search, warehouse filtering, low-stock thresholding, and pagination.
     */
    static async findInventoryItems(params = {}) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            product: {
                deletedAt: null,
            },
            warehouse: {
                deletedAt: null,
            },
        };
        if (params.warehouseId) {
            where.warehouseId = params.warehouseId;
        }
        if (params.locationId) {
            where.locationId = params.locationId;
        }
        if (params.productId) {
            where.productId = params.productId;
        }
        if (params.q) {
            const query = params.q.trim();
            where.product = {
                deletedAt: null,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                    { barcode: { contains: query, mode: 'insensitive' } },
                    { brand: { name: { contains: query, mode: 'insensitive' } } },
                ],
            };
        }
        const [items, total] = await Promise.all([
            database_1.prisma.inventoryItem.findMany({
                where,
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true,
                            prices: true,
                            images: {
                                where: { isPrimary: true },
                                take: 1,
                            },
                        },
                    },
                    warehouse: true,
                    location: true,
                },
                orderBy: { updatedAt: 'desc' },
            }),
            database_1.prisma.inventoryItem.count({ where }),
        ]);
        // Format and calculate server-authoritative fields (available, isLowStock, stockStatus)
        let processedItems = items.map((item) => {
            const onHand = item.onHand;
            const reserved = item.reserved;
            const available = Math.max(0, onHand - reserved);
            const reorderPoint = item.reorderPoint ?? 10;
            const safetyStock = item.safetyStock ?? 5;
            const isLowStock = available <= reorderPoint;
            let status = 'IN_STOCK';
            if (available === 0) {
                status = 'OUT_OF_STOCK';
            }
            else if (isLowStock) {
                status = 'LOW_STOCK';
            }
            return {
                id: item.id,
                warehouseId: item.warehouseId,
                productId: item.productId,
                locationId: item.locationId,
                onHand,
                reserved,
                available,
                safetyStock,
                reorderPoint,
                reorderQuantity: item.reorderQuantity,
                isLowStock,
                stockStatus: status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                product: {
                    id: item.product.id,
                    sku: item.product.sku,
                    name: item.product.name,
                    brand: item.product.brand?.name,
                    category: item.product.category?.name,
                    primaryImage: item.product.images[0]?.url,
                    prices: item.product.prices,
                },
                warehouse: {
                    id: item.warehouse.id,
                    code: item.warehouse.code,
                    name: item.warehouse.name,
                    isActive: item.warehouse.isActive,
                },
                location: item.location
                    ? {
                        id: item.location.id,
                        code: item.location.code,
                        name: item.location.name,
                        zone: item.location.zone,
                        rack: item.location.rack,
                        shelf: item.location.shelf,
                        bin: item.location.bin,
                    }
                    : null,
            };
        });
        // Apply computed filters
        if (params.lowStock) {
            processedItems = processedItems.filter((i) => i.isLowStock);
        }
        if (params.stockStatus) {
            processedItems = processedItems.filter((i) => i.stockStatus === params.stockStatus);
        }
        // Apply sorting
        if (params.sortBy) {
            const order = params.sortOrder === 'asc' ? 1 : -1;
            processedItems.sort((a, b) => {
                if (params.sortBy === 'productName')
                    return order * a.product.name.localeCompare(b.product.name);
                if (params.sortBy === 'sku')
                    return order * a.product.sku.localeCompare(b.product.sku);
                if (params.sortBy === 'onHand')
                    return order * (a.onHand - b.onHand);
                if (params.sortBy === 'reserved')
                    return order * (a.reserved - b.reserved);
                if (params.sortBy === 'available')
                    return order * (a.available - b.available);
                return order * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
            });
        }
        const paginatedItems = processedItems.slice(skip, skip + limit);
        return {
            items: paginatedItems,
            pagination: {
                page,
                limit,
                total: processedItems.length,
                totalPages: Math.ceil(processedItems.length / limit),
            },
        };
    }
    /**
     * Retrieves an inventory item for a specific product and warehouse.
     */
    static async findByProductAndWarehouse(productId, warehouseId, tx) {
        const client = tx || database_1.prisma;
        return client.inventoryItem.findUnique({
            where: {
                warehouseId_productId: { warehouseId, productId },
            },
            include: {
                product: true,
                warehouse: true,
                location: true,
            },
        });
    }
    /**
     * Retrieves all warehouse inventory items for a product.
     */
    static async findByProductId(productId, tx) {
        const client = tx || database_1.prisma;
        return client.inventoryItem.findMany({
            where: {
                productId,
                warehouse: { deletedAt: null, isActive: true },
            },
            include: {
                warehouse: true,
                location: true,
            },
            orderBy: { warehouse: { code: 'asc' } },
        });
    }
    /**
     * Retrieves an inventory item by primary UUID.
     */
    static async findById(id, tx) {
        const client = tx || database_1.prisma;
        return client.inventoryItem.findUnique({
            where: { id },
            include: {
                product: {
                    include: { brand: true, category: true, prices: true },
                },
                warehouse: true,
                location: true,
            },
        });
    }
    /**
     * Performs a PostgreSQL row-level lock (SELECT ... FOR UPDATE) on the inventory item inside a transaction.
     */
    static async findWithLock(productId, warehouseId, tx) {
        const items = await tx.$queryRaw `
      SELECT * FROM "inventory_items"
      WHERE "warehouse_id" = ${warehouseId}::uuid AND "product_id" = ${productId}::uuid
      FOR UPDATE
    `;
        if (!items || items.length === 0) {
            return null;
        }
        const item = items[0];
        return {
            id: item.id,
            warehouseId: item.warehouse_id,
            productId: item.product_id,
            locationId: item.location_id,
            onHand: item.on_hand,
            reserved: item.reserved,
            safetyStock: item.safety_stock,
            reorderPoint: item.reorder_point,
            reorderQuantity: item.reorder_quantity,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        };
    }
    /**
     * Upserts an inventory item.
     */
    static async upsertInventoryItem(data, tx) {
        const client = tx || database_1.prisma;
        return client.inventoryItem.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId: data.warehouseId,
                    productId: data.productId,
                },
            },
            update: {
                ...(data.locationId !== undefined ? { locationId: data.locationId } : {}),
                ...(data.onHand !== undefined ? { onHand: data.onHand } : {}),
                ...(data.reserved !== undefined ? { reserved: data.reserved } : {}),
                ...(data.safetyStock !== undefined ? { safetyStock: data.safetyStock } : {}),
                ...(data.reorderPoint !== undefined ? { reorderPoint: data.reorderPoint } : {}),
                ...(data.reorderQuantity !== undefined ? { reorderQuantity: data.reorderQuantity } : {}),
            },
            create: {
                warehouseId: data.warehouseId,
                productId: data.productId,
                locationId: data.locationId,
                onHand: data.onHand ?? 0,
                reserved: data.reserved ?? 0,
                safetyStock: data.safetyStock ?? 5,
                reorderPoint: data.reorderPoint ?? 10,
                reorderQuantity: data.reorderQuantity ?? 20,
            },
        });
    }
    /**
     * Updates quantities of an inventory item within a transaction.
     */
    static async updateQuantities(id, data, tx) {
        return tx.inventoryItem.update({
            where: { id },
            data: {
                ...(data.onHand !== undefined ? { onHand: data.onHand } : {}),
                ...(data.reserved !== undefined ? { reserved: data.reserved } : {}),
                ...(data.locationId !== undefined ? { locationId: data.locationId } : {}),
            },
        });
    }
    // --------------------------------------------------------------------------
    // RESERVATION LEDGER
    // --------------------------------------------------------------------------
    static async createReservation(data, tx) {
        return tx.stockReservation.create({
            data: {
                orderId: data.orderId,
                productId: data.productId,
                warehouseId: data.warehouseId,
                locationId: data.locationId,
                quantity: data.quantity,
                status: data.status ?? database_1.ReservationStatus.ACTIVE,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                notes: data.notes,
                expiresAt: data.expiresAt,
            },
        });
    }
    static async findReservationById(id, tx) {
        const client = tx || database_1.prisma;
        return client.stockReservation.findUnique({
            where: { id },
            include: {
                product: true,
                warehouse: true,
                location: true,
                order: true,
            },
        });
    }
    static async findActiveReservationByReference(referenceType, referenceId, productId, tx) {
        const client = tx || database_1.prisma;
        return client.stockReservation.findFirst({
            where: {
                referenceType,
                referenceId,
                productId,
                status: database_1.ReservationStatus.ACTIVE,
            },
        });
    }
    static async findReservationsByOrderId(orderId, tx) {
        const client = tx || database_1.prisma;
        return client.stockReservation.findMany({
            where: { orderId },
            include: {
                product: true,
                warehouse: true,
                location: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    static async updateReservation(id, data, tx) {
        return tx.stockReservation.update({
            where: { id },
            data: {
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.committedAt !== undefined ? { committedAt: data.committedAt } : {}),
                ...(data.releasedAt !== undefined ? { releasedAt: data.releasedAt } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
            },
        });
    }
    // --------------------------------------------------------------------------
    // STOCK MOVEMENT LEDGER (APPEND-ONLY)
    // --------------------------------------------------------------------------
    static async createMovement(data, tx) {
        return tx.stockMovement.create({
            data: {
                warehouseId: data.warehouseId,
                productId: data.productId,
                locationId: data.locationId,
                movementType: data.movementType,
                quantity: Math.abs(data.quantity),
                beforeOnHand: data.beforeOnHand,
                afterOnHand: data.afterOnHand,
                beforeReserved: data.beforeReserved,
                afterReserved: data.afterReserved,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                performedByUserId: data.performedByUserId,
                notes: data.notes,
            },
        });
    }
    static async findMovements(params = {}) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
        if (params.productId) {
            where.productId = params.productId;
        }
        if (params.warehouseId) {
            where.warehouseId = params.warehouseId;
        }
        if (params.movementType) {
            where.movementType = params.movementType;
        }
        if (params.referenceType) {
            where.referenceType = params.referenceType;
        }
        if (params.referenceId) {
            where.referenceId = params.referenceId;
        }
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom)
                where.createdAt.gte = params.dateFrom;
            if (params.dateTo)
                where.createdAt.lte = params.dateTo;
        }
        const [movements, total] = await Promise.all([
            database_1.prisma.stockMovement.findMany({
                where,
                include: {
                    product: {
                        select: { id: true, sku: true, name: true, barcode: true },
                    },
                    warehouse: {
                        select: { id: true, code: true, name: true },
                    },
                    location: {
                        select: { id: true, code: true, name: true, zone: true, rack: true, shelf: true, bin: true },
                    },
                    performedByUser: {
                        select: { id: true, email: true, displayName: true, firstName: true, lastName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.stockMovement.count({ where }),
        ]);
        return {
            movements,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // --------------------------------------------------------------------------
    // DASHBOARD AGGREGATE METRICS
    // --------------------------------------------------------------------------
    static async getDashboardMetrics() {
        const [warehouseCount, items] = await Promise.all([
            database_1.prisma.warehouse.count({ where: { deletedAt: null, isActive: true } }),
            database_1.prisma.inventoryItem.findMany({
                where: {
                    product: { deletedAt: null },
                    warehouse: { deletedAt: null, isActive: true },
                },
                select: {
                    productId: true,
                    onHand: true,
                    reserved: true,
                    reorderPoint: true,
                    safetyStock: true,
                },
            }),
        ]);
        const uniqueProductIds = new Set();
        let totalOnHand = 0;
        let totalReserved = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        for (const item of items) {
            uniqueProductIds.add(item.productId);
            totalOnHand += item.onHand;
            totalReserved += item.reserved;
            const available = Math.max(0, item.onHand - item.reserved);
            const threshold = item.reorderPoint ?? 10;
            if (available === 0) {
                outOfStockCount++;
            }
            else if (available <= threshold) {
                lowStockCount++;
            }
        }
        const totalAvailable = Math.max(0, totalOnHand - totalReserved);
        return {
            totalSkus: uniqueProductIds.size,
            totalInventoryRecords: items.length,
            activeWarehouses: warehouseCount,
            totalOnHand,
            totalReserved,
            totalAvailable,
            lowStockItems: lowStockCount,
            outOfStockItems: outOfStockCount,
        };
    }
}
exports.InventoryRepository = InventoryRepository;
//# sourceMappingURL=inventory.repository.js.map