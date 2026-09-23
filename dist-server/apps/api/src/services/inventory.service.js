"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("@car-parts/database");
const inventory_repository_1 = require("../repositories/inventory.repository");
const warehouse_repository_1 = require("../repositories/warehouse.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class InventoryService {
    /**
     * Retrieves inventory items with search, warehouse filtering, and pagination.
     */
    static async getInventory(params = {}) {
        return inventory_repository_1.InventoryRepository.findInventoryItems(params);
    }
    /**
     * Retrieves single inventory item by ID.
     */
    static async getInventoryById(id) {
        const item = await inventory_repository_1.InventoryRepository.findById(id);
        if (!item) {
            throw new app_error_1.NotFoundException('Inventory item not found');
        }
        const onHand = item.onHand;
        const reserved = item.reserved;
        const available = Math.max(0, onHand - reserved);
        const reorderPoint = item.reorderPoint ?? 10;
        const safetyStock = item.safetyStock ?? 5;
        const isLowStock = available <= reorderPoint;
        return {
            ...item,
            available,
            safetyStock,
            reorderPoint,
            isLowStock,
            stockStatus: available === 0 ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
        };
    }
    /**
     * Calculates server-authoritative product availability across all or specific warehouse.
     */
    static async getProductAvailability(productId, warehouseId) {
        const items = await inventory_repository_1.InventoryRepository.findByProductId(productId);
        if (!items || items.length === 0) {
            return {
                productId,
                totalOnHand: 0,
                totalReserved: 0,
                totalAvailable: 0,
                isAvailable: false,
                warehouses: [],
            };
        }
        let filtered = items;
        if (warehouseId) {
            filtered = items.filter((i) => i.warehouseId === warehouseId);
        }
        let totalOnHand = 0;
        let totalReserved = 0;
        const warehouses = filtered.map((item) => {
            const onHand = item.onHand;
            const reserved = item.reserved;
            const available = Math.max(0, onHand - reserved);
            totalOnHand += onHand;
            totalReserved += reserved;
            return {
                warehouseId: item.warehouseId,
                warehouseCode: item.warehouse.code,
                warehouseName: item.warehouse.name,
                location: item.location ? { id: item.location.id, code: item.location.code, name: item.location.name } : null,
                onHand,
                reserved,
                available,
                isAvailable: available > 0,
            };
        });
        const totalAvailable = Math.max(0, totalOnHand - totalReserved);
        return {
            productId,
            totalOnHand,
            totalReserved,
            totalAvailable,
            isAvailable: totalAvailable > 0,
            warehouses,
        };
    }
    /**
     * Reserves stock atomically with row-level locking (Anti-overselling concurrency protection).
     */
    static async reserveStock(input, actorId) {
        if (input.quantity <= 0) {
            throw new app_error_1.BadRequestException('Reservation quantity must be a positive integer');
        }
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Check idempotency: If active reservation already exists for this reference, return it
            if (input.referenceType && input.referenceId) {
                const existingReservation = await inventory_repository_1.InventoryRepository.findActiveReservationByReference(input.referenceType, input.referenceId, input.productId, tx);
                if (existingReservation) {
                    return existingReservation;
                }
            }
            // 2. Resolve warehouse
            let warehouseId = input.warehouseId;
            if (!warehouseId) {
                // Find warehouse with best available stock
                const allItems = await inventory_repository_1.InventoryRepository.findByProductId(input.productId, tx);
                const candidate = allItems.find((i) => i.onHand - i.reserved >= input.quantity);
                if (!candidate) {
                    throw new app_error_1.BadRequestException(`Insufficient available stock for product '${input.productId}'. Required: ${input.quantity}`);
                }
                warehouseId = candidate.warehouseId;
            }
            // 3. Acquire row lock on InventoryItem (SELECT ... FOR UPDATE)
            const item = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, warehouseId, tx);
            if (!item) {
                throw new app_error_1.NotFoundException(`Inventory item not found for product '${input.productId}' in warehouse '${warehouseId}'`);
            }
            const available = item.onHand - item.reserved;
            if (available < input.quantity) {
                throw new app_error_1.BadRequestException(`Cannot reserve stock: Insufficient available inventory in warehouse '${warehouseId}'. Available: ${available}, Requested: ${input.quantity}`);
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            const afterReserved = beforeReserved + input.quantity;
            // 4. Update InventoryItem reserved quantity
            await inventory_repository_1.InventoryRepository.updateQuantities(item.id, { reserved: afterReserved }, tx);
            // 5. Create StockReservation
            const reservation = await inventory_repository_1.InventoryRepository.createReservation({
                orderId: input.orderId,
                productId: input.productId,
                warehouseId,
                locationId: item.locationId,
                quantity: input.quantity,
                status: database_1.ReservationStatus.ACTIVE,
                referenceType: input.referenceType,
                referenceId: input.referenceId,
                notes: input.notes,
                expiresAt: input.expiresAt,
            }, tx);
            // 6. Record StockMovement
            await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId,
                productId: input.productId,
                locationId: item.locationId,
                movementType: database_1.InventoryMovementType.RESERVATION,
                quantity: input.quantity,
                beforeOnHand,
                afterOnHand: beforeOnHand,
                beforeReserved,
                afterReserved,
                referenceType: input.referenceType || 'RESERVATION',
                referenceId: reservation.id,
                performedByUserId: actorId,
                notes: input.notes || `Stock reserved for reference: ${input.referenceId || reservation.id}`,
            }, tx);
            // 7. AuditLog
            if (actorId) {
                await audit_repository_1.AuditRepository.record({
                    userId: actorId,
                    action: 'STOCK_RESERVED',
                    resource: 'StockReservation',
                    resourceId: reservation.id,
                    after: {
                        productId: input.productId,
                        warehouseId,
                        quantity: input.quantity,
                        newReserved: afterReserved,
                    },
                });
            }
            return reservation;
        });
    }
    /**
     * Releases an active stock reservation back to available stock.
     */
    static async releaseReservation(reservationId, actorId, reason, callerUser) {
        return database_1.prisma.$transaction(async (tx) => {
            const reservation = await inventory_repository_1.InventoryRepository.findReservationById(reservationId, tx);
            if (!reservation) {
                throw new app_error_1.NotFoundException('Stock reservation not found');
            }
            // Customer IDOR / Ownership Protection
            if (callerUser && (callerUser.role === 'CUSTOMER' || !callerUser.role)) {
                if (reservation.orderId) {
                    const order = await tx.order.findUnique({
                        where: { id: reservation.orderId },
                        include: { customer: true },
                    });
                    if (order && order.customer?.userId && order.customer.userId !== callerUser.id) {
                        throw new app_error_1.ForbiddenException('You are not authorized to release a reservation belonging to another customer');
                    }
                }
            }
            // Idempotency: If already released or cancelled, return gracefully without double mutation
            if (reservation.status === database_1.ReservationStatus.RELEASED || reservation.status === database_1.ReservationStatus.CANCELLED || reservation.status === database_1.ReservationStatus.EXPIRED) {
                return reservation;
            }
            if (reservation.status !== database_1.ReservationStatus.ACTIVE) {
                throw new app_error_1.BadRequestException(`Cannot release reservation in status '${reservation.status}'. Only ACTIVE reservations can be released.`);
            }
            // Lock inventory item
            const item = await inventory_repository_1.InventoryRepository.findWithLock(reservation.productId, reservation.warehouseId, tx);
            if (!item) {
                throw new app_error_1.NotFoundException('Inventory item not found');
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            const afterReserved = Math.max(0, beforeReserved - reservation.quantity);
            // Update reserved quantity
            await inventory_repository_1.InventoryRepository.updateQuantities(item.id, { reserved: afterReserved }, tx);
            // Update reservation status
            const updatedReservation = await inventory_repository_1.InventoryRepository.updateReservation(reservation.id, {
                status: database_1.ReservationStatus.RELEASED,
                releasedAt: new Date(),
                notes: reason ? `${reservation.notes || ''} [Released: ${reason}]`.trim() : reservation.notes,
            }, tx);
            // Record StockMovement
            await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: reservation.warehouseId,
                productId: reservation.productId,
                locationId: reservation.locationId,
                movementType: database_1.InventoryMovementType.RELEASE,
                quantity: reservation.quantity,
                beforeOnHand,
                afterOnHand: beforeOnHand,
                beforeReserved,
                afterReserved,
                referenceType: 'RESERVATION_RELEASE',
                referenceId: reservation.id,
                performedByUserId: actorId,
                notes: reason || 'Reservation released back to available pool',
            }, tx);
            // AuditLog
            if (actorId) {
                await audit_repository_1.AuditRepository.record({
                    userId: actorId,
                    action: 'STOCK_RELEASED',
                    resource: 'StockReservation',
                    resourceId: reservation.id,
                    before: { reserved: beforeReserved, status: database_1.ReservationStatus.ACTIVE },
                    after: { reserved: afterReserved, status: database_1.ReservationStatus.RELEASED, reason },
                });
            }
            return updatedReservation;
        });
    }
    /**
     * Commits an active reservation by deducting on-hand and reserved quantities (Fulfillment consumption).
     */
    static async commitReservation(reservationId, actorId, notes, targetOrderId, callerUser) {
        return database_1.prisma.$transaction(async (tx) => {
            const reservation = await inventory_repository_1.InventoryRepository.findReservationById(reservationId, tx);
            if (!reservation) {
                throw new app_error_1.NotFoundException('Stock reservation not found');
            }
            // Idempotency: If already committed, return gracefully without double deduction
            if (reservation.status === database_1.ReservationStatus.COMMITTED) {
                return reservation;
            }
            // Stale / Expired Check
            if (reservation.expiresAt && reservation.expiresAt < new Date()) {
                throw new app_error_1.BadRequestException(`Cannot commit reservation '${reservation.id}': Reservation has expired at ${reservation.expiresAt.toISOString()}`);
            }
            // Order Coupling Validation
            if (targetOrderId && reservation.orderId && reservation.orderId !== targetOrderId) {
                throw new app_error_1.BadRequestException(`Cannot commit reservation: Order mismatch. Reservation is coupled to order '${reservation.orderId}', not '${targetOrderId}'`);
            }
            // Customer Ownership Protection
            if (callerUser && (callerUser.role === 'CUSTOMER' || !callerUser.role)) {
                if (reservation.orderId) {
                    const order = await tx.order.findUnique({
                        where: { id: reservation.orderId },
                        include: { customer: true },
                    });
                    if (order && order.customer?.userId && order.customer.userId !== callerUser.id) {
                        throw new app_error_1.ForbiddenException('You are not authorized to commit a reservation belonging to another customer');
                    }
                }
            }
            if (reservation.status !== database_1.ReservationStatus.ACTIVE) {
                throw new app_error_1.BadRequestException(`Cannot commit reservation in status '${reservation.status}'. Only ACTIVE reservations can be committed.`);
            }
            // Lock inventory item
            const item = await inventory_repository_1.InventoryRepository.findWithLock(reservation.productId, reservation.warehouseId, tx);
            if (!item) {
                throw new app_error_1.NotFoundException('Inventory item not found');
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            if (beforeOnHand < reservation.quantity) {
                throw new app_error_1.BadRequestException(`Cannot commit reservation: On-hand stock (${beforeOnHand}) is less than reservation quantity (${reservation.quantity})`);
            }
            const afterOnHand = beforeOnHand - reservation.quantity;
            const afterReserved = Math.max(0, beforeReserved - reservation.quantity);
            // Deduct both onHand and reserved
            await inventory_repository_1.InventoryRepository.updateQuantities(item.id, { onHand: afterOnHand, reserved: afterReserved }, tx);
            // Update reservation status
            const updatedReservation = await inventory_repository_1.InventoryRepository.updateReservation(reservation.id, {
                status: database_1.ReservationStatus.COMMITTED,
                committedAt: new Date(),
                notes: notes ? `${reservation.notes || ''} [Committed: ${notes}]`.trim() : reservation.notes,
            }, tx);
            // Record StockMovement
            await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: reservation.warehouseId,
                productId: reservation.productId,
                locationId: reservation.locationId,
                movementType: database_1.InventoryMovementType.DEDUCTION,
                quantity: reservation.quantity,
                beforeOnHand,
                afterOnHand,
                beforeReserved,
                afterReserved,
                referenceType: reservation.referenceType || 'ORDER_FULFILLMENT',
                referenceId: reservation.referenceId || reservation.id,
                performedByUserId: actorId,
                notes: notes || 'Stock committed and deducted for order fulfillment',
            }, tx);
            // AuditLog
            if (actorId) {
                await audit_repository_1.AuditRepository.record({
                    userId: actorId,
                    action: 'STOCK_COMMITTED',
                    resource: 'StockReservation',
                    resourceId: reservation.id,
                    before: { onHand: beforeOnHand, reserved: beforeReserved, status: database_1.ReservationStatus.ACTIVE },
                    after: { onHand: afterOnHand, reserved: afterReserved, status: database_1.ReservationStatus.COMMITTED, notes },
                });
            }
            return updatedReservation;
        });
    }
    /**
     * Sweeps and expires all active reservations that have exceeded their expiresAt timestamp.
     * Restores the reserved quantity back to available pool.
     */
    static async expireStaleReservations(actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            const expiredReservations = await tx.stockReservation.findMany({
                where: {
                    status: database_1.ReservationStatus.ACTIVE,
                    expiresAt: { lte: now },
                },
            });
            const processedIds = [];
            for (const res of expiredReservations) {
                const item = await inventory_repository_1.InventoryRepository.findWithLock(res.productId, res.warehouseId, tx);
                if (item) {
                    const beforeReserved = item.reserved;
                    const afterReserved = Math.max(0, beforeReserved - res.quantity);
                    await inventory_repository_1.InventoryRepository.updateQuantities(item.id, { reserved: afterReserved }, tx);
                    await inventory_repository_1.InventoryRepository.updateReservation(res.id, {
                        status: database_1.ReservationStatus.EXPIRED,
                        releasedAt: now,
                        notes: `${res.notes || ''} [Auto-expired at ${now.toISOString()}]`.trim(),
                    }, tx);
                    await inventory_repository_1.InventoryRepository.createMovement({
                        warehouseId: res.warehouseId,
                        productId: res.productId,
                        locationId: res.locationId,
                        movementType: database_1.InventoryMovementType.RELEASE,
                        quantity: res.quantity,
                        beforeOnHand: item.onHand,
                        afterOnHand: item.onHand,
                        beforeReserved,
                        afterReserved,
                        referenceType: 'RESERVATION_EXPIRATION',
                        referenceId: res.id,
                        performedByUserId: actorId,
                        notes: 'Reservation expired and released back to available pool',
                    }, tx);
                    processedIds.push(res.id);
                }
            }
            return { expiredCount: processedIds.length, reservationIds: processedIds };
        });
    }
    /**
     * Executes a controlled stock adjustment with mandatory reason and append-only ledger entry.
     */
    static async adjustStock(input, actorId) {
        if (!input.reason || input.reason.trim().length === 0) {
            throw new app_error_1.BadRequestException('Stock adjustment reason is mandatory for audit compliance');
        }
        if (input.quantity < 0) {
            throw new app_error_1.BadRequestException('Adjustment quantity must be non-negative');
        }
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Verify warehouse
            const warehouse = await warehouse_repository_1.WarehouseRepository.findById(input.warehouseId);
            if (!warehouse || !warehouse.isActive) {
                throw new app_error_1.BadRequestException('Target warehouse is not found or inactive');
            }
            // 2. Lock inventory item
            let item = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
            if (!item) {
                // Create initial item if doesn't exist
                const created = await inventory_repository_1.InventoryRepository.upsertInventoryItem({
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    locationId: input.locationId,
                    onHand: 0,
                    reserved: 0,
                }, tx);
                item = {
                    id: created.id,
                    warehouseId: created.warehouseId,
                    productId: created.productId,
                    locationId: created.locationId,
                    onHand: 0,
                    reserved: 0,
                    safetyStock: created.safetyStock,
                    reorderPoint: created.reorderPoint,
                    reorderQuantity: created.reorderQuantity,
                    createdAt: created.createdAt,
                    updatedAt: created.updatedAt,
                };
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            let afterOnHand = beforeOnHand;
            let movementType = database_1.InventoryMovementType.ADJUSTMENT;
            if (input.direction === 'INCREASE') {
                afterOnHand = beforeOnHand + input.quantity;
                movementType = database_1.InventoryMovementType.ADJUSTMENT_IN;
            }
            else if (input.direction === 'DECREASE') {
                if (beforeOnHand < input.quantity) {
                    throw new app_error_1.BadRequestException(`Cannot decrease stock by ${input.quantity}. Current on-hand is only ${beforeOnHand}`);
                }
                if (beforeOnHand - input.quantity < beforeReserved) {
                    throw new app_error_1.BadRequestException(`Cannot decrease stock below reserved quantity (${beforeReserved}). Available on-hand after deduction must be at least ${beforeReserved}`);
                }
                afterOnHand = beforeOnHand - input.quantity;
                movementType = database_1.InventoryMovementType.ADJUSTMENT_OUT;
            }
            else if (input.direction === 'SET') {
                if (input.quantity < beforeReserved) {
                    throw new app_error_1.BadRequestException(`Cannot set on-hand stock to ${input.quantity}: Lower than current reserved stock (${beforeReserved})`);
                }
                afterOnHand = input.quantity;
                movementType =
                    afterOnHand >= beforeOnHand
                        ? database_1.InventoryMovementType.ADJUSTMENT_IN
                        : database_1.InventoryMovementType.ADJUSTMENT_OUT;
            }
            const diff = afterOnHand - beforeOnHand;
            // 3. Update InventoryItem
            const updatedItem = await inventory_repository_1.InventoryRepository.updateQuantities(item.id, {
                onHand: afterOnHand,
                locationId: input.locationId !== undefined ? input.locationId : item.locationId,
            }, tx);
            // 4. Record StockMovement
            const movement = await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: input.warehouseId,
                productId: input.productId,
                locationId: input.locationId || item.locationId,
                movementType,
                quantity: Math.abs(diff),
                beforeOnHand,
                afterOnHand,
                beforeReserved,
                afterReserved: beforeReserved,
                referenceType: 'MANUAL_ADJUSTMENT',
                referenceId: item.id,
                performedByUserId: actorId,
                notes: `${input.reason}${input.notes ? ` - ${input.notes}` : ''}`,
            }, tx);
            // 5. AuditLog
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'INVENTORY_ADJUSTED',
                resource: 'InventoryItem',
                resourceId: item.id,
                before: { onHand: beforeOnHand, reserved: beforeReserved },
                after: { onHand: afterOnHand, reserved: beforeReserved, reason: input.reason },
            });
            return {
                item: updatedItem,
                movement,
                beforeOnHand,
                afterOnHand,
                available: Math.max(0, afterOnHand - beforeReserved),
            };
        });
    }
    /**
     * Transfers stock between warehouses or locations atomically.
     */
    static async transferStock(input, actorId) {
        if (!input.reason || input.reason.trim().length === 0) {
            throw new app_error_1.BadRequestException('Transfer reason is mandatory for audit compliance');
        }
        if (input.quantity <= 0) {
            throw new app_error_1.BadRequestException('Transfer quantity must be a positive integer');
        }
        if (input.sourceWarehouseId === input.targetWarehouseId &&
            input.sourceLocationId === input.targetLocationId) {
            throw new app_error_1.BadRequestException('Source and destination warehouse/location cannot be identical');
        }
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Verify warehouses
            const [sourceWh, targetWh] = await Promise.all([
                warehouse_repository_1.WarehouseRepository.findById(input.sourceWarehouseId),
                warehouse_repository_1.WarehouseRepository.findById(input.targetWarehouseId),
            ]);
            if (!sourceWh || !sourceWh.isActive) {
                throw new app_error_1.BadRequestException('Source warehouse is not found or inactive');
            }
            if (!targetWh || !targetWh.isActive) {
                throw new app_error_1.BadRequestException('Destination warehouse is not found or inactive');
            }
            // 2. Lock source item
            const sourceItem = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, input.sourceWarehouseId, tx);
            if (!sourceItem) {
                throw new app_error_1.NotFoundException('Source inventory item not found');
            }
            const sourceAvailable = sourceItem.onHand - sourceItem.reserved;
            if (sourceAvailable < input.quantity) {
                throw new app_error_1.BadRequestException(`Cannot transfer: Insufficient available stock in source warehouse. Available: ${sourceAvailable}, Requested: ${input.quantity}`);
            }
            // 3. Lock target item
            let targetItem = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, input.targetWarehouseId, tx);
            if (!targetItem) {
                const createdTarget = await inventory_repository_1.InventoryRepository.upsertInventoryItem({
                    warehouseId: input.targetWarehouseId,
                    productId: input.productId,
                    locationId: input.targetLocationId,
                    onHand: 0,
                    reserved: 0,
                }, tx);
                targetItem = {
                    id: createdTarget.id,
                    warehouseId: createdTarget.warehouseId,
                    productId: createdTarget.productId,
                    locationId: createdTarget.locationId,
                    onHand: 0,
                    reserved: 0,
                    safetyStock: createdTarget.safetyStock,
                    reorderPoint: createdTarget.reorderPoint,
                    reorderQuantity: createdTarget.reorderQuantity,
                    createdAt: createdTarget.createdAt,
                    updatedAt: createdTarget.updatedAt,
                };
            }
            // Source deduction
            const sourceBeforeOnHand = sourceItem.onHand;
            const sourceAfterOnHand = sourceBeforeOnHand - input.quantity;
            await inventory_repository_1.InventoryRepository.updateQuantities(sourceItem.id, { onHand: sourceAfterOnHand }, tx);
            // Target increment
            const targetBeforeOnHand = targetItem.onHand;
            const targetAfterOnHand = targetBeforeOnHand + input.quantity;
            await inventory_repository_1.InventoryRepository.updateQuantities(targetItem.id, {
                onHand: targetAfterOnHand,
                locationId: input.targetLocationId !== undefined ? input.targetLocationId : targetItem.locationId,
            }, tx);
            const transferReferenceId = `TRF-${Date.now()}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
            // Source movement
            await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: input.sourceWarehouseId,
                productId: input.productId,
                locationId: input.sourceLocationId || sourceItem.locationId,
                movementType: database_1.InventoryMovementType.TRANSFER_OUT,
                quantity: input.quantity,
                beforeOnHand: sourceBeforeOnHand,
                afterOnHand: sourceAfterOnHand,
                beforeReserved: sourceItem.reserved,
                afterReserved: sourceItem.reserved,
                referenceType: 'WAREHOUSE_TRANSFER',
                referenceId: transferReferenceId,
                performedByUserId: actorId,
                notes: `Transfer to ${targetWh.name} (${targetWh.code}) - ${input.reason}`,
            }, tx);
            // Target movement
            await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: input.targetWarehouseId,
                productId: input.productId,
                locationId: input.targetLocationId || targetItem.locationId,
                movementType: database_1.InventoryMovementType.TRANSFER_IN,
                quantity: input.quantity,
                beforeOnHand: targetBeforeOnHand,
                afterOnHand: targetAfterOnHand,
                beforeReserved: targetItem.reserved,
                afterReserved: targetItem.reserved,
                referenceType: 'WAREHOUSE_TRANSFER',
                referenceId: transferReferenceId,
                performedByUserId: actorId,
                notes: `Transfer from ${sourceWh.name} (${sourceWh.code}) - ${input.reason}`,
            }, tx);
            // AuditLog
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'INVENTORY_TRANSFERRED',
                resource: 'InventoryItem',
                resourceId: sourceItem.id,
                before: { sourceOnHand: sourceBeforeOnHand, targetOnHand: targetBeforeOnHand },
                after: {
                    transferReferenceId,
                    sourceOnHand: sourceAfterOnHand,
                    targetOnHand: targetAfterOnHand,
                    quantity: input.quantity,
                    reason: input.reason,
                },
            });
            return {
                reference: transferReferenceId,
                transferReferenceId,
                source: { warehouseId: input.sourceWarehouseId, beforeOnHand: sourceBeforeOnHand, afterOnHand: sourceAfterOnHand },
                target: { warehouseId: input.targetWarehouseId, beforeOnHand: targetBeforeOnHand, afterOnHand: targetAfterOnHand },
                quantity: input.quantity,
            };
        });
    }
    /**
     * Handles return inventory inspection and explicit disposition (Restock vs Damaged/Quarantine).
     */
    static async handleReturnDisposition(input, actorId) {
        if (input.quantity <= 0) {
            throw new app_error_1.BadRequestException('Return disposition quantity must be a positive integer');
        }
        return database_1.prisma.$transaction(async (tx) => {
            const warehouse = await warehouse_repository_1.WarehouseRepository.findById(input.warehouseId);
            if (!warehouse || !warehouse.isActive) {
                throw new app_error_1.BadRequestException('Destination warehouse not found or inactive');
            }
            let item = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
            if (!item) {
                const created = await inventory_repository_1.InventoryRepository.upsertInventoryItem({
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    locationId: input.locationId,
                    onHand: 0,
                    reserved: 0,
                }, tx);
                item = {
                    id: created.id,
                    warehouseId: created.warehouseId,
                    productId: created.productId,
                    locationId: created.locationId,
                    onHand: 0,
                    reserved: 0,
                    safetyStock: created.safetyStock,
                    reorderPoint: created.reorderPoint,
                    reorderQuantity: created.reorderQuantity,
                    createdAt: created.createdAt,
                    updatedAt: created.updatedAt,
                };
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            if (input.disposition === 'RESTOCK') {
                const afterOnHand = beforeOnHand + input.quantity;
                await inventory_repository_1.InventoryRepository.updateQuantities(item.id, { onHand: afterOnHand }, tx);
                await inventory_repository_1.InventoryRepository.createMovement({
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    locationId: input.locationId || item.locationId,
                    movementType: database_1.InventoryMovementType.RETURN,
                    quantity: input.quantity,
                    beforeOnHand,
                    afterOnHand,
                    beforeReserved,
                    afterReserved: beforeReserved,
                    referenceType: 'ORDER_RETURN_RESTOCK',
                    referenceId: input.orderId || undefined,
                    performedByUserId: actorId,
                    notes: `Returned item inspected & restocked to inventory. ${input.notes || ''}`.trim(),
                }, tx);
                await audit_repository_1.AuditRepository.record({
                    userId: actorId,
                    action: 'RETURN_RESTOCKED',
                    resource: 'InventoryItem',
                    resourceId: item.id,
                    before: { onHand: beforeOnHand },
                    after: { onHand: afterOnHand, disposition: input.disposition },
                });
                return {
                    status: 'RESTOCKED',
                    onHand: afterOnHand,
                    quantity: input.quantity,
                };
            }
            else {
                // DAMAGED / QUARANTINE / SCRAP: Do not increase sellable on-hand
                await inventory_repository_1.InventoryRepository.createMovement({
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    locationId: input.locationId || item.locationId,
                    movementType: database_1.InventoryMovementType.DAMAGE,
                    quantity: input.quantity,
                    beforeOnHand,
                    afterOnHand: beforeOnHand,
                    beforeReserved,
                    afterReserved: beforeReserved,
                    referenceType: `RETURN_${input.disposition}`,
                    referenceId: input.orderId || undefined,
                    performedByUserId: actorId,
                    notes: `Returned item dispositioned to ${input.disposition} (not added to sellable stock). ${input.notes || ''}`.trim(),
                }, tx);
                await audit_repository_1.AuditRepository.record({
                    userId: actorId,
                    action: `RETURN_${input.disposition}`,
                    resource: 'InventoryItem',
                    resourceId: item.id,
                    after: { disposition: input.disposition, quantity: input.quantity, notes: input.notes },
                });
                return {
                    status: input.disposition,
                    onHand: beforeOnHand,
                    quantity: input.quantity,
                };
            }
        });
    }
    /**
     * Receives incoming stock from Purchase Order (Phase M11 integration).
     * M10 remains the sole authority for physical inventory quantities and movements.
     */
    static async receiveStock(input, txClient, actorId) {
        if (input.quantity <= 0) {
            throw new app_error_1.BadRequestException('Received quantity must be a positive integer');
        }
        const executeInTx = async (tx) => {
            const warehouse = await warehouse_repository_1.WarehouseRepository.findById(input.warehouseId);
            if (!warehouse || !warehouse.isActive) {
                throw new app_error_1.BadRequestException('Destination warehouse not found or inactive');
            }
            if (input.locationId) {
                const location = await warehouse_repository_1.WarehouseRepository.findLocationById(input.locationId);
                if (!location || location.warehouseId !== input.warehouseId || !location.isActive) {
                    throw new app_error_1.BadRequestException('Destination location not found, inactive, or does not belong to warehouse');
                }
            }
            let item = await inventory_repository_1.InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
            if (!item) {
                const created = await inventory_repository_1.InventoryRepository.upsertInventoryItem({
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    locationId: input.locationId,
                    onHand: 0,
                    reserved: 0,
                }, tx);
                item = {
                    id: created.id,
                    warehouseId: created.warehouseId,
                    productId: created.productId,
                    locationId: created.locationId,
                    onHand: 0,
                    reserved: 0,
                    safetyStock: created.safetyStock,
                    reorderPoint: created.reorderPoint,
                    reorderQuantity: created.reorderQuantity,
                    createdAt: created.createdAt,
                    updatedAt: created.updatedAt,
                };
            }
            const beforeOnHand = item.onHand;
            const beforeReserved = item.reserved;
            const afterOnHand = beforeOnHand + input.quantity;
            // Update on-hand inventory
            const updatedItem = await inventory_repository_1.InventoryRepository.updateQuantities(item.id, {
                onHand: afterOnHand,
                locationId: input.locationId !== undefined ? input.locationId : item.locationId,
            }, tx);
            // Record StockMovement with PURCHASE_RECEIPT
            const movement = await inventory_repository_1.InventoryRepository.createMovement({
                warehouseId: input.warehouseId,
                productId: input.productId,
                locationId: input.locationId || item.locationId,
                movementType: database_1.InventoryMovementType.PURCHASE_RECEIPT,
                quantity: input.quantity,
                beforeOnHand,
                afterOnHand,
                beforeReserved,
                afterReserved: beforeReserved,
                referenceType: input.referenceType || 'PURCHASE_ORDER_RECEIPT',
                referenceId: input.referenceId,
                performedByUserId: actorId || input.actorId,
                notes: input.notes || `Received from purchase order (Ref: ${input.referenceId || 'N/A'})`,
            }, tx);
            // Audit Log
            if (actorId || input.actorId) {
                await audit_repository_1.AuditRepository.record({
                    userId: actorId || input.actorId,
                    action: 'STOCK_PURCHASE_RECEIVED',
                    resource: 'InventoryItem',
                    resourceId: item.id,
                    before: { onHand: beforeOnHand, reserved: beforeReserved },
                    after: {
                        onHand: afterOnHand,
                        receivedQuantity: input.quantity,
                        referenceId: input.referenceId,
                    },
                });
            }
            return {
                item: updatedItem,
                movement,
                beforeOnHand,
                afterOnHand,
                available: Math.max(0, afterOnHand - beforeReserved),
            };
        };
        if (txClient) {
            return executeInTx(txClient);
        }
        else {
            return database_1.prisma.$transaction(executeInTx);
        }
    }
    /**
     * Retrieves stock movements ledger with filtering and pagination.
     */
    static async getMovements(params = {}) {
        return inventory_repository_1.InventoryRepository.findMovements(params);
    }
    /**
     * Retrieves aggregate inventory KPIs for dashboard.
     */
    static async getDashboardMetrics() {
        return inventory_repository_1.InventoryRepository.getDashboardMetrics();
    }
}
exports.InventoryService = InventoryService;
//# sourceMappingURL=inventory.service.js.map