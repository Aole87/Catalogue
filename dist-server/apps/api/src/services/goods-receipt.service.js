"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptService = void 0;
const database_1 = require("@car-parts/database");
const goods_receipt_repository_1 = require("../repositories/goods-receipt.repository");
const purchase_order_repository_1 = require("../repositories/purchase-order.repository");
const warehouse_repository_1 = require("../repositories/warehouse.repository");
const inventory_service_1 = require("./inventory.service");
const audit_repository_1 = require("../repositories/audit.repository");
const purchase_order_state_machine_1 = require("./purchase-order-state-machine");
const app_error_1 = require("../errors/app-error");
class GoodsReceiptService {
    static async getReceipts(params = {}) {
        return goods_receipt_repository_1.GoodsReceiptRepository.findReceipts(params);
    }
    static async getReceiptById(id) {
        const receipt = await goods_receipt_repository_1.GoodsReceiptRepository.findById(id);
        if (!receipt) {
            throw new app_error_1.NotFoundException(`Goods Receipt with ID '${id}' not found`);
        }
        return receipt;
    }
    static async receiveGoods(poId, input, actorId) {
        if (!input.items || input.items.length === 0) {
            throw new app_error_1.BadRequestException('Goods receipt must contain at least one line item to receive');
        }
        // 0. Pre-transaction check if already fulfilled by this idempotencyKey
        if (input.idempotencyKey) {
            const existing = await goods_receipt_repository_1.GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey);
            if (existing) {
                return existing;
            }
        }
        try {
            return await database_1.prisma.$transaction(async (tx) => {
                // 1. Lock Purchase Order and validate status
                const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(poId, tx);
                if (!po) {
                    throw new app_error_1.NotFoundException(`Purchase Order with ID '${poId}' not found`);
                }
                // 2. Transactional Idempotency Check (under row lock)
                if (input.idempotencyKey) {
                    const existingReceipt = await goods_receipt_repository_1.GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey, tx);
                    if (existingReceipt) {
                        return existingReceipt;
                    }
                }
                if (!purchase_order_state_machine_1.PurchaseOrderStateMachine.isReceivable(po.status)) {
                    throw new app_error_1.BadRequestException(`Cannot receive goods: Purchase Order '${po.poNumber}' is in status '${po.status}'. Goods can only be received when status is 'SENT' or 'PARTIALLY_RECEIVED'.`);
                }
                // 3. Resolve and validate warehouse
                const warehouseId = input.warehouseId || po.destinationWarehouseId;
                if (input.warehouseId && input.warehouseId !== po.destinationWarehouseId) {
                    throw new app_error_1.BadRequestException(`Warehouse mismatch: Cannot receive goods into warehouse '${input.warehouseId}'. Intended PO destination warehouse is '${po.destinationWarehouseId}'.`);
                }
                const warehouse = await warehouse_repository_1.WarehouseRepository.findById(warehouseId);
                if (!warehouse || !warehouse.isActive) {
                    throw new app_error_1.BadRequestException(`Destination warehouse '${warehouseId}' is not found or inactive`);
                }
                // Validate location if provided
                if (input.locationId) {
                    const location = await warehouse_repository_1.WarehouseRepository.findLocationById(input.locationId);
                    if (!location || location.warehouseId !== warehouseId || !location.isActive) {
                        throw new app_error_1.BadRequestException(`Destination location '${input.locationId}' not found, inactive, or does not belong to warehouse '${warehouseId}'`);
                    }
                }
                // 4. Validate and process line item receipts
                const receiptNumber = await goods_receipt_repository_1.GoodsReceiptRepository.generateGrnNumber(tx);
                const receiptItemsData = [];
                for (const itemInput of input.items) {
                    if (itemInput.receivedQuantity <= 0) {
                        throw new app_error_1.BadRequestException('Received quantity must be greater than 0');
                    }
                    const poItem = po.items.find((i) => i.id === itemInput.purchaseOrderItemId);
                    if (!poItem) {
                        throw new app_error_1.NotFoundException(`Purchase Order Item with ID '${itemInput.purchaseOrderItemId}' not found in PO '${po.poNumber}'`);
                    }
                    const remainingQuantity = poItem.orderedQuantity - poItem.receivedQuantity;
                    if (itemInput.receivedQuantity > remainingQuantity) {
                        throw new app_error_1.BadRequestException(`Over-receiving rejected for SKU '${poItem.productSku}': Attempted to receive ${itemInput.receivedQuantity} units, but remaining unfulfilled quantity is only ${remainingQuantity} units (Ordered: ${poItem.orderedQuantity}, Already Received: ${poItem.receivedQuantity})`);
                    }
                    const acceptedQuantity = itemInput.acceptedQuantity !== undefined
                        ? itemInput.acceptedQuantity
                        : itemInput.receivedQuantity - (itemInput.rejectedQuantity || 0);
                    const rejectedQuantity = itemInput.rejectedQuantity !== undefined
                        ? itemInput.rejectedQuantity
                        : itemInput.receivedQuantity - acceptedQuantity;
                    if (acceptedQuantity < 0 || rejectedQuantity < 0 || acceptedQuantity + rejectedQuantity !== itemInput.receivedQuantity) {
                        throw new app_error_1.BadRequestException(`Invalid breakdown for SKU '${poItem.productSku}': Accepted (${acceptedQuantity}) + Rejected (${rejectedQuantity}) must equal Received quantity (${itemInput.receivedQuantity})`);
                    }
                    // 5. Update PO Item received quantity
                    const newReceivedQuantity = poItem.receivedQuantity + itemInput.receivedQuantity;
                    await tx.purchaseOrderItem.update({
                        where: { id: poItem.id },
                        data: { receivedQuantity: newReceivedQuantity },
                    });
                    // 6. Call M10 InventoryService.receiveStock in the same transaction for accepted items
                    if (acceptedQuantity > 0 && poItem.productId) {
                        await inventory_service_1.InventoryService.receiveStock({
                            productId: poItem.productId,
                            warehouseId,
                            locationId: input.locationId,
                            quantity: acceptedQuantity,
                            unitCost: poItem.unitCost,
                            referenceType: 'PURCHASE_ORDER_RECEIPT',
                            referenceId: receiptNumber,
                            notes: `Goods Receipt ${receiptNumber} against PO ${po.poNumber}`,
                            actorId,
                        }, tx, actorId);
                    }
                    receiptItemsData.push({
                        purchaseOrderItemId: poItem.id,
                        productId: poItem.productId,
                        receivedQuantity: itemInput.receivedQuantity,
                        acceptedQuantity,
                        rejectedQuantity,
                        supplierSku: poItem.supplierSku,
                        unitCost: poItem.unitCost,
                        rejectionReason: itemInput.rejectionReason || null,
                    });
                }
                // 7. Create GoodsReceipt
                const goodsReceipt = await goods_receipt_repository_1.GoodsReceiptRepository.create({
                    receiptNumber,
                    purchaseOrderId: po.id,
                    warehouseId,
                    locationId: input.locationId || null,
                    idempotencyKey: input.idempotencyKey || null,
                    status: 'COMPLETED',
                    receivedAt: new Date(),
                    receivedByUserId: actorId,
                    notes: input.notes || null,
                }, receiptItemsData, tx);
                // 8. Update Purchase Order status based on completion
                const updatedPoItems = await tx.purchaseOrderItem.findMany({
                    where: { purchaseOrderId: po.id },
                });
                const allReceived = updatedPoItems.every((i) => i.receivedQuantity >= i.orderedQuantity);
                const newStatus = allReceived ? database_1.PurchaseOrderStatus.RECEIVED : database_1.PurchaseOrderStatus.PARTIALLY_RECEIVED;
                if (po.status !== newStatus) {
                    await purchase_order_repository_1.PurchaseOrderRepository.update(po.id, {
                        status: newStatus,
                    }, tx);
                }
                // 9. Audit Logging
                await audit_repository_1.AuditRepository.record({
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
        }
        catch (err) {
            if (input.idempotencyKey && err instanceof database_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const existing = await goods_receipt_repository_1.GoodsReceiptRepository.findByIdempotencyKey(input.idempotencyKey);
                if (existing) {
                    return existing;
                }
            }
            throw err;
        }
    }
}
exports.GoodsReceiptService = GoodsReceiptService;
//# sourceMappingURL=goods-receipt.service.js.map