import { prisma, Prisma, PurchaseOrderStatus } from '@car-parts/database';
import { GoodsReceiptRepository, GoodsReceiptQueryParams } from '../repositories/goods-receipt.repository';
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { InventoryService } from './inventory.service';
import { AuditRepository } from '../repositories/audit.repository';
import { PurchaseOrderStateMachine } from './purchase-order-state-machine';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '../errors/app-error';

export interface ReceiveGoodsItemInput {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
  rejectionReason?: string | null;
}

export interface ReceiveGoodsInput {
  warehouseId?: string;
  locationId?: string | null;
  idempotencyKey?: string | null;
  notes?: string | null;
  items: ReceiveGoodsItemInput[];
}

export class GoodsReceiptService {
  static async getReceipts(params: GoodsReceiptQueryParams = {}) {
    return GoodsReceiptRepository.findReceipts(params);
  }

  static async getReceiptById(id: string) {
    const receipt = await GoodsReceiptRepository.findById(id);
    if (!receipt) {
      throw new NotFoundException(`Goods Receipt with ID '${id}' not found`);
    }
    return receipt;
  }

  static async receiveGoods(poId: string, input: ReceiveGoodsInput, actorId: string) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Goods receipt must contain at least one line item to receive');
    }

    // 0. Pre-transaction check if already fulfilled by this idempotencyKey
    if (input.idempotencyKey) {
      const existing = await GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Lock Purchase Order and validate status
        const po = await PurchaseOrderRepository.findByIdWithLock(poId, tx);
        if (!po) {
          throw new NotFoundException(`Purchase Order with ID '${poId}' not found`);
        }

        // 2. Transactional Idempotency Check (under row lock)
        if (input.idempotencyKey) {
          const existingReceipt = await GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey, tx);
          if (existingReceipt) {
            return existingReceipt;
          }
        }

        if (!PurchaseOrderStateMachine.isReceivable(po.status)) {
          throw new BadRequestException(
            `Cannot receive goods: Purchase Order '${po.poNumber}' is in status '${po.status}'. Goods can only be received when status is 'SENT' or 'PARTIALLY_RECEIVED'.`
          );
        }

      // 3. Resolve and validate warehouse
      const warehouseId = input.warehouseId || po.destinationWarehouseId;
      if (input.warehouseId && input.warehouseId !== po.destinationWarehouseId) {
        throw new BadRequestException(
          `Warehouse mismatch: Cannot receive goods into warehouse '${input.warehouseId}'. Intended PO destination warehouse is '${po.destinationWarehouseId}'.`
        );
      }

      const warehouse = await WarehouseRepository.findById(warehouseId);
      if (!warehouse || !warehouse.isActive) {
        throw new BadRequestException(`Destination warehouse '${warehouseId}' is not found or inactive`);
      }

      // Validate location if provided
      if (input.locationId) {
        const location = await WarehouseRepository.findLocationById(input.locationId);
        if (!location || location.warehouseId !== warehouseId || !location.isActive) {
          throw new BadRequestException(
            `Destination location '${input.locationId}' not found, inactive, or does not belong to warehouse '${warehouseId}'`
          );
        }
      }

      // 4. Validate and process line item receipts
      const receiptNumber = await GoodsReceiptRepository.generateGrnNumber(tx);
      const receiptItemsData: Prisma.GoodsReceiptItemUncheckedCreateWithoutGoodsReceiptInput[] = [];

      for (const itemInput of input.items) {
        if (itemInput.receivedQuantity <= 0) {
          throw new BadRequestException('Received quantity must be greater than 0');
        }

        const poItem = po.items.find((i) => i.id === itemInput.purchaseOrderItemId);
        if (!poItem) {
          throw new NotFoundException(
            `Purchase Order Item with ID '${itemInput.purchaseOrderItemId}' not found in PO '${po.poNumber}'`
          );
        }

        const remainingQuantity = poItem.orderedQuantity - poItem.receivedQuantity;
        if (itemInput.receivedQuantity > remainingQuantity) {
          throw new BadRequestException(
            `Over-receiving rejected for SKU '${poItem.productSku}': Attempted to receive ${itemInput.receivedQuantity} units, but remaining unfulfilled quantity is only ${remainingQuantity} units (Ordered: ${poItem.orderedQuantity}, Already Received: ${poItem.receivedQuantity})`
          );
        }

        const acceptedQuantity = itemInput.acceptedQuantity !== undefined
          ? itemInput.acceptedQuantity
          : itemInput.receivedQuantity - (itemInput.rejectedQuantity || 0);

        const rejectedQuantity = itemInput.rejectedQuantity !== undefined
          ? itemInput.rejectedQuantity
          : itemInput.receivedQuantity - acceptedQuantity;

        if (acceptedQuantity < 0 || rejectedQuantity < 0 || acceptedQuantity + rejectedQuantity !== itemInput.receivedQuantity) {
          throw new BadRequestException(
            `Invalid breakdown for SKU '${poItem.productSku}': Accepted (${acceptedQuantity}) + Rejected (${rejectedQuantity}) must equal Received quantity (${itemInput.receivedQuantity})`
          );
        }

        // 5. Update PO Item received quantity
        const newReceivedQuantity = poItem.receivedQuantity + itemInput.receivedQuantity;
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { receivedQuantity: newReceivedQuantity },
        });

        // 6. Call M10 InventoryService.receiveStock in the same transaction for accepted items
        if (acceptedQuantity > 0 && poItem.productId) {
          await InventoryService.receiveStock(
            {
              productId: poItem.productId,
              warehouseId,
              locationId: input.locationId,
              quantity: acceptedQuantity,
              unitCost: poItem.unitCost,
              referenceType: 'PURCHASE_ORDER_RECEIPT',
              referenceId: receiptNumber,
              notes: `Goods Receipt ${receiptNumber} against PO ${po.poNumber}`,
              actorId,
            },
            tx,
            actorId
          );
        }

        receiptItemsData.push({
          purchaseOrderItemId: poItem.id,
          productId: poItem.productId!,
          receivedQuantity: itemInput.receivedQuantity,
          acceptedQuantity,
          rejectedQuantity,
          supplierSku: poItem.supplierSku,
          unitCost: poItem.unitCost,
          rejectionReason: itemInput.rejectionReason || null,
        });
      }

      // 7. Create GoodsReceipt
      const goodsReceipt = await GoodsReceiptRepository.create(
        {
          receiptNumber,
          purchaseOrderId: po.id,
          warehouseId,
          locationId: input.locationId || null,
          idempotencyKey: input.idempotencyKey || null,
          status: 'COMPLETED',
          receivedAt: new Date(),
          receivedByUserId: actorId,
          notes: input.notes || null,
        },
        receiptItemsData,
        tx
      );

      // 8. Update Purchase Order status based on completion
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });

      const allReceived = updatedPoItems.every((i) => i.receivedQuantity >= i.orderedQuantity);
      const newStatus = allReceived ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      if (po.status !== newStatus) {
        await PurchaseOrderRepository.update(
          po.id,
          {
            status: newStatus,
          },
          tx
        );
      }

      // 9. Audit Logging
      await AuditRepository.record({
        userId: actorId,
        action: 'GOODS_RECEIVED',
        resource: 'GoodsReceipt',
        resourceId: goodsReceipt.id,
        after: {
          receiptNumber: goodsReceipt.receiptNumber,
          poNumber: po.poNumber,
          warehouseId,
          newPoStatus: newStatus,
          itemCount: receiptItemsData.length,
        },
      });

      return goodsReceipt;
    });
    } catch (err: any) {
      if (input.idempotencyKey && err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const existing = await GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey);
        if (existing) {
          return existing;
        }
      }
      throw err;
    }
  }
}
