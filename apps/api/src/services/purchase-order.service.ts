import { prisma, Prisma, PurchaseOrderStatus } from '@car-parts/database';
import { PurchaseOrderRepository, PurchaseOrderQueryParams } from '../repositories/purchase-order.repository';
import { SupplierRepository } from '../repositories/supplier.repository';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { PurchaseOrderStateMachine } from './purchase-order-state-machine';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '../errors/app-error';

export interface CreatePurchaseOrderItemInput {
  productId: string;
  supplierProductId?: string | null;
  orderedQuantity: number;
  unitCost?: number | string | Prisma.Decimal;
  discount?: number | string | Prisma.Decimal;
  tax?: number | string | Prisma.Decimal;
  notes?: string | null;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  destinationWarehouseId: string;
  currency?: string;
  taxRate?: number | string | Prisma.Decimal;
  shippingCost?: number | string | Prisma.Decimal;
  otherCost?: number | string | Prisma.Decimal;
  notes?: string | null;
  termsAndConditions?: string | null;
  expectedDeliveryDate?: Date | string | null;
  items: CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  destinationWarehouseId?: string;
  currency?: string;
  taxRate?: number | string | Prisma.Decimal;
  shippingCost?: number | string | Prisma.Decimal;
  otherCost?: number | string | Prisma.Decimal;
  notes?: string | null;
  termsAndConditions?: string | null;
  expectedDeliveryDate?: Date | string | null;
  items?: CreatePurchaseOrderItemInput[];
}

export class PurchaseOrderService {
  static async getPurchaseOrders(params: PurchaseOrderQueryParams = {}) {
    return PurchaseOrderRepository.findPurchaseOrders(params);
  }

