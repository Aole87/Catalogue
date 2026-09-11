import { FitmentStatus, PriceTier } from '@car-parts/database';
import { FitmentRepository, CreateFitmentData, UpdateFitmentData, VariantProductsQueryOptions } from '../repositories/fitment.repository';
import { ProductRepository } from '../repositories/product.repository';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/app-error';

export type FitmentReasonCode =
  | 'EXPLICIT_FITMENT'
  | 'NO_FITMENT_RECORD'
  | 'INSUFFICIENT_VEHICLE_SPECIFICATION'
  | 'INVALID_PRODUCT'
  | 'INVALID_VEHICLE';

export interface CompatibilityCheckResult {
  productId: string;
  vehicleVariantId: string | null;
  compatible: boolean;
  reason: FitmentReasonCode;
  fitment?: {
    id: string;
    position: string;
    notes?: string | null;
    status: FitmentStatus;
    vehicle?: {
      make: string;
      model: string;
      generation: string;
      variant: string;
      engine?: string | null;
      yearRange?: string | null;
    };
  } | null;
}

export class FitmentService {
  /**
   * Deterministic Fitment Engine — Single Source of Truth
   * Answers: "Can this part fit this vehicle?"
   * Strictly enforces that ONLY explicit PostgreSQL ProductFitment records produce compatible = true.
   * AI, semantic search, fuzzy matching, and product title guessing are strictly prohibited.
   */
  static async checkProductFitment(
    productId: string,
    vehicleVariantId?: string | null,
    position?: string
  ): Promise<CompatibilityCheckResult> {
    // 1. Validate Product
    const product = await ProductRepository.findById(productId, false);
    if (!product || product.deletedAt) {
      return {
        productId,
        vehicleVariantId: vehicleVariantId || null,
        compatible: false,
        reason: 'INVALID_PRODUCT',
        fitment: null,
      };
    }

    // 2. Validate Vehicle Variant Specification
    if (!vehicleVariantId || vehicleVariantId.trim() === '') {
      return {
        productId,
        vehicleVariantId: null,
        compatible: false,
        reason: 'INSUFFICIENT_VEHICLE_SPECIFICATION',
        fitment: null,
      };
    }

    const variant = await VehicleRepository.findVariantById(vehicleVariantId, true);
    if (!variant || !variant.isActive) {
      return {
        productId,
        vehicleVariantId,
        compatible: false,
        reason: 'INVALID_VEHICLE',
        fitment: null,
      };
    }

    // 3. Query Authoritative Structured ProductFitment Record
    const fitment = await FitmentRepository.findFitment(productId, vehicleVariantId, position);

    if (fitment && fitment.fitmentStatus === FitmentStatus.COMPATIBLE) {
      const f = fitment as any;
      const v = f.vehicleVariant;
      const gen = v?.generation;
      const model = gen?.model;
      const make = model?.make;

      const yearRange =
        v?.startYear || v?.endYear
          ? `${v.startYear || ''}-${v.endYear || 'Present'}`
          : gen ? `${gen.startYear}-${gen.endYear || 'Present'}` : null;

      return {
        productId,
        vehicleVariantId,
        compatible: true,
        reason: 'EXPLICIT_FITMENT',
        fitment: {
          id: fitment.id,
          position: fitment.position,
          notes: fitment.notes,
          status: fitment.fitmentStatus,
          vehicle: {
            make: make.name,
            model: model.name,
            generation: gen.name,
            variant: v.name,
            engine: v.engine ? v.engine.name : null,
            yearRange,
          },
        },
      };
    }

    // 4. Default: No valid structured compatibility record -> Deterministic Negative
    return {
      productId,
      vehicleVariantId,
      compatible: false,
      reason: 'NO_FITMENT_RECORD',
      fitment: null,
    };
  }

  /**
   * Find all products compatible with a specific vehicle variant (Storefront API)
   */
  static async getCompatibleProducts(
    vehicleVariantId: string,
    options: VariantProductsQueryOptions,
    userTier: PriceTier = PriceTier.GENERAL
  ) {
    const variant = await VehicleRepository.findVariantById(vehicleVariantId, true);
    if (!variant || !variant.isActive) {
      throw new NotFoundError('Vehicle variant not found or inactive');
    }

    const result = await FitmentRepository.findFitmentsByVariant(vehicleVariantId, options);

    const formatPriceDecimal = (val: any) => {
      if (val === null || val === undefined) return null;
      return Number(val).toFixed(2);
    };

    const formattedItems = result.items.map((prod: any) => {
      const tierPrice =
        prod.prices?.find((p: any) => p.tier === userTier && p.isActive !== false) ||
        prod.prices?.find((p: any) => p.tier === PriceTier.GENERAL && p.isActive !== false) ||
        prod.prices?.[0] ||
        null;

      const primaryImg =
        prod.images?.find((img: any) => img.isPrimary) ||
        prod.images?.[0] ||
        null;

      return {
        ...prod,
        effectivePrice: tierPrice
          ? {
              amount: formatPriceDecimal(tierPrice.price),
              compareAtPrice: formatPriceDecimal(tierPrice.compareAtPrice),
              tier: tierPrice.tier,
              currency: tierPrice.currency,
            }
          : null,
        primaryImage: primaryImg ? primaryImg.url : null,
      };
    });

    const v = variant as any;
    const gen = v.generation;
    const model = gen?.model;
    const make = model?.make;

    return {
      vehicle: {
        id: variant.id,
        make: make ? make.name : '',
        model: model ? model.name : '',
        generation: gen ? gen.name : '',
        variant: variant.name,
        engine: v.engine ? v.engine.name : null,
      },
      items: formattedItems,
      pagination: result.pagination,
    };
  }

