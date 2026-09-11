import { prisma, Prisma } from '@car-parts/database';
import { SupplierRepository, SupplierQueryParams } from '../repositories/supplier.repository';
import { AuditRepository } from '../repositories/audit.repository';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '../errors/app-error';

export interface CreateSupplierInput {
  code: string;
  name: string;
  displayName?: string | null;
  taxId?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string;
  paymentTerms?: string | null;
  currency?: string;
  leadTimeDays?: number | null;
  isActive?: boolean;
  notes?: string | null;
}

export interface UpdateSupplierInput {
  code?: string;
  name?: string;
  displayName?: string | null;
  taxId?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  subdistrict?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string;
  paymentTerms?: string | null;
  currency?: string;
  leadTimeDays?: number | null;
  isActive?: boolean;
  notes?: string | null;
}

export class SupplierService {
  static async getSuppliers(params: SupplierQueryParams = {}) {
    return SupplierRepository.findSuppliers(params);
  }

  static async getSupplierById(id: string) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID '${id}' not found`);
    }
    return supplier;
  }

  static async createSupplier(input: CreateSupplierInput, actorId?: string) {
    const normalizedCode = input.code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new BadRequestException('Supplier code is mandatory');
    }

    const existing = await SupplierRepository.findByCode(normalizedCode);
    if (existing) {
      throw new ConflictException(`Supplier with code '${normalizedCode}' already exists`);
    }

    const supplier = await SupplierRepository.create({
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
      await AuditRepository.record({
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

  static async updateSupplier(id: string, input: UpdateSupplierInput, actorId?: string) {
    const existing = await SupplierRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier with ID '${id}' not found`);
    }

    const updateData: Prisma.SupplierUpdateInput = {};

    if (input.code) {
      const normalizedCode = input.code.trim().toUpperCase();
      if (normalizedCode !== existing.code) {
        const codeConflict = await SupplierRepository.findByCode(normalizedCode);
        if (codeConflict && codeConflict.id !== id) {
          throw new ConflictException(`Supplier with code '${normalizedCode}' already exists`);
        }
        updateData.code = normalizedCode;
      }
    }

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.displayName !== undefined) updateData.displayName = input.displayName ? input.displayName.trim() : null;
    if (input.taxId !== undefined) updateData.taxId = input.taxId ? input.taxId.trim() : null;
    if (input.contactName !== undefined) updateData.contactName = input.contactName ? input.contactName.trim() : null;
    if (input.email !== undefined) updateData.email = input.email ? input.email.trim().toLowerCase() : null;
    if (input.phone !== undefined) updateData.phone = input.phone ? input.phone.trim() : null;
    if (input.addressLine1 !== undefined) updateData.addressLine1 = input.addressLine1;
    if (input.addressLine2 !== undefined) updateData.addressLine2 = input.addressLine2;
    if (input.subdistrict !== undefined) updateData.subdistrict = input.subdistrict;
    if (input.district !== undefined) updateData.district = input.district;
    if (input.province !== undefined) updateData.province = input.province;
    if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.leadTimeDays !== undefined) updateData.leadTimeDays = input.leadTimeDays;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updated = await SupplierRepository.update(id, updateData);

    if (actorId) {
      await AuditRepository.record({
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

  static async deleteSupplier(id: string, actorId?: string) {
    const existing = await SupplierRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier with ID '${id}' not found`);
    }

    // Soft delete
    const deleted = await SupplierRepository.softDelete(id);

    if (actorId) {
      await AuditRepository.record({
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