  static async getPurchaseOrderById(id: string) {
    const po = await PurchaseOrderRepository.findById(id);
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
    }
    return po;
  }

  static async createDraftPO(input: CreatePurchaseOrderInput, actorId: string) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Purchase Order must contain at least one line item');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Validate supplier
      const supplier = await SupplierRepository.findById(input.supplierId, tx);
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID '${input.supplierId}' not found`);
      }
      if (!supplier.isActive) {
        throw new BadRequestException(`Cannot create PO: Supplier '${supplier.name}' (${supplier.code}) is inactive`);
      }

      // 2. Validate destination warehouse
      const warehouse = await WarehouseRepository.findById(input.destinationWarehouseId);
      if (!warehouse) {
        throw new NotFoundException(`Destination warehouse with ID '${input.destinationWarehouseId}' not found`);
      }
      if (!warehouse.isActive) {
        throw new BadRequestException(`Cannot create PO: Destination warehouse '${warehouse.name}' is inactive`);
      }

      // 3. Process line items with server calculations & snapshots
      let subtotal = new Prisma.Decimal(0);
      let discountTotal = new Prisma.Decimal(0);
      let taxTotal = new Prisma.Decimal(0);

      const validatedItems: Prisma.PurchaseOrderItemUncheckedCreateWithoutPurchaseOrderInput[] = [];

      for (const itemInput of input.items) {
        if (itemInput.orderedQuantity <= 0) {
          throw new BadRequestException(`Ordered quantity for product '${itemInput.productId}' must be greater than 0`);
        }

        // Product verification
        const product = await tx.product.findFirst({
          where: { id: itemInput.productId, deletedAt: null },
        });
        if (!product) {
          throw new NotFoundException(`Product with ID '${itemInput.productId}' not found`);
        }
        if (!product.isActive) {
          throw new BadRequestException(`Product '${product.sku}' is inactive and cannot be purchased`);
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
          throw new BadRequestException(
            `Supplier '${supplier.name}' (${supplier.code}) is not configured to supply product '${product.sku}'`
          );
        }
        if (!sp.isActive) {
          throw new BadRequestException(
            `Supplier-product mapping for '${product.sku}' from supplier '${supplier.name}' is inactive`
          );
        }

        // MOQ verification
        if (sp.moq && itemInput.orderedQuantity < sp.moq) {
          throw new BadRequestException(
            `Ordered quantity (${itemInput.orderedQuantity}) for product '${product.sku}' does not meet Minimum Order Quantity (${sp.moq})`
          );
        }

        // Pack size verification
        if (sp.packSize && sp.packSize > 1 && itemInput.orderedQuantity % sp.packSize !== 0) {
          throw new BadRequestException(
            `Ordered quantity (${itemInput.orderedQuantity}) for product '${product.sku}' must be a multiple of pack size (${sp.packSize})`
          );
        }

        // Unit cost: use provided unitCost or fallback to SupplierProduct.purchaseCost
        const unitCost = itemInput.unitCost !== undefined
          ? new Prisma.Decimal(itemInput.unitCost.toString())
          : sp.purchaseCost;

        if (unitCost.lessThan(0)) {
          throw new BadRequestException(`Unit cost for product '${product.sku}' must be non-negative`);
        }

        const discount = itemInput.discount !== undefined
          ? new Prisma.Decimal(itemInput.discount.toString())
          : new Prisma.Decimal(0);

        const tax = itemInput.tax !== undefined
          ? new Prisma.Decimal(itemInput.tax.toString())
          : new Prisma.Decimal(0);

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

      if (input.taxRate !== undefined && new Prisma.Decimal(input.taxRate.toString()).greaterThan(0)) {
        const rate = new Prisma.Decimal(input.taxRate.toString()).div(100);
        taxTotal = subtotal.sub(discountTotal).mul(rate).toDecimalPlaces(2);
      }

      const shippingCost = input.shippingCost !== undefined
        ? new Prisma.Decimal(input.shippingCost.toString())
        : new Prisma.Decimal(0);

      const otherCost = input.otherCost !== undefined
        ? new Prisma.Decimal(input.otherCost.toString())
        : new Prisma.Decimal(0);

      const grandTotal = subtotal.sub(discountTotal).add(taxTotal).add(shippingCost).add(otherCost);

      const poNumber = await PurchaseOrderRepository.generatePoNumber(tx);

      const po = await PurchaseOrderRepository.create(
        {
          poNumber,
          supplierId: supplier.id,
          destinationWarehouseId: warehouse.id,
          status: PurchaseOrderStatus.DRAFT,
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
        },
        validatedItems,
        tx
      );

      await AuditRepository.record({
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

  static async submitForApproval(id: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      PurchaseOrderStateMachine.assertValidTransition(po.status, PurchaseOrderStatus.PENDING_APPROVAL, po.poNumber);

      const updated = await PurchaseOrderRepository.update(
        id,
        {
          status: PurchaseOrderStatus.PENDING_APPROVAL,
        },
        tx
      );

      await AuditRepository.record({
        userId: actorId,
        action: 'PURCHASE_ORDER_SUBMITTED',
        resource: 'PurchaseOrder',
        resourceId: id,
        before: { status: po.status },
        after: { status: PurchaseOrderStatus.PENDING_APPROVAL },
      });

      return updated;
    });
  }

  static async approvePO(
    id: string,
    actorId: string,
    overrideReason?: string,
    callerUser?: { id: string; role?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      PurchaseOrderStateMachine.assertValidTransition(po.status, PurchaseOrderStatus.APPROVED, po.poNumber);

      // Separation of duties: Creator cannot approve their own PO unless SUPER_ADMIN override is audited
      if (po.createdByUserId === actorId) {
        const isSuperAdmin =
          (callerUser as any)?.roles?.includes('SUPER_ADMIN') ||
          (callerUser as any)?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin) {
          throw new ForbiddenException(
            `Separation of duties violation: The creator of PO '${po.poNumber}' cannot approve their own purchase order`
          );
        }
      }

      const now = new Date();
      const updated = await PurchaseOrderRepository.update(
        id,
        {
          status: PurchaseOrderStatus.APPROVED,
          approvedByUserId: actorId,
          approvedAt: now,
          rejectedByUserId: null,
          rejectedAt: null,
          rejectionReason: null,
        },
        tx
      );

      await AuditRepository.record({
        userId: actorId,
        action: 'PURCHASE_ORDER_APPROVED',
        resource: 'PurchaseOrder',
        resourceId: id,
        before: { status: po.status },
        after: {
          status: PurchaseOrderStatus.APPROVED,
          approvedByUserId: actorId,
          approvedAt: now,
          overrideReason: po.createdByUserId === actorId ? overrideReason || 'SUPER_ADMIN Self-Approval Override' : undefined,
        },
      });

      return updated;
    });
  }

  static async rejectPO(id: string, actorId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is mandatory when rejecting a purchase order');
    }

    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      PurchaseOrderStateMachine.assertValidTransition(po.status, PurchaseOrderStatus.REJECTED, po.poNumber);

      const now = new Date();
      const updated = await PurchaseOrderRepository.update(
        id,
        {
          status: PurchaseOrderStatus.REJECTED,
          rejectedByUserId: actorId,
          rejectedAt: now,
          rejectionReason: reason.trim(),
        },
        tx
      );

      await AuditRepository.record({
        userId: actorId,
        action: 'PURCHASE_ORDER_REJECTED',
        resource: 'PurchaseOrder',
        resourceId: id,
        before: { status: po.status },
        after: {
          status: PurchaseOrderStatus.REJECTED,
          rejectedByUserId: actorId,
          rejectedAt: now,
          rejectionReason: reason.trim(),
        },
      });

      return updated;
    });
  }

  static async sendPO(id: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      PurchaseOrderStateMachine.assertValidTransition(po.status, PurchaseOrderStatus.SENT, po.poNumber);

      const now = new Date();
      const updated = await PurchaseOrderRepository.update(
        id,
        {
          status: PurchaseOrderStatus.SENT,
          sentByUserId: actorId,
          sentAt: now,
        },
        tx
      );

      await AuditRepository.record({
        userId: actorId,
        action: 'PURCHASE_ORDER_SENT',
        resource: 'PurchaseOrder',
        resourceId: id,
        before: { status: po.status },
        after: {
          status: PurchaseOrderStatus.SENT,
          sentByUserId: actorId,
          sentAt: now,
        },
      });

      return updated;
    });
  }

  static async cancelPO(id: string, actorId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Cancellation reason is mandatory when cancelling a purchase order');
    }

    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      PurchaseOrderStateMachine.assertValidTransition(po.status, PurchaseOrderStatus.CANCELLED, po.poNumber);

      const now = new Date();
      const updated = await PurchaseOrderRepository.update(
        id,
        {
          status: PurchaseOrderStatus.CANCELLED,
          cancelledByUserId: actorId,
          cancelledAt: now,
          cancellationReason: reason.trim(),
        },
        tx
      );

      await AuditRepository.record({
        userId: actorId,
        action: 'PURCHASE_ORDER_CANCELLED',
        resource: 'PurchaseOrder',
        resourceId: id,
        before: { status: po.status },
        after: {
          status: PurchaseOrderStatus.CANCELLED,
          cancelledByUserId: actorId,
          cancelledAt: now,
          cancellationReason: reason.trim(),
        },
      });

      return updated;
    });
  }

  static async updatePO(id: string, input: UpdatePurchaseOrderInput, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const po = await PurchaseOrderRepository.findByIdWithLock(id, tx);
      if (!po) {
        throw new NotFoundException(`Purchase Order with ID '${id}' not found`);
      }

      if (!PurchaseOrderStateMachine.isEditable(po.status)) {
        throw new BadRequestException(
          `Cannot update purchase order '${po.poNumber}' in status '${po.status}'. Only 'DRAFT' purchase orders can be updated.`
        );
      }

      const updateData: Prisma.PurchaseOrderUncheckedUpdateInput = {};
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.termsAndConditions !== undefined) updateData.termsAndConditions = input.termsAndConditions;
      if (input.expectedDeliveryDate !== undefined) {
        updateData.expectedDeliveryDate = input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : null;
      }

      const updated = await PurchaseOrderRepository.update(id, updateData, tx);

      await AuditRepository.record({
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
