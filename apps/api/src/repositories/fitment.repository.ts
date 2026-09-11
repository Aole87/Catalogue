import {
  prisma,
  ProductFitment,
  FitmentStatus,
  Prisma,
} from '@car-parts/database';
import { productDetailInclude } from './product.repository';
import { variantHierarchyInclude } from './vehicle.repository';

export interface CreateFitmentData {
  productId: string;
  vehicleVariantId: string;
  position?: string;
  notes?: string | null;
  fitmentStatus?: FitmentStatus;
}

export interface UpdateFitmentData {
  position?: string;
  notes?: string | null;
  fitmentStatus?: FitmentStatus;
}

export interface VariantProductsQueryOptions {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'sku';
  sortOrder?: 'asc' | 'desc';
}

export const fitmentDetailInclude = {
  vehicleVariant: {
    include: variantHierarchyInclude,
  },
  product: {
    select: { id: true, name: true, sku: true, slug: true, isActive: true },
  },
};

export class FitmentRepository {
  static async findFitment(
    productId: string,
    vehicleVariantId: string,
    position?: string
  ) {
    if (position) {
      return prisma.productFitment.findUnique({
        where: {
          productId_vehicleVariantId_position: {
            productId,
            vehicleVariantId,
            position,
          },
        },
        include: fitmentDetailInclude,
      });
    }

    // If position not specified, find any matching fitment record (e.g. ALL or first)
    return prisma.productFitment.findFirst({
      where: {
        productId,
        vehicleVariantId,
      },
      include: fitmentDetailInclude,
    });
  }

  static async findFitmentById(id: string) {
    return prisma.productFitment.findUnique({
      where: { id },
      include: fitmentDetailInclude,
    });
  }

  static async findFitmentsByProduct(productId: string) {
    return prisma.productFitment.findMany({
      where: { productId },
      include: {
        vehicleVariant: {
          include: variantHierarchyInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findFitmentsByVariant(
    vehicleVariantId: string,
    options: VariantProductsQueryOptions = {}
  ) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const productWhere: Prisma.ProductWhereInput = {
      isActive: true,
      isPublished: true,
      deletedAt: null,
    };

    if (options.categoryId) {
      productWhere.categoryId = options.categoryId;
    }
    if (options.brandId) {
      productWhere.brandId = options.brandId;
    }
    if (options.search && options.search.trim() !== '') {
      const term = options.search.trim();
      productWhere.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { brand: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const where: Prisma.ProductFitmentWhereInput = {
      vehicleVariantId,
      fitmentStatus: FitmentStatus.COMPATIBLE,
      product: productWhere,
    };

    const items = await prisma.productFitment.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        product: {
          include: productDetailInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.productFitment.count({ where });

    return {
      items: items.map((f) => ({
        ...f.product,
        fitmentPosition: f.position,
        fitmentNotes: f.notes,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  static async countByVariant(vehicleVariantId: string): Promise<number> {
    return prisma.productFitment.count({
      where: { vehicleVariantId },
    });
  }

  static async countByProduct(productId: string): Promise<number> {
    return prisma.productFitment.count({
      where: { productId },
    });
  }

  static async createFitment(data: CreateFitmentData): Promise<ProductFitment> {
    return prisma.productFitment.create({
      data: {
        productId: data.productId,
        vehicleVariantId: data.vehicleVariantId,
        position: data.position || 'ALL',
        notes: data.notes,
        fitmentStatus: data.fitmentStatus ?? FitmentStatus.COMPATIBLE,
      },
      include: fitmentDetailInclude,
    });
  }

  static async updateFitment(id: string, data: UpdateFitmentData) {
    return prisma.productFitment.update({
      where: { id },
      data,
      include: fitmentDetailInclude,
    });
  }

  static async deleteFitment(id: string): Promise<ProductFitment> {
    return prisma.productFitment.delete({
      where: { id },
    });
  }

  static async deleteByProductAndVariant(
    productId: string,
    vehicleVariantId: string,
    position?: string
  ) {
    if (position) {
      return prisma.productFitment.delete({
        where: {
          productId_vehicleVariantId_position: {
            productId,
            vehicleVariantId,
            position,
          },
        },
      });
    }

    return prisma.productFitment.deleteMany({
      where: {
        productId,
        vehicleVariantId,
      },
    });
  }
}