  /**
   * Get all vehicle fitment entries for a specific product
   */
  static async getProductFitments(productId: string) {
    const product = await ProductRepository.findById(productId, false);
    if (!product || product.deletedAt) {
      throw new NotFoundError('Product not found');
    }

    const fitments = await FitmentRepository.findFitmentsByProduct(productId);
    return fitments.map((f: any) => {
      const v = f.vehicleVariant;
      const gen = v?.generation;
      const model = gen?.model;
      const make = model?.make;

      return {
        id: f.id,
        productId: f.productId,
        position: f.position,
        notes: f.notes,
        fitmentStatus: f.fitmentStatus,
        vehicleVariant: v
          ? {
              id: v.id,
              name: v.name,
              transmission: v.transmission,
              bodyType: v.bodyType,
              drivetrain: v.drivetrain,
              startYear: v.startYear,
              endYear: v.endYear,
              generation: gen
                ? {
                    id: gen.id,
                    name: gen.name,
                    code: gen.code,
                    startYear: gen.startYear,
                    endYear: gen.endYear,
                    model: model
                      ? {
                          id: model.id,
                          name: model.name,
                          slug: model.slug,
                          make: make
                            ? {
                                id: make.id,
                                name: make.name,
                                slug: make.slug,
                              }
                            : null,
                        }
                      : null,
                  }
                : null,
              engine: v.engine
                ? {
                    id: v.engine.id,
                    name: v.engine.name,
                    engineCode: v.engine.engineCode,
                    fuelType: v.engine.fuelType,
                    displacementCc: v.engine.displacementCc,
                  }
                : null,
            }
          : null,
      };
    });
  }

  // ==========================================
  // ADMIN FITMENT CRUD (WITH RBAC & AUDIT LOGS)
  // ==========================================
  static async createFitment(
    adminUserId: string,
    data: CreateFitmentData,
    ipAddress?: string,
    userAgent?: string
  ) {
    const product = await ProductRepository.findById(data.productId, false);
    if (!product || product.deletedAt) {
      throw new NotFoundError('Product not found');
    }

    const variant = await VehicleRepository.findVariantById(data.vehicleVariantId, false);
    if (!variant) {
      throw new NotFoundError('Vehicle variant not found');
    }

    const position = data.position || 'ALL';
    const existing = await FitmentRepository.findFitment(data.productId, data.vehicleVariantId, position);
    if (existing) {
      throw new ConflictError(
        `Fitment already exists for this product, vehicle variant, and position (${position})`
      );
    }

    const fitment = await FitmentRepository.createFitment({
      ...data,
      position,
    });

    await AuditRepository.record({
      userId: adminUserId,
      action: 'FITMENT_CREATED',
      resource: 'ProductFitment',
      resourceId: fitment.id,
      after: {
        id: fitment.id,
        productId: fitment.productId,
        vehicleVariantId: fitment.vehicleVariantId,
        position: fitment.position,
        notes: fitment.notes,
        fitmentStatus: fitment.fitmentStatus,
      },
      ipAddress,
      userAgent,
    });

    return fitment;
  }

  static async updateFitment(
    adminUserId: string,
    fitmentId: string,
    data: UpdateFitmentData,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await FitmentRepository.findFitmentById(fitmentId);
    if (!existing) {
      throw new NotFoundError('Fitment record not found');
    }

    if (data.position && data.position !== existing.position) {
      const collision = await FitmentRepository.findFitment(
        existing.productId,
        existing.vehicleVariantId,
        data.position
      );
      if (collision && collision.id !== fitmentId) {
        throw new ConflictError(
          `Another fitment already exists for position ${data.position}`
        );
      }
    }

    const updated = await FitmentRepository.updateFitment(fitmentId, data);

    await AuditRepository.record({
      userId: adminUserId,
      action: 'FITMENT_UPDATED',
      resource: 'ProductFitment',
      resourceId: updated.id,
      before: {
        position: existing.position,
        notes: existing.notes,
        fitmentStatus: existing.fitmentStatus,
      },
      after: {
        position: updated.position,
        notes: updated.notes,
        fitmentStatus: updated.fitmentStatus,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  static async deleteFitment(
    adminUserId: string,
    fitmentId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await FitmentRepository.findFitmentById(fitmentId);
    if (!existing) {
      throw new NotFoundError('Fitment record not found');
    }

    const deleted = await FitmentRepository.deleteFitment(fitmentId);

    await AuditRepository.record({
      userId: adminUserId,
      action: 'FITMENT_DELETED',
      resource: 'ProductFitment',
      resourceId: fitmentId,
      before: {
        id: existing.id,
        productId: existing.productId,
        vehicleVariantId: existing.vehicleVariantId,
        position: existing.position,
      },
      ipAddress,
      userAgent,
    });

    return deleted;
  }
}
