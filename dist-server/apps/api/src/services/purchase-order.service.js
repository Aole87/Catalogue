"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const database_1 = require("@car-parts/database");
const purchase_order_repository_1 = require("../repositories/purchase-order.repository");
const supplier_repository_1 = require("../repositories/supplier.repository");
const warehouse_repository_1 = require("../repositories/warehouse.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const purchase_order_state_machine_1 = require("./purchase-order-state-machine");
const app_error_1 = require("../errors/app-error");
class PurchaseOrderService {
    static async getPurchaseOrders(params = {}) {
        return purchase_order_repository_1.PurchaseOrderRepository.findPurchaseOrders(params);
    }
    static async getPurchaseOrderById(id) {
        const po = await purchase_order_repository_1.PurchaseOrderRepository.findById(id);
        if (!po) {
            throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
        }
        return po;
    }
    static async createDraftPO(input, actorId) {
        if (!input.items || input.items.length === 0) {
            throw new app_error_1.BadRequestException('Purchase Order must contain at least one line item');
        }
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Validate supplier
            const supplier = await supplier_repository_1.SupplierRepository.findById(input.supplierId, tx);
            if (!supplier) {
                throw new app_error_1.NotFoundException(`Supplier with ID '${input.supplierId}' not found`);
            }
            if (!supplier.isActive) {
                throw new app_error_1.BadRequestException(`Cannot create PO: Supplier '${supplier.name}' (${supplier.code}) is inactive`);
            }
            // 2. Validate destination warehouse
            const warehouse = await warehouse_repository_1.WarehouseRepository.findById(input.destinationWarehouseId);
            if (!warehouse) {
                throw new app_error_1.NotFoundException(`Destination warehouse with ID '${input.destinationWarehouseId}' not found`);
            }
            if (!warehouse.isActive) {
                throw new app_error_1.BadRequestException(`Cannot create PO: Destination warehouse '${warehouse.name}' is inactive`);
            }
            // 3. Process line items with server calculations & snapshots
            let subtotal = new database_1.Prisma.Decimal(0);
            let discountTotal = new database_1.Prisma.Decimal(0);
            let taxTotal = new database_1.Prisma.Decimal(0);
            const validatedItems = [];
            for (const itemInput of input.items) {
                if (itemInput.orderedQuantity <= 0) {
                    throw new app_error_1.BadRequestException(`Ordered quantity for product '${itemInput.productId}' must be greater than 0`);
                }
                // Product verification
                const product = await tx.product.findFirst({
                    where: { id: itemInput.productId, deletedAt: null },
                });
                if (!product) {
                    throw new app_error_1.NotFoundException(`Product with ID '${itemInput.productId}' not found`);
                }
                if (!product.isActive) {
                    throw new app_error_1.BadRequestException(`Product '${product.sku}' is inactive and cannot be purchased`);
                }
                // Supplier-Product relationship check
                const sp = await tx.supplierProduct.findFirst({
                    where: {
                        supplierId: supplier.id,
                        productId: product.id,
                        deletedAt: null,
                    },
                });
                if (!sp) {
                    throw new app_error_1.BadRequestException(`Supplier '${supplier.name}' (${supplier.code}) is not configured to supply product '${product.sku}'`);
                }
                if (!sp.isActive) {
                    throw new app_error_1.BadRequestException(`Supplier-product mapping for '${product.sku}' from supplier '${supplier.name}' is inactive`);
                }
                // MOQ verification
                if (sp.moq && itemInput.orderedQuantity < sp.moq) {
                    throw new app_error_1.BadRequestException(`Ordered quantity (${itemInput.orderedQuantity}) for product '${product.sku}' does not meet Minimum Order Quantity (${sp.moq})`);
                }
                // Pack size verification
                if (sp.packSize && sp.packSize > 1 && itemInput.orderedQuantity % sp.packSize !== 0) {
                    throw new app_error_1.BadRequestException(`Ordered quantity (${itemInput.orderedQuantity}) for product '${product.sku}' must be a multiple of pack size (${sp.packSize})`);
                }
                // Unit cost: use provided unitCost or fallback to SupplierProduct.purchaseCost
                const unitCost = itemInput.unitCost !== undefined
                    ? new database_1.Prisma.Decimal(itemInput.unitCost.toString())
                    : sp.purchaseCost;
                if (unitCost.lessThan(0)) {
                    throw new app_error_1.BadRequestException(`Unit cost for product '${product.sku}' must be non-negative`);
                }
                const discount = itemInput.discount !== undefined
                    ? new database_1.Prisma.Decimal(itemInput.discount.toString())
                    : new database_1.Prisma.Decimal(0);
                const tax = itemInput.tax !== undefined
                    ? new database_1.Prisma.Decimal(itemInput.tax.toString())
                    : new database_1.Prisma.Decimal(0);
                const lineSubtotal = unitCost.mul(itemInput.orderedQuantity);
                const lineTotal = lineSubtotal.sub(discount).add(tax);
                subtotal = subtotal.add(lineSubtotal);
                discountTotal = discountTotal.add(discount);
                taxTotal = taxTotal.add(tax);
                validatedItems.push({
                    productId: product.id,
                    supplierProductId: sp.id,
                    productSku: product.sku,
                    productName: product.name,
                    supplierSku: sp.supplierSku || product.sku,
                    unitCost,
                    orderedQuantity: itemInput.orderedQuantity,
                    receivedQuantity: 0,
                    discount,
                    tax,
                    lineTotal,
                    notes: itemInput.notes || null,
                });
            }
            if (input.taxRate !== undefined && new database_1.Prisma.Decimal(input.taxRate.toString()).greaterThan(0)) {
                const rate = new database_1.Prisma.Decimal(input.taxRate.toString()).div(100);
                taxTotal = subtotal.sub(discountTotal).mul(rate).toDecimalPlaces(2);
            }
            const shippingCost = input.shippingCost !== undefined
                ? new database_1.Prisma.Decimal(input.shippingCost.toString())
                : new database_1.Prisma.Decimal(0);
            const otherCost = input.otherCost !== undefined
                ? new database_1.Prisma.Decimal(input.otherCost.toString())
                : new database_1.Prisma.Decimal(0);
            const grandTotal = subtotal.sub(discountTotal).add(taxTotal).add(shippingCost).add(otherCost);
            const poNumber = await purchase_order_repository_1.PurchaseOrderRepository.generatePoNumber(tx);
            const po = await purchase_order_repository_1.PurchaseOrderRepository.create({
                poNumber,
                supplierId: supplier.id,
                destinationWarehouseId: warehouse.id,
                status: database_1.PurchaseOrderStatus.DRAFT,
                currency: input.currency || supplier.currency || 'THB',
                subtotal,
                discountTotal,
                taxTotal,
                shippingCost,
                otherCost,
                grandTotal,
                notes: input.notes || null,
                termsAndConditions: input.termsAndConditions || null,
                expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null,
                createdByUserId: actorId,
            }, validatedItems, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_DRAFTED',
                resource: 'PurchaseOrder',
                resourceId: po.id,
                after: {
                    poNumber: po.poNumber,
                    supplierId: po.supplierId,
                    grandTotal: po.grandTotal.toString(),
                    itemCount: validatedItems.length,
                },
            });
            return po;
        });
    }
    static async submitForApproval(id, actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            purchase_order_state_machine_1.PurchaseOrderStateMachine.assertValidTransition(po.status, database_1.PurchaseOrderStatus.PENDING_APPROVAL, po.poNumber);
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, {
                status: database_1.PurchaseOrderStatus.PENDING_APPROVAL,
            }, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_SUBMITTED',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { status: po.status },
                after: { status: database_1.PurchaseOrderStatus.PENDING_APPROVAL },
            });
            return updated;
        });
    }
    static async approvePO(id, actorId, overrideReason, callerUser) {
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            purchase_order_state_machine_1.PurchaseOrderStateMachine.assertValidTransition(po.status, database_1.PurchaseOrderStatus.APPROVED, po.poNumber);
            // Separation of duties: Creator cannot approve their own PO unless SUPER_ADMIN override is audited
            if (po.createdByUserId === actorId) {
                const isSuperAdmin = callerUser?.roles?.includes('SUPER_ADMIN') ||
                    callerUser?.role === 'SUPER_ADMIN';
                if (!isSuperAdmin) {
                    throw new app_error_1.ForbiddenException(`Separation of duties violation: The creator of PO '${po.poNumber}' cannot approve their own purchase order`);
                }
            }
            const now = new Date();
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, {
                status: database_1.PurchaseOrderStatus.APPROVED,
                approvedByUserId: actorId,
                approvedAt: now,
                rejectedByUserId: null,
                rejectedAt: null,
                rejectionReason: null,
            }, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_APPROVED',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { status: po.status },
                after: {
                    status: database_1.PurchaseOrderStatus.APPROVED,
                    approvedByUserId: actorId,
                    approvedAt: now,
                    overrideReason: po.createdByUserId === actorId ? overrideReason || 'SUPER_ADMIN Self-Approval Override' : undefined,
                },
            });
            return updated;
        });
    }
    static async rejectPO(id, actorId, reason) {
        if (!reason || reason.trim().length === 0) {
            throw new app_error_1.BadRequestException('Rejection reason is mandatory when rejecting a purchase order');
        }
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            purchase_order_state_machine_1.PurchaseOrderStateMachine.assertValidTransition(po.status, database_1.PurchaseOrderStatus.REJECTED, po.poNumber);
            const now = new Date();
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, {
                status: database_1.PurchaseOrderStatus.REJECTED,
                rejectedByUserId: actorId,
                rejectedAt: now,
                rejectionReason: reason.trim(),
            }, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_REJECTED',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { status: po.status },
                after: {
                    status: database_1.PurchaseOrderStatus.REJECTED,
                    rejectedByUserId: actorId,
                    rejectedAt: now,
                    rejectionReason: reason.trim(),
                },
            });
            return updated;
        });
    }
    static async sendPO(id, actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            purchase_order_state_machine_1.PurchaseOrderStateMachine.assertValidTransition(po.status, database_1.PurchaseOrderStatus.SENT, po.poNumber);
            const now = new Date();
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, {
                status: database_1.PurchaseOrderStatus.SENT,
                sentByUserId: actorId,
                sentAt: now,
            }, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_SENT',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { status: po.status },
                after: {
                    status: database_1.PurchaseOrderStatus.SENT,
                    sentByUserId: actorId,
                    sentAt: now,
                },
            });
            return updated;
        });
    }
    static async cancelPO(id, actorId, reason) {
        if (!reason || reason.trim().length === 0) {
            throw new app_error_1.BadRequestException('Cancellation reason is mandatory when cancelling a purchase order');
        }
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            purchase_order_state_machine_1.PurchaseOrderStateMachine.assertValidTransition(po.status, database_1.PurchaseOrderStatus.CANCELLED, po.poNumber);
            const now = new Date();
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, {
                status: database_1.PurchaseOrderStatus.CANCELLED,
                cancelledByUserId: actorId,
                cancelledAt: now,
                cancellationReason: reason.trim(),
            }, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_CANCELLED',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { status: po.status },
                after: {
                    status: database_1.PurchaseOrderStatus.CANCELLED,
                    cancelledByUserId: actorId,
                    cancelledAt: now,
                    cancellationReason: reason.trim(),
                },
            });
            return updated;
        });
    }
    static async updatePO(id, input, actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            const po = await purchase_order_repository_1.PurchaseOrderRepository.findByIdWithLock(id, tx);
            if (!po) {
                throw new app_error_1.NotFoundException(`Purchase Order with ID '${id}' not found`);
            }
            if (!purchase_order_state_machine_1.PurchaseOrderStateMachine.isEditable(po.status)) {
                throw new app_error_1.BadRequestException(`Cannot update purchase order '${po.poNumber}' in status '${po.status}'. Only 'DRAFT' purchase orders can be updated.`);
            }
            const updateData = {};
            if (input.notes !== undefined)
                updateData.notes = input.notes;
            if (input.termsAndConditions !== undefined)
                updateData.termsAndConditions = input.termsAndConditions;
            if (input.expectedDeliveryDate !== undefined) {
                updateData.expectedDeliveryDate = input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null;
            }
            const updated = await purchase_order_repository_1.PurchaseOrderRepository.update(id, updateData, tx);
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'PURCHASE_ORDER_UPDATED',
                resource: 'PurchaseOrder',
                resourceId: id,
                before: { notes: po.notes },
                after: { notes: updated.notes },
            });
            return updated;
        });
    }
}
exports.PurchaseOrderService = PurchaseOrderService;
//# sourceMappingURL=purchase-order.service.js.map