import { ProductRepository, ProductQueryFilters } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { BrandRepository } from '../repositories/brand.repository';
import { AuditRepository } from '../repositories/audit.repository';
import {
  CreateProductInput,
  UpdateProductInput,
  UpdateProductPricesInput,
  ProductQueryParams,
} from '../schemas/product.schema';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '../errors/app-error';
import { PriceTier } from '@prisma/client';

export class ProductService {
  private static formatProductForResponse(product: any, userTier: PriceTier = PriceTier.GENERAL) {
    if (!product) return null;

    const formatPriceDecimal = (val: any) => {
      if (val === null || val === undefined) return null;
      return Number(val).toFixed(2);
    };

    // Resolve authoritative active price for user's price tier (fallback to GENERAL)
    const tierPrice =
      product.prices?.find((p: any) => p.tier === userTier && p.isActive !== false) ||
      product.prices?.find((p: any) => p.tier === PriceTier.GENERAL && p.isActive !== false) ||
      product.prices?.[0] ||
      null;

    const primaryImage =
      product.images?.find((img: any) => img.isPrimary) ||
      product.images?.[0] ||
      null;

    const formattedPrices = product.prices?.map((p: any) => ({
      ...p,
      price: formatPriceDecimal(p.price),
      compareAtPrice: formatPriceDecimal(p.compareAtPrice),
      costPrice: formatPriceDecimal(p.costPrice),
    }));

    return {
      ...product,
      prices: formattedPrices || product.prices,
      effectivePrice: tierPrice
        ? {
            amount: formatPriceDecimal(tierPrice.price),
            compareAtPrice: formatPriceDecimal(tierPrice.compareAtPrice),
            tier: tierPrice.tier,
            currency: tierPrice.currency,
          }
        : null,
      primaryImage: primaryImage ? primaryImage.url : null,
    };
  }

  static async listStorefrontProducts(query: ProductQueryParams, userTier: PriceTier = PriceTier.GENERAL) {
    const filters: ProductQueryFilters = {
      page: query.page,
      pageSize: query.pageSize,
      vehicleVariantId: query.vehicleVariantId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      search: query.search || query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      isActive: true,
      isPublished: true,
      includeDeleted: false,
    };

    // Category resolution: support ID or slug, and include subcategories
    if (query.categoryId) {
      const descendantIds = await CategoryRepository.getAllDescendantIds(query.categoryId);
      filters.categoryIds = [query.categoryId, ...descendantIds];
    } else if (query.category) {
      const cat = await CategoryRepository.findBySlug(query.category);
      if (cat) {
        const descendantIds = await CategoryRepository.getAllDescendantIds(cat.id);
        filters.categoryIds = [cat.id, ...descendantIds];
      }
    }

    // Brand resolution: support ID or slug
    if (query.brandId) {
      filters.brandId = query.brandId;
    } else if (query.brand) {
      const br = await BrandRepository.findBySlug(query.brand);
      if (br) {
        filters.brandId = br.id;
      }
    }

    const result = await ProductRepository.findMany(filters);

    return {
      items: result.items.map((item) => this.formatProductForResponse(item, userTier)),
      pagination: result.pagination,
    };
  }

  static async listAdminProducts(query: ProductQueryParams) {
    const filters: ProductQueryFilters = {
      page: query.page,
      pageSize: query.pageSize,
      vehicleVariantId: query.vehicleVariantId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      search: query.search || query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      isActive: query.isActive,
      isPublished: query.isPublished,
      includeDeleted: false,
    };

    if (query.categoryId) {
      filters.categoryId = query.categoryId;
    }
    if (query.brandId) {
      filters.brandId = query.brandId;
    }

    const result = await ProductRepository.findMany(filters);

    return {
      items: result.items.map((item) => this.formatProductForResponse(item)),
      pagination: result.pagination,
    };
  }

  static async getProductById(id: string, userTier: PriceTier = PriceTier.GENERAL, isStorefront = false) {
    const product = await ProductRepository.findById(id);
    if (!product || product.deletedAt || (isStorefront && (!product.isActive || !product.isPublished))) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.formatProductForResponse(product, userTier);
  }

