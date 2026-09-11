import { prisma, Prisma } from '@car-parts/database';
import { SupplierProductRepository, SupplierProductQueryParams } from '../repositories/supplier-product.repository';
import { SupplierRepository } from '../repositories/supplier.repository';
import { AuditRepository } from '../repositories/audit.repository';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '../errors/app-error';

export interface CreateSupplierProductInput {
  supplierId: string;
  productId: string;
  supplierSku?: string | null;
  purchaseCost: number | string | Prisma.Decimal;
  currency?: string;
  moq?: number;
  packSize?: number;
  leadTimeDays?: number | null;
  isPreferred?: boolean;
  isActive?: boolean;
}

export interface UpdateSupplierProductInput {
  supplierSku?: string | null;
  purchaseCost?: number | string | Prisma.Decimal;
  currency?: string;
  moq?: number;
  packSize?: number;
  leadTimeDays?: number | null;
  isPreferred?: boolean;
  isActive?: boolean;
}

export class SupplierProductService {
  static async getSupplierProducts(params: SupplierProductQueryParams = {}) {
    return SupplierProductRepository.findSupplierProducts(params);
  }

  static async getSupplierProductById(id: string) {
    const sp = await SupplierProductRepository.findById(id);
    if (!sp) {
      throw new NotFoundException(`Supplier-Product link with ID '${id}' not found`);
    }
    return sp;
  }

