import { BrandRepository } from '../repositories/brand.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { CreateBrandInput, UpdateBrandInput } from '../schemas/brand.schema';
import { NotFoundException, ConflictException } from '../errors/app-error';

export class BrandService {
  static async listBrands(onlyActive = false) {
    return BrandRepository.findAll({ onlyActive });
  }

  static async getBrandById(id: string) {
    const brand = await BrandRepository.findById(id);
    if (!brand || brand.deletedAt) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  static async getBrandBySlug(slug: string) {
    const brand = await BrandRepository.findBySlug(slug);
    if (!brand || brand.deletedAt) {
      throw new NotFoundException(`Brand with slug '${slug}' not found`);
    }
    return brand;
  }

  static async createBrand(
    input: CreateBrandInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    // 1. Verify slug uniqueness
    const existingSlug = await BrandRepository.findBySlug(input.slug);
    if (existingSlug && !existingSlug.deletedAt) {
      throw new ConflictException(`Brand slug '${input.slug}' is already in use`);
    }

    // 2. Verify name uniqueness
    const existingName = await BrandRepository.findByName(input.name);
    if (existingName && !existingName.deletedAt) {
      throw new ConflictException(`Brand with name '${input.name}' already exists`);
    }

    const brand = await BrandRepository.create(input);

    // 3. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'BRAND_CREATED',
      resource: 'brand',
      resourceId: brand.id,
      after: { name: brand.name, slug: brand.slug },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return brand;
  }

  static async updateBrand(
    id: string,
    input: UpdateBrandInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await this.getBrandById(id);

    // 1. Verify slug collision if slug changed
    if (input.slug && input.slug !== existing.slug) {
      const duplicateSlug = await BrandRepository.findBySlug(input.slug);
      if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
        throw new ConflictException(`Brand slug '${input.slug}' is already in use`);
      }
    }

    // 2. Verify name collision if name changed
    if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicateName = await BrandRepository.findByName(input.name);
      if (duplicateName && duplicateName.id !== id && !duplicateName.deletedAt) {
        throw new ConflictException(`Brand with name '${input.name}' already exists`);
      }
    }

    const updated = await BrandRepository.update(id, input);

    // 3. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'BRAND_UPDATED',
      resource: 'brand',
      resourceId: updated.id,
      before: { name: existing.name, slug: existing.slug },
      after: { name: updated.name, slug: updated.slug },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updated;
  }

  static async deleteBrand(
    id: string,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await this.getBrandById(id);

    // Safety check: Check for assigned active products
    const productCount = await BrandRepository.countProducts(id);
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete brand '${existing.name}' because ${productCount} active product(s) are associated with it. Reassign products first.`
      );
    }

    const deleted = await BrandRepository.softDelete(id);

    // Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'BRAND_DELETED',
      resource: 'brand',
      resourceId: deleted.id,
      before: { name: existing.name, slug: existing.slug },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return deleted;
  }
}
