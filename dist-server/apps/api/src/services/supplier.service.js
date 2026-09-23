"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const supplier_repository_1 = require("../repositories/supplier.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class SupplierService {
    static async getSuppliers(params = {}) {
        return supplier_repository_1.SupplierRepository.findSuppliers(params);
    }
    static async getSupplierById(id) {
        const supplier = await supplier_repository_1.SupplierRepository.findById(id);
        if (!supplier) {
            throw new app_error_1.NotFoundException(`Supplier with ID '${id}' not found`);
        }
        return supplier;
    }
    static async createSupplier(input, actorId) {
        const normalizedCode = input.code.trim().toUpperCase();
        if (!normalizedCode) {
            throw new app_error_1.BadRequestException('Supplier code is mandatory');
        }
        const existing = await supplier_repository_1.SupplierRepository.findByCode(normalizedCode);
        if (existing) {
            throw new app_error_1.ConflictException(`Supplier with code '${normalizedCode}' already exists`);
        }
        const supplier = await supplier_repository_1.SupplierRepository.create({
            code: normalizedCode,
            name: input.name.trim(),
            displayName: input.displayName?.trim() || null,
            taxId: input.taxId?.trim() || null,
            contactName: input.contactName?.trim() || null,
            email: input.email?.trim().toLowerCase() || null,
            phone: input.phone?.trim() || null,
            addressLine1: input.addressLine1 || null,
            addressLine2: input.addressLine2 || null,
            subdistrict: input.subdistrict || null,
            district: input.district || null,
            province: input.province || null,
            postalCode: input.postalCode || null,
            country: input.country || 'TH',
            paymentTerms: input.paymentTerms || 'NET30',
            currency: input.currency || 'THB',
            leadTimeDays: input.leadTimeDays !== undefined ? input.leadTimeDays : 7,
            isActive: input.isActive !== undefined ? input.isActive : true,
            notes: input.notes || null,
        });
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SUPPLIER_CREATED',
                resource: 'Supplier',
                resourceId: supplier.id,
                after: {
                    code: supplier.code,
                    name: supplier.name,
                    isActive: supplier.isActive,
                },
            });
        }
        return supplier;
    }
    static async updateSupplier(id, input, actorId) {
        const existing = await supplier_repository_1.SupplierRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException(`Supplier with ID '${id}' not found`);
        }
        const updateData = {};
        if (input.code) {
            const normalizedCode = input.code.trim().toUpperCase();
            if (normalizedCode !== existing.code) {
                const codeConflict = await supplier_repository_1.SupplierRepository.findByCode(normalizedCode);
                if (codeConflict && codeConflict.id !== id) {
                    throw new app_error_1.ConflictException(`Supplier with code '${normalizedCode}' already exists`);
                }
                updateData.code = normalizedCode;
            }
        }
        if (input.name !== undefined)
            updateData.name = input.name.trim();
        if (input.displayName !== undefined)
            updateData.displayName = input.displayName ? input.displayName.trim() : null;
        if (input.taxId !== undefined)
            updateData.taxId = input.taxId ? input.taxId.trim() : null;
        if (input.contactName !== undefined)
            updateData.contactName = input.contactName ? input.contactName.trim() : null;
        if (input.email !== undefined)
            updateData.email = input.email ? input.email.trim().toLowerCase() : null;
        if (input.phone !== undefined)
            updateData.phone = input.phone ? input.phone.trim() : null;
        if (input.addressLine1 !== undefined)
            updateData.addressLine1 = input.addressLine1;
        if (input.addressLine2 !== undefined)
            updateData.addressLine2 = input.addressLine2;
        if (input.subdistrict !== undefined)
            updateData.subdistrict = input.subdistrict;
        if (input.district !== undefined)
            updateData.district = input.district;
        if (input.province !== undefined)
            updateData.province = input.province;
        if (input.postalCode !== undefined)
            updateData.postalCode = input.postalCode;
        if (input.country !== undefined)
            updateData.country = input.country;
        if (input.paymentTerms !== undefined)
            updateData.paymentTerms = input.paymentTerms;
        if (input.currency !== undefined)
            updateData.currency = input.currency;
        if (input.leadTimeDays !== undefined)
            updateData.leadTimeDays = input.leadTimeDays;
        if (input.isActive !== undefined)
            updateData.isActive = input.isActive;
        if (input.notes !== undefined)
            updateData.notes = input.notes;
        const updated = await supplier_repository_1.SupplierRepository.update(id, updateData);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SUPPLIER_UPDATED',
                resource: 'Supplier',
                resourceId: updated.id,
                before: { code: existing.code, name: existing.name, isActive: existing.isActive },
                after: { code: updated.code, name: updated.name, isActive: updated.isActive },
            });
        }
        return updated;
    }
    static async deleteSupplier(id, actorId) {
        const existing = await supplier_repository_1.SupplierRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException(`Supplier with ID '${id}' not found`);
        }
        // Soft delete
        const deleted = await supplier_repository_1.SupplierRepository.softDelete(id);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'SUPPLIER_DEACTIVATED',
                resource: 'Supplier',
                resourceId: deleted.id,
                before: { isActive: existing.isActive, deletedAt: existing.deletedAt },
                after: { isActive: false, deletedAt: deleted.deletedAt },
            });
        }
        return { message: `Supplier '${existing.name}' (${existing.code}) has been deactivated`, supplier: deleted };
    }
}
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map