  static async addSupplierProduct(input: CreateSupplierProductInput, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify supplier exists and is active
      const supplier = await SupplierRepository.findById(input.supplierId, tx);
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID '${input.supplierId}' not found`);
      }
      if (!supplier.isActive) {
        throw new BadRequestException(`Cannot map product: Supplier '${supplier.name}' (${supplier.code}) is inactive`);
      }

      // 2. Lock product row to prevent concurrency races on preferred supplier
      const product = await tx.product.findFirst({
        where: { id: input.productId, deletedAt: null },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID '${input.productId}' not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`Cannot map product: Product '${product.sku}' is inactive`);
      }

      // 3. Check for existing mapping
      const existing = await SupplierProductRepository.findBySupplierAndProduct(input.supplierId, input.productId, tx);
      if (existing) {
        throw new ConflictException(
          `Product '${product.sku}' is already mapped to supplier '${supplier.name}' (${supplier.code})`
        );
      }

      if (input.supplierSku && input.supplierSku.trim()) {
        const existingSku = await tx.supplierProduct.findFirst({
          where: {
            supplierId: input.supplierId,
            supplierSku: input.supplierSku.trim(),
            deletedAt: null,
          },
        });
        if (existingSku) {
          throw new ConflictException(
            `Supplier SKU '${input.supplierSku.trim()}' is already used for supplier '${supplier.name}'`
          );
        }
      }

      const costDecimal = new Prisma.Decimal(input.purchaseCost.toString());
      if (costDecimal.lessThan(0)) {
        throw new BadRequestException('Purchase cost must be a non-negative decimal amount');
      }

      if (input.moq !== undefined && input.moq < 1) {
        throw new BadRequestException('Minimum Order Quantity (MOQ) must be at least 1');
      }

      if (input.packSize !== undefined && input.packSize < 1) {
        throw new BadRequestException('Pack size must be at least 1');
      }

      // If preferred is true, lock product row and unset other preferred suppliers for this product
      if (input.isPreferred) {
        await tx.$executeRaw`SELECT id FROM products WHERE id = ${input.productId}::uuid FOR UPDATE`;
        await tx.supplierProduct.updateMany({
          where: { productId: input.productId },
          data: { isPreferred: false },
        });
      }

      const created = await SupplierProductRepository.create(
        {
          supplierId: input.supplierId,
          productId: input.productId,
          supplierSku: input.supplierSku?.trim() || null,
          purchaseCost: costDecimal,
          currency: input.currency || 'THB',
          moq: input.moq !== undefined ? input.moq : 1,
          packSize: input.packSize !== undefined ? input.packSize : 1,
          leadTimeDays: input.leadTimeDays !== undefined ? input.leadTimeDays : supplier.leadTimeDays,
          isPreferred: input.isPreferred !== undefined ? input.isPreferred : false,
          isActive: input.isActive !== undefined ? input.isActive : true,
        },
        tx
      );

      if (actorId) {
        await AuditRepository.record({
          userId: actorId,
          action: 'SUPPLIER_PRODUCT_MAPPED',
          resource: 'SupplierProduct',
          resourceId: created.id,
          after: {
            supplierId: created.supplierId,
            productId: created.productId,
            supplierSku: created.supplierSku,
            purchaseCost: created.purchaseCost.toString(),
          },
        });
      }

      return created;
    });
  }

  static async updateSupplierProduct(id: string, input: UpdateSupplierProductInput, actorId?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await SupplierProductRepository.findById(id, tx);
      if (!existing) {
        throw new NotFoundException(`Supplier-Product link with ID '${id}' not found`);
      }

      const updateData: Prisma.SupplierProductUpdateInput = {};

      if (input.supplierSku !== undefined) {
        updateData.supplierSku = input.supplierSku ? input.supplierSku.trim() : null;
      }

      if (input.purchaseCost !== undefined) {
        const costDecimal = new Prisma.Decimal(input.purchaseCost.toString());
        if (costDecimal.lessThan(0)) {
          throw new BadRequestException('Purchase cost must be a non-negative decimal amount');
        }
        updateData.purchaseCost = costDecimal;
      }

      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.moq !== undefined) {
        if (input.moq < 1) throw new BadRequestException('MOQ must be at least 1');
        updateData.moq = input.moq;
      }
      if (input.packSize !== undefined) {
        if (input.packSize < 1) throw new BadRequestException('Pack size must be at least 1');
        updateData.packSize = input.packSize;
      }
      if (input.leadTimeDays !== undefined) updateData.leadTimeDays = input.leadTimeDays;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      if (input.isPreferred !== undefined) {
        if (input.isPreferred) {
          await tx.$executeRaw`SELECT id FROM products WHERE id = ${existing.productId}::uuid FOR UPDATE`;
          await tx.supplierProduct.updateMany({
            where: { productId: existing.productId, id: { not: id } },
            data: { isPreferred: false },
          });
        }
        updateData.isPreferred = input.isPreferred;
      }

      const updated = await SupplierProductRepository.update(id, updateData, tx);

      if (actorId) {
        await AuditRepository.record({
          userId: actorId,
          action: 'SUPPLIER_PRODUCT_UPDATED',
          resource: 'SupplierProduct',
          resourceId: updated.id,
          before: {
            supplierSku: existing.supplierSku,
            purchaseCost: existing.purchaseCost.toString(),
            isPreferred: existing.isPreferred,
          },
          after: {
            supplierSku: updated.supplierSku,
            purchaseCost: updated.purchaseCost.toString(),
            isPreferred: updated.isPreferred,
          },
        });
      }

      return updated;
    });
  }

  static async removeSupplierProduct(id: string, actorId?: string) {
    const existing = await SupplierProductRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier-Product link with ID '${id}' not found`);
    }

    const deleted = await SupplierProductRepository.softDelete(id);

    if (actorId) {
      await AuditRepository.record({
        userId: actorId,
        action: 'SUPPLIER_PRODUCT_DELETED',
        resource: 'SupplierProduct',
        resourceId: id,
        before: { supplierId: existing.supplierId, productId: existing.productId },
      });
    }

    return { message: 'Supplier-Product relationship removed', item: deleted };
  }

  static async getMapping(supplierId: string, productId: string) {
    const sp = await SupplierProductRepository.findBySupplierAndProduct(supplierId, productId);
    if (!sp) {
      throw new NotFoundException(
        `Supplier-Product mapping for supplier '${supplierId}' and product '${productId}' not found`
      );
    }
    return sp;
  }
}
