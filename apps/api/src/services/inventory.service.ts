import crypto from 'crypto';
import { prisma, Prisma, InventoryMovementType, ReservationStatus } from '@car-parts/database';
import {
  InventoryRepository,
  InventoryQueryParams,
  MovementQueryParams,
} from '../repositories/inventory.repository';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { AuditRepository } from '../repositories/audit.repository';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '../errors/app-error';

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

export class InventoryService {
  /**
   * Retrieves inventory items with search, warehouse filtering, and pagination.
   */
  static async getInventory(params: InventoryQueryParams = {}) {
    return InventoryRepository.findInventoryItems(params);
  }

  /**
   * Retrieves single inventory item by ID.
   */
  static async getInventoryById(id: string) {
    const item = await InventoryRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Inventory item not found');
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
  static async getProductAvailability(productId: string, warehouseId?: string) {
    const items = await InventoryRepository.findByProductId(productId);
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
  static async reserveStock(input: ReserveStockInput, actorId?: string) {
    if (input.quantity <= 0) {
      throw new BadRequestException('Reservation quantity must be a positive integer');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Check idempotency: If active reservation already exists for this reference, return it
      if (input.referenceType && input.referenceId) {
        const existingReservation = await InventoryRepository.findActiveReservationByReference(
          input.referenceType,
          input.referenceId,
          input.productId,
          tx
        );
        if (existingReservation) {
          return existingReservation;
        }
      }

      // 2. Resolve warehouse
      let warehouseId = input.warehouseId;
      if (!warehouseId) {
        // Find warehouse with best available stock
        const allItems = await InventoryRepository.findByProductId(input.productId, tx);
        const candidate = allItems.find((i) => i.onHand - i.reserved >= input.quantity);
        if (!candidate) {
          throw new BadRequestException(
            `Insufficient available stock for product '${input.productId}'. Required: ${input.quantity}`
          );
        }
        warehouseId = candidate.warehouseId;
      }

      // 3. Acquire row lock on InventoryItem (SELECT ... FOR UPDATE)
      const item = await InventoryRepository.findWithLock(input.productId, warehouseId, tx);
      if (!item) {
        throw new NotFoundException(
          `Inventory item not found for product '${input.productId}' in warehouse '${warehouseId}'`
        );
      }

      const available = item.onHand - item.reserved;
      if (available < input.quantity) {
        throw new BadRequestException(
          `Cannot reserve stock: Insufficient available inventory in warehouse '${warehouseId}'. Available: ${available}, Requested: ${input.quantity}`
        );
      }

      const beforeOnHand = item.onHand;
      const beforeReserved = item.reserved;
      const afterReserved = beforeReserved + input.quantity;

      // 4. Update InventoryItem reserved quantity
      await InventoryRepository.updateQuantities(
        item.id,
        { reserved: afterReserved },
        tx
      );

      // 5. Create StockReservation
      const reservation = await InventoryRepository.createReservation(
        {
          orderId: input.orderId,
          productId: input.productId,
          warehouseId,
          locationId: item.locationId,
          quantity: input.quantity,
          status: ReservationStatus.ACTIVE,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          notes: input.notes,
          expiresAt: input.expiresAt,
        },
        tx
      );

      // 6. Record StockMovement
      await InventoryRepository.createMovement(
        {
          warehouseId,
          productId: input.productId,
          locationId: item.locationId,
          movementType: InventoryMovementType.RESERVATION,
          quantity: input.quantity,
          beforeOnHand,
          afterOnHand: beforeOnHand,
          beforeReserved,
          afterReserved,
          referenceType: input.referenceType || 'RESERVATION',
          referenceId: reservation.id,
          performedByUserId: actorId,
          notes: input.notes || `Stock reserved for reference: ${input.referenceId || reservation.id}`,
        },
        tx
      );

      // 7. AuditLog
      if (actorId) {
        await AuditRepository.record({
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
  static async releaseReservation(reservationId: string, actorId?: string, reason?: string, callerUser?: { id: string; role?: string }) {
    return prisma.$transaction(async (tx) => {
      const reservation = await InventoryRepository.findReservationById(reservationId, tx);
      if (!reservation) {
        throw new NotFoundException('Stock reservation not found');
      }

      // Customer IDOR / Ownership Protection
      if (callerUser && (callerUser.role === 'CUSTOMER' || !callerUser.role)) {
        if (reservation.orderId) {
          const order = await tx.order.findUnique({
            where: { id: reservation.orderId },
            include: { customer: true },
          });
          if (order && order.customer?.userId && order.customer.userId !== callerUser.id) {
            throw new ForbiddenException('You are not authorized to release a reservation belonging to another customer');
          }
        }
      }

      // Idempotency: If already released or cancelled, return gracefully without double mutation
      if (reservation.status === ReservationStatus.RELEASED || reservation.status === ReservationStatus.CANCELLED || reservation.status === ReservationStatus.EXPIRED) {
        return reservation;
      }

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot release reservation in status '${reservation.status}'. Only ACTIVE reservations can be released.`
        );
      }

      // Lock inventory item
      const item = await InventoryRepository.findWithLock(reservation.productId, reservation.warehouseId, tx);
      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      const beforeOnHand = item.onHand;
      const beforeReserved = item.reserved;
      const afterReserved = Math.max(0, beforeReserved - reservation.quantity);

      // Update reserved quantity
      await InventoryRepository.updateQuantities(
        item.id,
        { reserved: afterReserved },
        tx
      );

      // Update reservation status
      const updatedReservation = await InventoryRepository.updateReservation(
        reservation.id,
        {
          status: ReservationStatus.RELEASED,
          releasedAt: new Date(),
          notes: reason ? `${reservation.notes || ''} [Released: ${reason}]`.trim() : reservation.notes,
        },
        tx
      );

      // Record StockMovement
      await InventoryRepository.createMovement(
        {
          warehouseId: reservation.warehouseId,
          productId: reservation.productId,
          locationId: reservation.locationId,
          movementType: InventoryMovementType.RELEASE,
          quantity: reservation.quantity,
          beforeOnHand,
          afterOnHand: beforeOnHand,
          beforeReserved,
          afterReserved,
          referenceType: 'RESERVATION_RELEASE',
          referenceId: reservation.id,
          performedByUserId: actorId,
          notes: reason || 'Reservation released back to available pool',
        },
        tx
      );

      // AuditLog
      if (actorId) {
        await AuditRepository.record({
          userId: actorId,
          action: 'STOCK_RELEASED',
          resource: 'StockReservation',
          resourceId: reservation.id,
          before: { reserved: beforeReserved, status: ReservationStatus.ACTIVE },
          after: { reserved: afterReserved, status: ReservationStatus.RELEASED, reason },
        });
      }

      return updatedReservation;
    });
  }

  /**
   * Commits an active reservation by deducting on-hand and reserved quantities (Fulfillment consumption).
   */
  static async commitReservation(
    reservationId: string,
    actorId?: string,
    notes?: string,
    targetOrderId?: string,
    callerUser?: { id: string; role?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const reservation = await InventoryRepository.findReservationById(reservationId, tx);
      if (!reservation) {
        throw new NotFoundException('Stock reservation not found');
      }

      // Idempotency: If already committed, return gracefully without double deduction
      if (reservation.status === ReservationStatus.COMMITTED) {
        return reservation;
      }

      // Stale / Expired Check
      if (reservation.expiresAt && reservation.expiresAt < new Date()) {
        throw new BadRequestException(
          `Cannot commit reservation '${reservation.id}': Reservation has expired at ${reservation.expiresAt.toISOString()}`
        );
      }

      // Order Coupling Validation
      if (targetOrderId && reservation.orderId && reservation.orderId !== targetOrderId) {
        throw new BadRequestException(
          `Cannot commit reservation: Order mismatch. Reservation is coupled to order '${reservation.orderId}', not '${targetOrderId}'`
        );
      }

      // Customer Ownership Protection
      if (callerUser && (callerUser.role === 'CUSTOMER' || !callerUser.role)) {
        if (reservation.orderId) {
          const order = await tx.order.findUnique({
            where: { id: reservation.orderId },
            include: { customer: true },
          });
          if (order && order.customer?.userId && order.customer.userId !== callerUser.id) {
            throw new ForbiddenException('You are not authorized to commit a reservation belonging to another customer');
          }
        }
      }

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot commit reservation in status '${reservation.status}'. Only ACTIVE reservations can be committed.`
        );
      }

      // Lock inventory item
      const item = await InventoryRepository.findWithLock(reservation.productId, reservation.warehouseId, tx);
      if (!item) {
        throw new NotFoundException('Inventory item not found');
      }

      const beforeOnHand = item.onHand;
      const beforeReserved = item.reserved;

      if (beforeOnHand < reservation.quantity) {
        throw new BadRequestException(
          `Cannot commit reservation: On-hand stock (${beforeOnHand}) is less than reservation quantity (${reservation.quantity})`
        );
      }

      const afterOnHand = beforeOnHand - reservation.quantity;
      const afterReserved = Math.max(0, beforeReserved - reservation.quantity);

      // Deduct both onHand and reserved
      await InventoryRepository.updateQuantities(
        item.id,
        { onHand: afterOnHand, reserved: afterReserved },
        tx
      );

      // Update reservation status
      const updatedReservation = await InventoryRepository.updateReservation(
        reservation.id,
        {
          status: ReservationStatus.COMMITTED,
          committedAt: new Date(),
          notes: notes ? `${reservation.notes || ''} [Committed: ${notes}]`.trim() : reservation.notes,
        },
        tx
      );

      // Record StockMovement
      await InventoryRepository.createMovement(
        {
          warehouseId: reservation.warehouseId,
          productId: reservation.productId,
          locationId: reservation.locationId,
          movementType: InventoryMovementType.DEDUCTION,
          quantity: reservation.quantity,
          beforeOnHand,
          afterOnHand,
          beforeReserved,
          afterReserved,
          referenceType: reservation.referenceType || 'ORDER_FULFILLMENT',
          referenceId: reservation.referenceId || reservation.id,
          performedByUserId: actorId,
          notes: notes || 'Stock committed and deducted for order fulfillment',
        },
        tx
      );

      // AuditLog
      if (actorId) {
        await AuditRepository.record({
          userId: actorId,
          action: 'STOCK_COMMITTED',
          resource: 'StockReservation',
          resourceId: reservation.id,
          before: { onHand: beforeOnHand, reserved: beforeReserved, status: ReservationStatus.ACTIVE },
          after: { onHand: afterOnHand, reserved: afterReserved, status: ReservationStatus.COMMITTED, notes },
        });
      }

      return updatedReservation;
    });
  }

  /**
   * Sweeps and expires all active reservations that have exceeded their expiresAt timestamp.
   * Restores the reserved quantity back to available pool.
   */
  static async expireStaleReservations(actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const expiredReservations = await tx.stockReservation.findMany({
        where: {
          status: ReservationStatus.ACTIVE,
          expiresAt: { lte: now },
        },
      });

      const processedIds: string[] = [];
      for (const res of expiredReservations) {
        const item = await InventoryRepository.findWithLock(res.productId, res.warehouseId, tx);
        if (item) {
          const beforeReserved = item.reserved;
          const afterReserved = Math.max(0, beforeReserved - res.quantity);
          await InventoryRepository.updateQuantities(item.id, { reserved: afterReserved }, tx);

          await InventoryRepository.updateReservation(
            res.id,
            {
              status: ReservationStatus.EXPIRED,
              releasedAt: now,
              notes: `${res.notes || ''} [Auto-expired at ${now.toISOString()}]`.trim(),
            },
            tx
          );

          await InventoryRepository.createMovement(
            {
              warehouseId: res.warehouseId,
              productId: res.productId,
              locationId: res.locationId,
              movementType: InventoryMovementType.RELEASE,
              quantity: res.quantity,
              beforeOnHand: item.onHand,
              afterOnHand: item.onHand,
              beforeReserved,
              afterReserved,
              referenceType: 'RESERVATION_EXPIRATION',
              referenceId: res.id,
              performedByUserId: actorId,
              notes: 'Reservation expired and released back to available pool',
            },
            tx
          );
          processedIds.push(res.id);
        }
      }
      return { expiredCount: processedIds.length, reservationIds: processedIds };
    });
  }

  /**
   * Executes a controlled stock adjustment with mandatory reason and append-only ledger entry.
   */
  static async adjustStock(input: AdjustStockInput, actorId: string) {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new BadRequestException('Stock adjustment reason is mandatory for audit compliance');
    }

    if (input.quantity < 0) {
      throw new BadRequestException('Adjustment quantity must be non-negative');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Verify warehouse
      const warehouse = await WarehouseRepository.findById(input.warehouseId);
      if (!warehouse || !warehouse.isActive) {
        throw new BadRequestException('Target warehouse is not found or inactive');
      }

      // 2. Lock inventory item
      let item = await InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
      if (!item) {
        // Create initial item if doesn't exist
        const created = await InventoryRepository.upsertInventoryItem(
          {
            warehouseId: input.warehouseId,
            productId: input.productId,
            locationId: input.locationId,
            onHand: 0,
            reserved: 0,
          },
          tx
        );
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
      let movementType: InventoryMovementType = InventoryMovementType.ADJUSTMENT;

      if (input.direction === 'INCREASE') {
        afterOnHand = beforeOnHand + input.quantity;
        movementType = InventoryMovementType.ADJUSTMENT_IN;
      } else if (input.direction === 'DECREASE') {
        if (beforeOnHand < input.quantity) {
          throw new BadRequestException(
            `Cannot decrease stock by ${input.quantity}. Current on-hand is only ${beforeOnHand}`
          );
        }
        if (beforeOnHand - input.quantity < beforeReserved) {
          throw new BadRequestException(
            `Cannot decrease stock below reserved quantity (${beforeReserved}). Available on-hand after deduction must be at least ${beforeReserved}`
          );
        }
        afterOnHand = beforeOnHand - input.quantity;
        movementType = InventoryMovementType.ADJUSTMENT_OUT;
      } else if (input.direction === 'SET') {
        if (input.quantity < beforeReserved) {
          throw new BadRequestException(
            `Cannot set on-hand stock to ${input.quantity}: Lower than current reserved stock (${beforeReserved})`
          );
        }
        afterOnHand = input.quantity;
        movementType =
          afterOnHand >= beforeOnHand
            ? InventoryMovementType.ADJUSTMENT_IN
            : InventoryMovementType.ADJUSTMENT_OUT;
      }

      const diff = afterOnHand - beforeOnHand;

      // 3. Update InventoryItem
      const updatedItem = await InventoryRepository.updateQuantities(
        item.id,
        {
          onHand: afterOnHand,
          locationId: input.locationId !== undefined ? input.locationId : item.locationId,
        },
        tx
      );

      // 4. Record StockMovement
      const movement = await InventoryRepository.createMovement(
        {
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
        },
        tx
      );

      // 5. AuditLog
      await AuditRepository.record({
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
  static async transferStock(input: TransferStockInput, actorId: string) {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new BadRequestException('Transfer reason is mandatory for audit compliance');
    }

    if (input.quantity <= 0) {
      throw new BadRequestException('Transfer quantity must be a positive integer');
    }

    if (
      input.sourceWarehouseId === input.targetWarehouseId &&
      input.sourceLocationId === input.targetLocationId
    ) {
      throw new BadRequestException('Source and destination warehouse/location cannot be identical');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Verify warehouses
      const [sourceWh, targetWh] = await Promise.all([
        WarehouseRepository.findById(input.sourceWarehouseId),
        WarehouseRepository.findById(input.targetWarehouseId),
      ]);

      if (!sourceWh || !sourceWh.isActive) {
        throw new BadRequestException('Source warehouse is not found or inactive');
      }
      if (!targetWh || !targetWh.isActive) {
        throw new BadRequestException('Destination warehouse is not found or inactive');
      }

      // 2. Lock source item
      const sourceItem = await InventoryRepository.findWithLock(input.productId, input.sourceWarehouseId, tx);
      if (!sourceItem) {
        throw new NotFoundException('Source inventory item not found');
      }

      const sourceAvailable = sourceItem.onHand - sourceItem.reserved;
      if (sourceAvailable < input.quantity) {
        throw new BadRequestException(
          `Cannot transfer: Insufficient available stock in source warehouse. Available: ${sourceAvailable}, Requested: ${input.quantity}`
        );
      }

      // 3. Lock target item
      let targetItem = await InventoryRepository.findWithLock(input.productId, input.targetWarehouseId, tx);
      if (!targetItem) {
        const createdTarget = await InventoryRepository.upsertInventoryItem(
          {
            warehouseId: input.targetWarehouseId,
            productId: input.productId,
            locationId: input.targetLocationId,
            onHand: 0,
            reserved: 0,
          },
          tx
        );
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
      await InventoryRepository.updateQuantities(
        sourceItem.id,
        { onHand: sourceAfterOnHand },
        tx
      );

      // Target increment
      const targetBeforeOnHand = targetItem.onHand;
      const targetAfterOnHand = targetBeforeOnHand + input.quantity;
      await InventoryRepository.updateQuantities(
        targetItem.id,
        {
          onHand: targetAfterOnHand,
          locationId: input.targetLocationId !== undefined ? input.targetLocationId : targetItem.locationId,
        },
        tx
      );

      const transferReferenceId = `TRF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Source movement
      await InventoryRepository.createMovement(
        {
          warehouseId: input.sourceWarehouseId,
          productId: input.productId,
          locationId: input.sourceLocationId || sourceItem.locationId,
          movementType: InventoryMovementType.TRANSFER_OUT,
          quantity: input.quantity,
          beforeOnHand: sourceBeforeOnHand,
          afterOnHand: sourceAfterOnHand,
          beforeReserved: sourceItem.reserved,
          afterReserved: sourceItem.reserved,
          referenceType: 'WAREHOUSE_TRANSFER',
          referenceId: transferReferenceId,
          performedByUserId: actorId,
          notes: `Transfer to ${targetWh.name} (${targetWh.code}) - ${input.reason}`,
        },
        tx
      );

      // Target movement
      await InventoryRepository.createMovement(
        {
          warehouseId: input.targetWarehouseId,
          productId: input.productId,
          locationId: input.targetLocationId || targetItem.locationId,
          movementType: InventoryMovementType.TRANSFER_IN,
          quantity: input.quantity,
          beforeOnHand: targetBeforeOnHand,
          afterOnHand: targetAfterOnHand,
          beforeReserved: targetItem.reserved,
          afterReserved: targetItem.reserved,
          referenceType: 'WAREHOUSE_TRANSFER',
          referenceId: transferReferenceId,
          performedByUserId: actorId,
          notes: `Transfer from ${sourceWh.name} (${sourceWh.code}) - ${input.reason}`,
        },
        tx
      );

      // AuditLog
      await AuditRepository.record({
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
  static async handleReturnDisposition(input: ReturnDispositionInput, actorId: string) {
    if (input.quantity <= 0) {
      throw new BadRequestException('Return disposition quantity must be a positive integer');
    }

    return prisma.$transaction(async (tx) => {
      const warehouse = await WarehouseRepository.findById(input.warehouseId);
      if (!warehouse || !warehouse.isActive) {
        throw new BadRequestException('Destination warehouse not found or inactive');
      }

      let item = await InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
      if (!item) {
        const created = await InventoryRepository.upsertInventoryItem(
          {
            warehouseId: input.warehouseId,
            productId: input.productId,
            locationId: input.locationId,
            onHand: 0,
            reserved: 0,
          },
          tx
        );
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
        await InventoryRepository.updateQuantities(
          item.id,
          { onHand: afterOnHand },
          tx
        );

        await InventoryRepository.createMovement(
          {
            warehouseId: input.warehouseId,
            productId: input.productId,
            locationId: input.locationId || item.locationId,
            movementType: InventoryMovementType.RETURN,
            quantity: input.quantity,
            beforeOnHand,
            afterOnHand,
            beforeReserved,
            afterReserved: beforeReserved,
            referenceType: 'ORDER_RETURN_RESTOCK',
            referenceId: input.orderId || undefined,
            performedByUserId: actorId,
            notes: `Returned item inspected & restocked to inventory. ${input.notes || ''}`.trim(),
          },
          tx
        );

        await AuditRepository.record({
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
      } else {
        // DAMAGED / QUARANTINE / SCRAP: Do not increase sellable on-hand
        await InventoryRepository.createMovement(
          {
            warehouseId: input.warehouseId,
            productId: input.productId,
            locationId: input.locationId || item.locationId,
            movementType: InventoryMovementType.DAMAGE,
            quantity: input.quantity,
            beforeOnHand,
            afterOnHand: beforeOnHand,
            beforeReserved,
            afterReserved: beforeReserved,
            referenceType: `RETURN_${input.disposition}`,
            referenceId: input.orderId || undefined,
            performedByUserId: actorId,
            notes: `Returned item dispositioned to ${input.disposition} (not added to sellable stock). ${input.notes || ''}`.trim(),
          },
          tx
        );

        await AuditRepository.record({
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
  static async receiveStock(input: ReceiveStockInput, txClient?: Prisma.TransactionClient, actorId?: string) {
    if (input.quantity <= 0) {
      throw new BadRequestException('Received quantity must be a positive integer');
    }

    const executeInTx = async (tx: Prisma.TransactionClient) => {
      const warehouse = await WarehouseRepository.findById(input.warehouseId);
      if (!warehouse || !warehouse.isActive) {
        throw new BadRequestException('Destination warehouse not found or inactive');
      }

      if (input.locationId) {
        const location = await WarehouseRepository.findLocationById(input.locationId);
        if (!location || location.warehouseId !== input.warehouseId || !location.isActive) {
          throw new BadRequestException('Destination location not found, inactive, or does not belong to warehouse');
        }
      }

      let item = await InventoryRepository.findWithLock(input.productId, input.warehouseId, tx);
      if (!item) {
        const created = await InventoryRepository.upsertInventoryItem(
          {
            warehouseId: input.warehouseId,
            productId: input.productId,
            locationId: input.locationId,
            onHand: 0,
            reserved: 0,
          },
          tx
        );
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
      const updatedItem = await InventoryRepository.updateQuantities(
        item.id,
        {
          onHand: afterOnHand,
          locationId: input.locationId !== undefined ? input.locationId : item.locationId,
        },
        tx
      );

      // Record StockMovement with PURCHASE_RECEIPT
      const movement = await InventoryRepository.createMovement(
        {
          warehouseId: input.warehouseId,
          productId: input.productId,
          locationId: input.locationId || item.locationId,
          movementType: InventoryMovementType.PURCHASE_RECEIPT,
          quantity: input.quantity,
          beforeOnHand,
          afterOnHand,
          beforeReserved,
          afterReserved: beforeReserved,
          referenceType: input.referenceType || 'PURCHASE_ORDER_RECEIPT',
          referenceId: input.referenceId,
          performedByUserId: actorId || input.actorId,
          notes: input.notes || `Received from purchase order (Ref: ${input.referenceId || 'N/A'})`,
        },
        tx
      );

      // Audit Log
      if (actorId || input.actorId) {
        await AuditRepository.record({
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
    } else {
      return prisma.$transaction(executeInTx);
    }
  }

  /**
   * Retrieves stock movements ledger with filtering and pagination.
   */
  static async getMovements(params: MovementQueryParams = {}) {
    return InventoryRepository.findMovements(params);
  }

  /**
   * Retrieves aggregate inventory KPIs for dashboard.
   */
  static async getDashboardMetrics() {
    return InventoryRepository.getDashboardMetrics();
  }
}