  static async getProductBySlug(slug: string, userTier: PriceTier = PriceTier.GENERAL, isStorefront = false) {
    const product = await ProductRepository.findBySlug(slug);
    if (!product || product.deletedAt || (isStorefront && (!product.isActive || !product.isPublished))) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }
    return this.formatProductForResponse(product, userTier);
  }

  static async createProduct(
    input: CreateProductInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    // 1. Verify SKU uniqueness
    const existingSku = await ProductRepository.findBySku(input.sku);
    if (existingSku && !existingSku.deletedAt) {
      throw new ConflictException(`Product with SKU '${input.sku}' already exists`);
    }

    // 2. Verify Slug uniqueness
    const existingSlug = await ProductRepository.findBySlug(input.slug);
    if (existingSlug && !existingSlug.deletedAt) {
      throw new ConflictException(`Product slug '${input.slug}' is already in use`);
    }

    // 3. Verify Category and Brand existence
    const category = await CategoryRepository.findById(input.categoryId);
    if (!category || category.deletedAt) {
      throw new BadRequestException(`Category with ID ${input.categoryId} does not exist`);
    }

    const brand = await BrandRepository.findById(input.brandId);
    if (!brand || brand.deletedAt) {
      throw new BadRequestException(`Brand with ID ${input.brandId} does not exist`);
    }

    // 4. Create Product with transaction
    const product = await ProductRepository.create(input);

    // 5. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'PRODUCT_CREATED',
      resource: 'product',
      resourceId: product!.id,
      after: {
        sku: product!.sku,
        name: product!.name,
        brandId: product!.brandId,
        categoryId: product!.categoryId,
      },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return this.formatProductForResponse(product);
  }

  static async updateProduct(
    id: string,
    input: UpdateProductInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await ProductRepository.findById(id, false);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 1. Verify SKU collision if changed
    if (input.sku && input.sku !== existing.sku) {
      const duplicateSku = await ProductRepository.findBySku(input.sku);
      if (duplicateSku && duplicateSku.id !== id && !duplicateSku.deletedAt) {
        throw new ConflictException(`Product SKU '${input.sku}' is already in use`);
      }
    }

    // 2. Verify Slug collision if changed
    if (input.slug && input.slug !== existing.slug) {
      const duplicateSlug = await ProductRepository.findBySlug(input.slug);
      if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
        throw new ConflictException(`Product slug '${input.slug}' is already in use`);
      }
    }

    // 3. Verify Category / Brand if updated
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await CategoryRepository.findById(input.categoryId);
      if (!category || category.deletedAt) {
        throw new BadRequestException(`Category with ID ${input.categoryId} does not exist`);
      }
    }

    if (input.brandId && input.brandId !== existing.brandId) {
      const brand = await BrandRepository.findById(input.brandId);
      if (!brand || brand.deletedAt) {
        throw new BadRequestException(`Brand with ID ${input.brandId} does not exist`);
      }
    }

    const updated = await ProductRepository.update(id, input);

    // 4. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'PRODUCT_UPDATED',
      resource: 'product',
      resourceId: id,
      before: { sku: existing.sku, name: existing.name },
      after: { sku: updated!.sku, name: updated!.name },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return this.formatProductForResponse(updated);
  }

  static async deleteProduct(
    id: string,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await ProductRepository.findById(id, false);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const deleted = await ProductRepository.softDelete(id);

    // Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'PRODUCT_DELETED',
      resource: 'product',
      resourceId: id,
      before: { sku: existing.sku, name: existing.name },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return deleted;
  }

  static async updateProductPrices(
    id: string,
    input: UpdateProductPricesInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await ProductRepository.findById(id, false);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    for (const p of input.prices) {
      await ProductRepository.updatePrice(id, p.tier, p.price, p.compareAtPrice, p.costPrice);
    }

    const updatedProduct = await ProductRepository.findById(id, true);

    // Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'PRICE_UPDATED',
      resource: 'product',
      resourceId: id,
      after: { prices: input.prices },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return this.formatProductForResponse(updatedProduct);
  }
}
