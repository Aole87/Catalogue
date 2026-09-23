"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierProductService = void 0;
const database_1 = require("@car-parts/database");
const supplier_product_repository_1 = require("../repositories/supplier-product.repository");
const supplier_repository_1 = require("../repositories/supplier.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class SupplierProductService {
    static async getSupplierProducts(params = {}) {
        return supplier_product_repository_1.SupplierProductRepository.findSupplierProducts(params);
    }
    static async getSupplierProductById(id) {
        const sp = await supplier_product_repository_1.SupplierProductRepository.findById(id);
        if (!sp) {
            throw new app_error_1.NotFoundException(`Supplier-Product link with ID '${id}' not found`);
        }
        return sp;
    }
    static async addSupplierProduct(input, actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Verify supplier exists and is active
            const supplier = await supplier_repository_1.SupplierRepository.findById(input.supplierId, tx);
            if (!supplier) {
                throw new app_error_1.NotFoundException(`Supplier with ID '${input.supplierId}' not found`);
            }
            if (!supplier.isActive) {
                throw new app_error_1.BadRequestException(`Cannot map product: Supplier '${supplier.name}' (${supplier.code}) is inactive`);
            }
            // 2. Lock product row to prevent concurrency races on preferred supplier
            const product = await tx.product.findFirst({
                where: { id: input.productId, deletedAt: null },
            });
            if (!product) {
                throw new app_error_1.NotFoundException(`Product with ID '${input.productId}' not found`);
            }
            if (!product.isActive) {
                throw new app_error_1.BadRequestException(`Cannot map product: Product '${product.sku}' is inactive`);
            }
            // 3. Check for existing mapping
            const existing = await supplier_product_repository_1.SupplierProductRepository.findBySupplierAndProduct(input.supplierId, input.productId, tx);
            if (existing) {
                throw new app_error_1.ConflictException(`Product '${product.sku}' is already mapped to supplier '${supplier.name}' (${supplier.code})`);
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
                    throw new app_error_1.ConflictException(`Supplier SKU '${input.supplierSku.trim()}' is already used for supplier '${supplier.name}'`);
                }
            }
            const costDecimal = new database_1.Prisma.Decimal(input.purchaseCost.toString());
            if (costDecimal.lessThan(0)) {
                throw new app_error_1.BadRequestException('Purchase cost must be a non-negative decimal amount');
            }
            if (input.moq !== undefined && input.moq < 1) {
                throw new app_error_1.BadRequestException('Minimum Order Quantity (MOQ) must be at least 1');
            }
            if (input.packSize !== undefined && input.packSize < 1) {
                throw new app_error_1.BadRequestException('Pack size must be at least 1');
            }
            // If preferred is true, lock product row and unset other preferred suppliers for this product
            if (input.isPreferred) {
                await tx.$executeRaw `SELECT id FROM products WHERE id = ${input.productId}::uuid FOR UPDATE`;
                await tx.supplierProduct.updateMany({
                    where: { productId: input.productId },
                    data: { isPreferred: false },
                });
            }
            const created = await supplier_product_repository_1.SupplierProductRepository.create({
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
            }, tx);
            if (actorId) {
                await audit_repository_1.AuditRepository.record({
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
    static async updateSupplierProduct(id, input, actorId) {
        return database_1.prisma.$transaction(async (tx) => {
            const existing = await supplier_product_repository_1.SupplierProductRepository.findById(id, tx);
            if (!existing) {
                throw new app_error_1.NotFoundException(`Supplier-Product link with ID '${id}' not found`);
            }
            const updateData = {};
            if (input.supplierSku !== undefined) {
                updateData.supplierSku = input.supplierSku ? input.supplierSku.trim() : null;
            }
            if (input.purchaseCost !== undefined) {
                const costDecimal = new database_1.Prisma.Decimal(input.purchaseCost.toString());
                if (costDecimal.lessThan(0)) {
                    throw new app_error_1.BadRequestException('Purchase cost must be a non-negative decimal amount');
                }
                updateData.purchaseCost = costDecimal;
            }
            if (input.currency !== undefined)
                updateData.currency = input.currency;
            if (input.moq !== undefined) {
                if (input.moq < 1)
                    throw new app_error_1.BadRequestException('MOQ must be at least 1');
                updateData.moq = input.moq;
            }
            if (input.packSize !== undefined) {
                if (input.packSize < 1)
                    throw new app_error_1.BadRequestException('Pack size must be at least 1');
                updateData.packSize = input.packSize;
            }
            if (input.leadTimeDays !== undefined)
                updateData.leadTimeDays = input.leadTimeDays;
            if (input.isActive !== undefined)
                updateData.isActive = input.isActive;
            if (input.isPreferred !== undefined) {
                if (input.isPreferred) {
                    await tx.$executeRaw `SELECT id FROM products WHERE id = ${existing.productId}::uuid FOR UPDATE`;
                    await tx.supplierProduct.updateMany({
                        where: { productId: existing.productId, id: { not: id } },
                        data: { isPreferred: false },
                    });
                }
                updateData.isPreferred = input.isPreferred;
            }
            const updated = await supplier_product_repository_1.SupplierProductRepository.update(id, updateData, tx);
            if (actorId) {
                await audit_repository_1.AuditRepository.record({
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
    static async removeSupplierProduct(id, actorId) {
        const existing = await supplier_product_repository_1.SupplierProductRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException(`Supplier-Product link with ID '${id}' not found`);
        }
        const deleted = await supplier_product_repository_1.SupplierProductRepository.softDelete(id);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SUPPLIER_PRODUCT_DELETED',
                resource: 'SupplierProduct',
                resourceId: id,
                before: { supplierId: existing.supplierId, productId: existing.productId },
            });
        }
        return { message: 'Supplier-Product relationship removed', item: deleted };
    }
    static async getMapping(supplierId, productId) {
        const sp = await supplier_product_repository_1.SupplierProductRepository.findBySupplierAndProduct(supplierId, productId);
        if (!sp) {
            throw new app_error_1.NotFoundException(`Supplier-Product mapping for supplier '${supplierId}' and product '${productId}' not found`);
        }
        return sp;
    }
}
exports.SupplierProductService = SupplierProductService;
//# sourceMappingURL=supplier-product.service.js.map